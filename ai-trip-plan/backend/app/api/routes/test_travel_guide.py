from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_travel_plan_uses_complete_saved_trip():
    response = client.post(
        "/api/ai/travel-plan",
        json={
            "trip": {
                "itinerary_id": "trip-123",
                "destination": "Jaipur",
                "duration_days": 3,
                "travelers": 2,
                "permissions": ["shared-user-id"],
                "planner_meta": {
                    "budget": "economy",
                    "interests": ["Culture", "Food"],
                    "hotelPref": "Boutique Hotel",
                    "transportPref": "Train + Local Transit",
                },
            }
        },
    )

    assert response.status_code == 200
    guide = response.json()
    assert guide["itinerary_id"] == "trip-123"
    assert guide["permissions"] == ["shared-user-id"]
    assert len(guide["itinerary"]) == 3
    assert guide["hotels"]
    assert guide["transport"]
    assert guide["nearby_places"]
    assert guide["budget_recommendations"]["budget_style"] == "economy"
    assert guide["travel_tips"]
