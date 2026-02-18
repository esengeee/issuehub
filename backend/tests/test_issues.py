def test_create_issue_success(client):
    """Test creating an issue."""
    # Signup and create project
    signup_response = client.post(
        "/api/auth/signup",
        json={"name": "John Doe", "email": "john@example.com", "password": "password123"}
    )
    token = signup_response.json()["access_token"]

    project_response = client.post(
        "/api/projects",
        json={"name": "Test Project", "key": "TEST"},
        headers={"Authorization": f"Bearer {token}"}
    )
    project_id = project_response.json()["id"]

    # Create issue
    response = client.post(
        f"/api/projects/{project_id}/issues",
        json={
            "title": "Test Issue",
            "description": "This is a test issue",
            "priority": "high"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Issue"
    assert data["priority"] == "high"
    assert data["status"] == "open"


def test_list_issues_with_filters(client):
    """Test listing issues with filters."""
    # Signup and create project
    signup_response = client.post(
        "/api/auth/signup",
        json={"name": "John Doe", "email": "john@example.com", "password": "password123"}
    )
    token = signup_response.json()["access_token"]

    project_response = client.post(
        "/api/projects",
        json={"name": "Test Project", "key": "TEST"},
        headers={"Authorization": f"Bearer {token}"}
    )
    project_id = project_response.json()["id"]

    # Create multiple issues
    client.post(
        f"/api/projects/{project_id}/issues",
        json={"title": "Bug 1", "priority": "high"},
        headers={"Authorization": f"Bearer {token}"}
    )
    client.post(
        f"/api/projects/{project_id}/issues",
        json={"title": "Feature Request", "priority": "low"},
        headers={"Authorization": f"Bearer {token}"}
    )

    # List with filter
    response = client.get(
        f"/api/projects/{project_id}/issues?priority=high",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["priority"] == "high"


def test_update_issue_as_maintainer(client):
    """Test updating issue status as maintainer."""
    # Signup and create project
    signup_response = client.post(
        "/api/auth/signup",
        json={"name": "John Doe", "email": "john@example.com", "password": "password123"}
    )
    token = signup_response.json()["access_token"]

    project_response = client.post(
        "/api/projects",
        json={"name": "Test Project", "key": "TEST"},
        headers={"Authorization": f"Bearer {token}"}
    )
    project_id = project_response.json()["id"]

    # Create issue
    issue_response = client.post(
        f"/api/projects/{project_id}/issues",
        json={"title": "Test Issue", "priority": "medium"},
        headers={"Authorization": f"Bearer {token}"}
    )
    issue_id = issue_response.json()["id"]

    # Update status
    response = client.patch(
        f"/api/issues/{issue_id}",
        json={"status": "in_progress"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "in_progress"


def test_search_issues_by_title(client):
    """Test searching issues by title."""
    # Signup and create project
    signup_response = client.post(
        "/api/auth/signup",
        json={"name": "John Doe", "email": "john@example.com", "password": "password123"}
    )
    token = signup_response.json()["access_token"]

    project_response = client.post(
        "/api/projects",
        json={"name": "Test Project", "key": "TEST"},
        headers={"Authorization": f"Bearer {token}"}
    )
    project_id = project_response.json()["id"]

    # Create issues
    client.post(
        f"/api/projects/{project_id}/issues",
        json={"title": "Bug in login", "priority": "high"},
        headers={"Authorization": f"Bearer {token}"}
    )
    client.post(
        f"/api/projects/{project_id}/issues",
        json={"title": "Feature request", "priority": "low"},
        headers={"Authorization": f"Bearer {token}"}
    )

    # Search for "login"
    response = client.get(
        f"/api/projects/{project_id}/issues?q=login",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert "login" in data[0]["title"].lower()
