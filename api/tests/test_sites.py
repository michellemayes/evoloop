import pytest
from fastapi.testclient import TestClient
from db.models import User
import uuid


@pytest.fixture
def test_user(db_session):
    user = User(
        id=uuid.uuid4(),
        email="siteuser@example.com",
        password_hash="fakehash",
    )
    db_session.add(user)
    db_session.commit()
    return user


class TestSitesEndpoints:
    def test_create_site(self, client: TestClient, db_session, test_user):
        response = client.post(
            "/api/sites",
            json={"url": "https://example.com", "user_id": str(test_user.id)},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["url"] == "https://example.com"
        assert data["status"] == "analyzing"

    def test_list_sites_for_user(self, client: TestClient, db_session, test_user):
        client.post(
            "/api/sites",
            json={"url": "https://site1.com", "user_id": str(test_user.id)},
        )
        client.post(
            "/api/sites",
            json={"url": "https://site2.com", "user_id": str(test_user.id)},
        )
        response = client.get(f"/api/sites?user_id={test_user.id}")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2

    def test_get_site_by_id(self, client: TestClient, db_session, test_user):
        create_response = client.post(
            "/api/sites",
            json={"url": "https://getme.com", "user_id": str(test_user.id)},
        )
        site_id = create_response.json()["id"]
        response = client.get(f"/api/sites/{site_id}")
        assert response.status_code == 200
        assert response.json()["url"] == "https://getme.com"

    def test_update_site(self, client: TestClient, db_session, test_user):
        create_response = client.post(
            "/api/sites",
            json={"url": "https://updateme.com", "user_id": str(test_user.id)},
        )
        site_id = create_response.json()["id"]
        response = client.patch(
            f"/api/sites/{site_id}",
            json={"autonomy_mode": "full_auto"},
        )
        assert response.status_code == 200
        assert response.json()["autonomy_mode"] == "full_auto"

    def test_update_site_status(self, client: TestClient, db_session, test_user):
        create_response = client.post(
            "/api/sites",
            json={"url": "https://statusme.com", "user_id": str(test_user.id)},
        )
        site_id = create_response.json()["id"]

        response = client.patch(
            f"/api/sites/{site_id}",
            json={"status": "running"},
        )
        assert response.status_code == 200
        assert response.json()["status"] == "running"

    def test_delete_site(self, client: TestClient, db_session, test_user):
        create_response = client.post(
            "/api/sites",
            json={"url": "https://deleteme.com", "user_id": str(test_user.id)},
        )
        site_id = create_response.json()["id"]
        response = client.delete(f"/api/sites/{site_id}")
        assert response.status_code == 200
        get_response = client.get(f"/api/sites/{site_id}")
        assert get_response.status_code == 404
