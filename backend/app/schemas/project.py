from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime, date, timedelta
from typing import Optional
from app.models.project import ProjectRole




class ProjectCreate(BaseModel):
    name: str
    key: str
    description: Optional[str] = None
    start_date: Optional[date] = None
    @field_validator("start_date")
    def validate_start_date(cls,v):
        if v>date.today() + timedelta(days=30):
            raise ValueError("Start date cannot be more than 30 days from today")
        return v


class ProjectResponse(BaseModel):
    id: int
    name: str
    key: str
    description: Optional[str]
    start_date: Optional[date]
    created_at: datetime

    class Config:
        from_attributes = True


class ProjectMemberAdd(BaseModel):
    email: EmailStr
    role: ProjectRole = ProjectRole.MEMBER


class ProjectMemberResponse(BaseModel):
    id: int
    project_id: int
    user_id: int
    role: ProjectRole

    class Config:
        from_attributes = True
