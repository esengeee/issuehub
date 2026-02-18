def test_signup_success(client):
    """Test successful user signup."""
    response = client.post(
        "/api/auth/signup",
        json={
            "name": "John Doe",
            "email": "john@example.com",
            "password": "password123"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_signup_duplicate_email(client):
    """Test signup with duplicate email."""
    # First signup
    client.post(
        "/api/auth/signup",
        json={
            "name": "John Doe",
            "email": "john@example.com",
            "password": "password123"
        }
    )

    # Second signup with same email
    response = client.post(
        "/api/auth/signup",
        json={
            "name": "Jane Doe",
            "email": "john@example.com",
            "password": "password456"
        }
    )
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"].lower()


def test_login_success(client):
    """Test successful login."""
    # Signup first
    client.post(
        "/api/auth/signup",
        json={
            "name": "John Doe",
            "email": "john@example.com",
            "password": "password123"
        }
    )

    # Login
    response = client.post(
        "/api/auth/login",
        json={
            "email": "john@example.com",
            "password": "password123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client):
    """Test login with wrong password."""
    # Signup first
    client.post(
        "/api/auth/signup",
        json={
            "name": "John Doe",
            "email": "john@example.com",
            "password": "password123"
        }
    )

    # Login with wrong password
    response = client.post(
        "/api/auth/login",
        json={
            "email": "john@example.com",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 401


def test_login_nonexistent_user(client):
    """Test login with non-existent user."""
    response = client.post(
        "/api/auth/login",
        json={
            "email": "nonexistent@example.com",
            "password": "password123"
        }
    )
    assert response.status_code == 401


def test_get_me_success(client):
    """Test getting current user profile."""
    # Signup
    signup_response = client.post(
        "/api/auth/signup",
        json={
            "name": "John Doe",
            "email": "john@example.com",
            "password": "password123"
        }
    )
    token = signup_response.json()["access_token"]

    # Get profile
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "John Doe"
    assert data["email"] == "john@example.com"
    assert "id" in data


def test_get_me_unauthorized(client):
    """Test getting profile without authentication."""
    response = client.get("/api/auth/me")
    assert response.status_code == 403
