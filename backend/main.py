from fastapi import FastAPI, Depends, HTTPException, status, Body, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Dict, Any, Optional
import os
import asyncio
import csv
import io
import urllib.request

from . import models, schemas, database, auth
from .database import engine
from .bot import bot, dp

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Video Lessons API")

# Store the background task
bot_task = None

@app.on_event("startup")
async def on_startup():
    global bot_task
    if bot:
        # Start bot polling in background
        bot_task = asyncio.create_task(dp.start_polling(bot))

@app.on_event("shutdown")
async def on_shutdown():
    global bot_task
    if bot_task:
        bot_task.cancel()
    if bot:
        await bot.session.close()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/auth/me", response_model=schemas.UserData)
def get_me(user: dict = Depends(auth.get_current_user)):
    return user

@app.get("/categories", response_model=List[schemas.Category])
def read_categories(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    categories = db.query(models.Category).offset(skip).limit(limit).all()
    return categories

@app.post("/categories", response_model=schemas.Category)
def create_category(category: schemas.CategoryCreate, db: Session = Depends(database.get_db), user: dict = Depends(auth.get_current_user)):
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Not authorized")
    db_category = models.Category(name=category.name)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@app.delete("/categories/{category_id}")
def delete_category(category_id: int, db: Session = Depends(database.get_db), user: dict = Depends(auth.get_current_user)):
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Not authorized")
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(category)
    db.commit()
    return {"ok": True}

@app.get("/lessons", response_model=List[schemas.Lesson])
def read_lessons(category_id: Optional[int] = None, db: Session = Depends(database.get_db), user: dict = Depends(auth.get_current_user)):
    query = db.query(models.Lesson)
    if category_id is not None:
        query = query.filter(models.Lesson.category_id == category_id)
    lessons = query.all()
    
    # Mark favorites
    favs = db.query(models.Favorite).filter(models.Favorite.user_id == user["id"]).all()
    fav_ids = {f.lesson_id for f in favs}
    
    for l in lessons:
        l.is_favorite = l.id in fav_ids
    return lessons

@app.get("/lessons/search", response_model=List[schemas.Lesson])
def search_lessons(q: str, db: Session = Depends(database.get_db), user: dict = Depends(auth.get_current_user)):
    search = f"%{q}%"
    lessons = db.query(models.Lesson).join(models.Category).filter(
        or_(
            models.Lesson.topic.ilike(search),
            models.Lesson.speaker.ilike(search),
            models.Category.name.ilike(search)
        )
    ).all()
    
    favs = db.query(models.Favorite).filter(models.Favorite.user_id == user["id"]).all()
    fav_ids = {f.lesson_id for f in favs}
    for l in lessons:
        l.is_favorite = l.id in fav_ids
    return lessons

@app.post("/lessons", response_model=schemas.Lesson)
def create_lesson(lesson: schemas.LessonCreate, db: Session = Depends(database.get_db), user: dict = Depends(auth.get_current_user)):
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Not authorized")
    db_lesson = models.Lesson(**lesson.dict())
    db.add(db_lesson)
    db.commit()
    db.refresh(db_lesson)
    return db_lesson

@app.delete("/lessons/{lesson_id}")
def delete_lesson(lesson_id: int, db: Session = Depends(database.get_db), user: dict = Depends(auth.get_current_user)):
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Not authorized")
    lesson = db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    db.delete(lesson)
    db.commit()
    return {"ok": True}

# Favorites
@app.get("/favorites", response_model=List[schemas.Lesson])
def get_favorites(db: Session = Depends(database.get_db), user: dict = Depends(auth.get_current_user)):
    user_id = user["id"]
    favs = db.query(models.Favorite).filter(models.Favorite.user_id == user_id).all()
    lesson_ids = [f.lesson_id for f in favs]
    lessons = db.query(models.Lesson).filter(models.Lesson.id.in_(lesson_ids)).all()
    for l in lessons:
        l.is_favorite = True
    return lessons

@app.post("/favorites", response_model=schemas.Favorite)
def add_favorite(favorite: schemas.FavoriteBase, db: Session = Depends(database.get_db), user: dict = Depends(auth.get_current_user)):
    user_id = user["id"]
    existing = db.query(models.Favorite).filter(models.Favorite.user_id == user_id, models.Favorite.lesson_id == favorite.lesson_id).first()
    if existing:
        return existing
    db_fav = models.Favorite(user_id=user_id, lesson_id=favorite.lesson_id)
    db.add(db_fav)
    db.commit()
    db.refresh(db_fav)
    return db_fav

@app.delete("/favorites/{lesson_id}")
def delete_favorite(lesson_id: int, db: Session = Depends(database.get_db), user: dict = Depends(auth.get_current_user)):
    user_id = user["id"]
    fav = db.query(models.Favorite).filter(models.Favorite.user_id == user_id, models.Favorite.lesson_id == lesson_id).first()
    if fav:
        db.delete(fav)
        db.commit()
    return {"ok": True}

class SheetImportRequest(schemas.BaseModel):
    sheet_id: str

@app.post("/import/sheets")
def import_from_sheets(data: SheetImportRequest, db: Session = Depends(database.get_db), user: dict = Depends(auth.get_current_user)):
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    sheet_id = data.sheet_id
    if "spreadsheets/d/" in sheet_id:
        # Extract ID from full URL
        try:
            sheet_id = sheet_id.split("spreadsheets/d/")[1].split("/")[0]
        except IndexError:
            raise HTTPException(status_code=400, detail="Invalid Google Sheets URL format.")
            
    # Use gviz endpoint for CSV export which is more reliable
    url = f"https://docs.google.com/spreadsheets/d/{sheet_id}/gviz/tq?tqx=out:csv"
    
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as response:
            content = response.read().decode('utf-8')
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch Google Sheet: {e}")
        
    reader = csv.DictReader(io.StringIO(content))
    imported_count = 0
    
    for row in reader:
        # Based on actual CSV output from the provided sheet:
        # ['Speaker', 'Mavzu', 'Rubrika', 'Topic Mavzu', 'Topic', 'Davomiyligi', 'link']
        cat_name = row.get("Topic Mavzu", row.get("category", row.get("категория", ""))).strip()
        speaker = row.get("Speaker", row.get("speaker", row.get("спикер", ""))).strip()
        topic = row.get("Mavzu", row.get("topic", row.get("тема", ""))).strip()
        duration = row.get("Davomiyligi", row.get("duration", row.get("длительность", ""))).strip()
        link = row.get("link", row.get("ссылка", row.get("ссылка на Telegram сообщение", ""))).strip()
        
        if not topic or not link or not cat_name:
            continue
            
        # Find or create category
        category = db.query(models.Category).filter(models.Category.name == cat_name).first()
        if not category:
            category = models.Category(name=cat_name)
            db.add(category)
            db.commit()
            db.refresh(category)
            
        # Check if lesson already exists by link
        lesson = db.query(models.Lesson).filter(models.Lesson.link == link).first()
        if not lesson:
            lesson = models.Lesson(topic=topic, speaker=speaker, duration=duration, link=link, category_id=category.id)
            db.add(lesson)
            db.commit()
            imported_count += 1
            
    return {"ok": True, "imported": imported_count}

# Mount frontend build directory if it exists
frontend_build_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.exists(frontend_build_path):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_build_path, "assets")), name="assets")

    @app.get("/{full_path:path}", response_class=HTMLResponse)
    async def serve_frontend(request: Request, full_path: str):
        # Allow API routes to pass through
        if full_path.startswith("auth/") or full_path.startswith("categories") or full_path.startswith("lessons") or full_path.startswith("import"):
            raise HTTPException(status_code=404, detail="Not Found")
            
        index_file = os.path.join(frontend_build_path, "index.html")
        if os.path.exists(index_file):
            with open(index_file, 'r', encoding='utf-8') as f:
                return f.read()
        return "Frontend build not found."
