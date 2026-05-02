from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class LessonBase(BaseModel):
    title: str
    link: str
    category_id: int

class LessonCreate(LessonBase):
    pass

class Lesson(LessonBase):
    id: int
    created_at: datetime

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
