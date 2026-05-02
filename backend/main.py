from fastapi import FastAPI, Depends, HTTPException, status, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import os
import asyncio

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
def read_lessons(category_id: int, db: Session = Depends(database.get_db)):
    lessons = db.query(models.Lesson).filter(models.Lesson.category_id == category_id).all()
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

@app.post("/import")
def import_data(data: List[Dict[str, Any]] = Body(...), db: Session = Depends(database.get_db), user: dict = Depends(auth.get_current_user)):
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    imported_count = 0
    for item in data:
        title = item.get("title")
        link = item.get("link")
        cat_name = item.get("category")
        
        if not title or not link or not cat_name:
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
            lesson = models.Lesson(title=title, link=link, category_id=category.id)
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
