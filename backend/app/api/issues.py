from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.project import ProjectMember, ProjectRole
from app.models.issue import Issue, IssueStatus, IssuePriority
from app.schemas.issue import IssueCreate, IssueUpdate, IssueResponse

router = APIRouter(tags=["Issues"])


def check_project_membership(db: Session, project_id: int, user_id: int) -> ProjectMember:
    """Helper to check if user is a project member."""
    membership = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user_id
    ).first()
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a member of this project"
        )
    return membership


@router.get("/projects/{project_id}/issues", response_model=List[IssueResponse])
def list_issues(
    project_id: int,
    q: Optional[str] = Query(None, description="Search in title"),
    status_filter: Optional[IssueStatus] = Query(None, alias="status"),
    priority: Optional[IssuePriority] = None,
    assignee: Optional[int] = None,
    sort: Optional[str] = Query("created_at", regex="^(created_at|priority|status|updated_at)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List issues in a project with filtering, search, and sorting.
    """
    # Check membership
    check_project_membership(db, project_id, current_user.id)

    # Build query
    query = db.query(Issue).filter(Issue.project_id == project_id)

    # Apply filters
    if q:
        query = query.filter(Issue.title.ilike(f"%{q}%"))
    if status_filter:
        query = query.filter(Issue.status == status_filter)
    if priority:
        query = query.filter(Issue.priority == priority)
    if assignee:
        query = query.filter(Issue.assignee_id == assignee)

    # Apply sorting
    if sort == "created_at":
        query = query.order_by(Issue.created_at.desc())
    elif sort == "updated_at":
        query = query.order_by(Issue.updated_at.desc())
    elif sort == "priority":
        priority_order = {
            IssuePriority.CRITICAL: 0,
            IssuePriority.HIGH: 1,
            IssuePriority.MEDIUM: 2,
            IssuePriority.LOW: 3
        }
        issues = query.all()
        issues.sort(key=lambda x: priority_order.get(x.priority, 4))
        return issues
    elif sort == "status":
        query = query.order_by(Issue.status)

    return query.all()


@router.post("/projects/{project_id}/issues", response_model=IssueResponse, status_code=status.HTTP_201_CREATED)
def create_issue(
    project_id: int,
    request: IssueCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new issue in the project.
    """
    # Check membership
    check_project_membership(db, project_id, current_user.id)

    # Verify assignee is a project member if provided
    if request.assignee_id:
        assignee_membership = db.query(ProjectMember).filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == request.assignee_id
        ).first()
        if not assignee_membership:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Assignee is not a member of this project"
            )

    # Create issue
    new_issue = Issue(
        project_id=project_id,
        title=request.title,
        description=request.description,
        priority=request.priority,
        reporter_id=current_user.id,
        assignee_id=request.assignee_id
    )
    db.add(new_issue)
    db.commit()
    db.refresh(new_issue)

    return new_issue


@router.get("/issues/{issue_id}", response_model=IssueResponse)
def get_issue(
    issue_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get issue details.
    """
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found"
        )

    # Check membership
    check_project_membership(db, issue.project_id, current_user.id)

    return issue


@router.patch("/issues/{issue_id}", response_model=IssueResponse)
def update_issue(
    issue_id: int,
    request: IssueUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update an issue. Users can update their own issues, maintainers can update any.
    """
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found"
        )

    # Check membership
    membership = check_project_membership(db, issue.project_id, current_user.id)

    # Check permissions
    is_maintainer = membership.role == ProjectRole.MAINTAINER
    is_reporter = issue.reporter_id == current_user.id

    if not (is_maintainer or is_reporter):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update issues you reported or be a maintainer"
        )

    # Only maintainers can change status and assignee
    if not is_maintainer:
        if request.status is not None or request.assignee_id is not None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only maintainers can change status and assignee"
            )

    # Update fields
    update_data = request.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(issue, field, value)

    db.commit()
    db.refresh(issue)

    return issue


@router.delete("/issues/{issue_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_issue(
    issue_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete an issue. Users can delete their own issues, maintainers can delete any.
    """
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found"
        )

    # Check membership
    membership = check_project_membership(db, issue.project_id, current_user.id)

    # Check permissions
    is_maintainer = membership.role == ProjectRole.MAINTAINER
    is_reporter = issue.reporter_id == current_user.id

    if not (is_maintainer or is_reporter):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete issues you reported or be a maintainer"
        )

    db.delete(issue)
    db.commit()

    return None
