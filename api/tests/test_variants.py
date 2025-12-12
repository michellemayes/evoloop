import pytest
from fastapi.testclient import TestClient
from db.models import User, Site, Variant, ExperimentStats
import uuid


@pytest.fixture
def test_site(db_session):
    user = User(id=uuid.uuid4(), email="variantuser@example.com", password_hash="fake")
    db_session.add(user)
    db_session.commit()

    site = Site(
        id=uuid.uuid4(),
        user_id=user.id,
        url="https://testsite.com",
        status="running",
    )
    db_session.add(site)
    db_session.commit()
    return site


class TestVariantsEndpoints:
    def test_create_variant_creates_stats(self, client: TestClient, db_session, test_site):
        response = client.post(
            "/api/variants",
            json={
                "site_id": str(test_site.id),
                "patch": {"headline": "Generated"},
            },
        )
        assert response.status_code == 200
        variant_id = response.json()["id"]

        stats = (
            db_session.query(ExperimentStats)
            .filter(ExperimentStats.variant_id == uuid.UUID(variant_id))
            .first()
        )
        assert stats is not None

    def test_list_variants_for_site(self, client: TestClient, db_session, test_site):
        variant = Variant(
            id=uuid.uuid4(),
            site_id=test_site.id,
            patch={"headline": "Test"},
            status="active",
        )
        db_session.add(variant)
        db_session.commit()

        response = client.get(f"/api/sites/{test_site.id}/variants")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1

    def test_approve_variant(self, client: TestClient, db_session, test_site):
        variant = Variant(
            id=uuid.uuid4(),
            site_id=test_site.id,
            patch={"headline": "Test"},
            status="pending_review",
        )
        db_session.add(variant)
        db_session.commit()

        response = client.patch(
            f"/api/variants/{variant.id}",
            json={"status": "active"},
        )
        assert response.status_code == 200
        assert response.json()["status"] == "active"

    def test_kill_variant(self, client: TestClient, db_session, test_site):
        variant = Variant(
            id=uuid.uuid4(),
            site_id=test_site.id,
            patch={"headline": "Test"},
            status="active",
        )
        db_session.add(variant)
        db_session.commit()

        response = client.patch(
            f"/api/variants/{variant.id}",
            json={"status": "killed"},
        )
        assert response.status_code == 200
        assert response.json()["status"] == "killed"
        assert response.json()["killed_at"] is not None

    def test_get_variant_diff(self, client: TestClient, db_session, test_site):
        variant1 = Variant(
            id=uuid.uuid4(),
            site_id=test_site.id,
            patch={"headline": "Original"},
            status="active",
        )
        variant2 = Variant(
            id=uuid.uuid4(),
            site_id=test_site.id,
            parent_variant_id=variant1.id,
            patch={"headline": "Updated", "cta": "Buy Now"},
            status="active",
        )
        db_session.add_all([variant1, variant2])
        db_session.commit()

        response = client.get(f"/api/variants/{variant1.id}/diff/{variant2.id}")
        assert response.status_code == 200
        diff = response.json()
        assert "headline" in diff["changes"]
