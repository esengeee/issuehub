from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.issue import IssueStatus, IssuePriority


class IssueCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: IssuePriority = IssuePriority.MEDIUM
    assignee_id: Optional[int] = None


class IssueUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[IssueStatus] = None
    priority: Optional[IssuePriority] = None
    assignee_id: Optional[int] = None


class IssueResponse(BaseModel):
    id: int
    project_id: int
    title: str
    description: Optional[str]
    status: IssueStatus
    priority: IssuePriority
    reporter_id: int
    assignee_id: Optional[int]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
