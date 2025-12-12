import pytest
from fastapi.testclient import TestClient


class TestAuthEndpoints:
    def test_signup_creates_user(self, client: TestClient, db_session):
        response = client.post(
            "/api/auth/signup",
            json={"email": "test@example.com", "password": "password123"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "test@example.com"
        assert "id" in data

    def test_signup_rejects_duplicate_email(self, client: TestClient, db_session):
        client.post(
            "/api/auth/signup",
            json={"email": "dupe@example.com", "password": "password123"},
        )
        response = client.post(
            "/api/auth/signup",
            json={"email": "dupe@example.com", "password": "password456"},
        )
        assert response.status_code == 400

    def test_login_with_valid_credentials(self, client: TestClient, db_session):
        client.post(
            "/api/auth/signup",
            json={"email": "login@example.com", "password": "password123"},
        )
        response = client.post(
            "/api/auth/login",
            json={"email": "login@example.com", "password": "password123"},
        )
        assert response.status_code == 200
        assert response.json()["email"] == "login@example.com"

    def test_login_with_invalid_credentials(self, client: TestClient, db_session):
        response = client.post(
            "/api/auth/login",
            json={"email": "nobody@example.com", "password": "wrong"},
        )
        assert response.status_code == 401
