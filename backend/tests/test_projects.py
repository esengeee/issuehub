def test_create_project_success(client):
    """Test creating a project."""
    # Signup and get token
    signup_response = client.post(
        "/api/auth/signup",
        json={
            "name": "John Doe",
            "email": "john@example.com",
            "password": "password123"
        }
    )
    token = signup_response.json()["access_token"]

    # Create project
    response = client.post(
        "/api/projects",
        json={
            "name": "Test Project",
            "key": "TEST",
            "description": "A test project"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Project"
    assert data["key"] == "TEST"
    assert data["description"] == "A test project"


def test_create_project_duplicate_key(client):
    """Test creating project with duplicate key."""
    # Signup and get token
    signup_response = client.post(
        "/api/auth/signup",
        json={
            "name": "John Doe",
            "email": "john@example.com",
            "password": "password123"
        }
    )
    token = signup_response.json()["access_token"]

    # Create first project
    client.post(
        "/api/projects",
        json={
            "name": "Test Project",
            "key": "TEST",
            "description": "A test project"
        },
        headers={"Authorization": f"Bearer {token}"}
    )

    # Try to create second project with same key
    response = client.post(
        "/api/projects",
        json={
            "name": "Another Project",
            "key": "TEST",
            "description": "Another test project"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 400


def test_list_projects(client):
    """Test listing projects."""
    # Signup and get token
    signup_response = client.post(
        "/api/auth/signup",
        json={
            "name": "John Doe",
            "email": "john@example.com",
            "password": "password123"
        }
    )
    token = signup_response.json()["access_token"]

    # Create projects
    client.post(
        "/api/projects",
        json={"name": "Project 1", "key": "PROJ1"},
        headers={"Authorization": f"Bearer {token}"}
    )
    client.post(
        "/api/projects",
        json={"name": "Project 2", "key": "PROJ2"},
        headers={"Authorization": f"Bearer {token}"}
    )

    # List projects
    response = client.get(
        "/api/projects",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


def test_add_project_member(client):
    """Test adding a member to a project."""
    # Create two users
    signup1 = client.post(
        "/api/auth/signup",
        json={"name": "John Doe", "email": "john@example.com", "password": "password123"}
    )
    token1 = signup1.json()["access_token"]

    signup2 = client.post(
        "/api/auth/signup",
        json={"name": "Jane Smith", "email": "jane@example.com", "password": "password123"}
    )

    # Create project
    project_response = client.post(
        "/api/projects",
        json={"name": "Test Project", "key": "TEST"},
        headers={"Authorization": f"Bearer {token1}"}
    )
    project_id = project_response.json()["id"]

    # Add member
    response = client.post(
        f"/api/projects/{project_id}/members",
        json={"email": "jane@example.com", "role": "member"},
        headers={"Authorization": f"Bearer {token1}"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["role"] == "member"
