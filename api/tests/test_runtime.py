import pytest
from fastapi.testclient import TestClient
from db.models import User, Site, Variant, ExperimentStats
import uuid


@pytest.fixture
def running_site(db_session):
    user = User(id=uuid.uuid4(), email="runtime@example.com", password_hash="fake")
    db_session.add(user)
    db_session.commit()

    site = Site(
        id=uuid.uuid4(),
        user_id=user.id,
        url="https://runtime-test.com",
        status="running",
    )
    db_session.add(site)
    db_session.commit()

    variant1 = Variant(
        id=uuid.uuid4(),
        site_id=site.id,
        patch={"headline": "Original"},
        status="active",
    )
    variant2 = Variant(
        id=uuid.uuid4(),
        site_id=site.id,
        patch={"headline": "Variant A"},
        status="active",
    )
    db_session.add_all([variant1, variant2])
    db_session.commit()

    stats1 = ExperimentStats(variant_id=variant1.id, visitors=100, conversions=10)
    stats2 = ExperimentStats(variant_id=variant2.id, visitors=100, conversions=15)
    db_session.add_all([stats1, stats2])
    db_session.commit()

    return site


class TestRuntimeEndpoints:
    def test_assign_returns_variant(self, client: TestClient, db_session, running_site):
        response = client.get(
            f"/v1/assign?site_id={running_site.id}&visitor_id=visitor123"
        )
        assert response.status_code == 200
        data = response.json()
        assert "variant_id" in data
        assert "patch" in data

    def test_assign_consistent_for_same_visitor(self, client: TestClient, db_session, running_site):
        response1 = client.get(
            f"/v1/assign?site_id={running_site.id}&visitor_id=sticky-visitor"
        )
        response2 = client.get(
            f"/v1/assign?site_id={running_site.id}&visitor_id=sticky-visitor"
        )
        assert response1.json()["variant_id"] == response2.json()["variant_id"]

    def test_record_impression(self, client: TestClient, db_session, running_site):
        assign = client.get(
            f"/v1/assign?site_id={running_site.id}&visitor_id=impression-visitor"
        )
        variant_id = assign.json()["variant_id"]

        response = client.post(
            "/v1/event",
            json={
                "site_id": str(running_site.id),
                "variant_id": variant_id,
                "visitor_id": "impression-visitor",
                "type": "impression",
            },
        )
        assert response.status_code == 200

    def test_record_conversion(self, client: TestClient, db_session, running_site):
        assign = client.get(
            f"/v1/assign?site_id={running_site.id}&visitor_id=convert-visitor"
        )
        variant_id = assign.json()["variant_id"]

        response = client.post(
            "/v1/event",
            json={
                "site_id": str(running_site.id),
                "variant_id": variant_id,
                "visitor_id": "convert-visitor",
                "type": "conversion",
            },
        )
        assert response.status_code == 200
