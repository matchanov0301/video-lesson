from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class LessonBase(BaseModel):
    topic: str
    speaker: Optional[str] = None
    duration: Optional[str] = None
    link: str
    category_id: int

class LessonCreate(LessonBase):
    pass

class Lesson(LessonBase):
    id: int
    created_at: datetime
    is_favorite: Optional[bool] = False
    views_count: int = 0

    class Config:
        from_attributes = True

class FavoriteBase(BaseModel):
    lesson_id: int

class Favorite(FavoriteBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class UserData(BaseModel):
    id: int
    is_admin: bool
    is_in_group: bool
