from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from app.models.project import ProjectRole


class ProjectCreate(BaseModel):
    name: str
    key: str
    description: Optional[str] = None


class ProjectResponse(BaseModel):
    id: int
    name: str
    key: str
    description: Optional[str]
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
