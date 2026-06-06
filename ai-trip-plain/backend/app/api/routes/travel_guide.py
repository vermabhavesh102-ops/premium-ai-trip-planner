from typing import Any
from urllib.parse import quote_plus

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, ConfigDict, Field


router = APIRouter()


class SavedTrip(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: str | None = None
    itinerary_id: str | None = None
    destination: str
    source: str = "saved-trip"
    duration_days: int = Field(default=1, ge=1, le=60)
    travelers: int = Field(default=1, ge=1, le=100)
    maps_embed_url: str = ""
    itinerary: list[dict[str, Any]] = Field(default_factory=list)
    hotels: list[dict[str, Any]] = Field(default_factory=list)
    nearby_places: list[dict[str, Any]] = Field(default_factory=list)
    restaurants: list[dict[str, Any]] = Field(default_factory=list)
    transport: list[dict[str, Any]] = Field(default_factory=list)
    planner_meta: dict[str, Any] = Field(default_factory=dict)


class TravelGuideRequest(BaseModel):
    trip: SavedTrip


def _daily_itinerary(trip: SavedTrip) -> list[dict[str, Any]]:
    interests = trip.planner_meta.get("interests") or ["local culture", "food"]
    start_location = trip.planner_meta.get("startLocation")
    result = []

    for index in range(trip.duration_days):
        day = index + 1
        interest = interests[index % len(interests)]
        arrival_note = (
            f"Travel from {start_location}, check in, and settle into {trip.destination}."
            if day == 1 and start_location
            else f"Explore {trip.destination} at a comfortable pace."
        )
        result.append(
            {
                "day": day,
                "title": f"{trip.destination}: {interest} and local highlights",
                "estimated_cost": "Adjusted to your saved budget preference",
                "tips": [
                    "Confirm opening hours and reservations the day before.",
                    "Keep a flexible buffer for traffic, weather, and rest.",
                ],
                "items": [
                    {"time": "09:00", "title": "Morning highlight", "details": arrival_note},
                    {
                        "time": "13:00",
                        "title": f"Local lunch and {interest}",
                        "details": f"Choose a well-reviewed local experience centered on {interest}.",
                    },
                    {
                        "time": "16:00",
                        "title": "Signature attraction",
                        "details": f"Visit a major {trip.destination} attraction near your day's route.",
                    },
                    {
                        "time": "19:30",
                        "title": "Dinner and relaxed evening",
                        "details": "Stay close to the hotel or a convenient transport connection.",
                    },
                ],
            }
        )

    return result


def _budget_recommendations(trip: SavedTrip) -> dict[str, Any]:
    budget = str(trip.planner_meta.get("budget") or "mid").lower()
    daily_ranges = {
        "economy": (3000, 8000),
        "mid": (8000, 18000),
        "luxury": (18000, 50000),
    }
    daily_min, daily_max = daily_ranges.get(budget, daily_ranges["mid"])
    total_min = daily_min * trip.duration_days
    total_max = daily_max * trip.duration_days

    return {
        "currency": "INR",
        "budget_style": budget,
        "daily_range": {"min": daily_min, "max": daily_max},
        "trip_total_range": {"min": total_min, "max": total_max},
        "per_person_range": {
            "min": round(total_min / trip.travelers),
            "max": round(total_max / trip.travelers),
        },
        "allocation": {
            "hotels": "35-45%",
            "transport": "15-25%",
            "food": "20-25%",
            "attractions_and_buffer": "15-25%",
        },
    }


def build_travel_guide(trip: SavedTrip) -> dict[str, Any]:
    hotel_preference = trip.planner_meta.get("hotelPref") or "comfortable hotel"
    transport_preference = trip.planner_meta.get("transportPref") or "local transit and cab"
    interests = trip.planner_meta.get("interests") or ["Culture", "Food"]

    guide = trip.model_dump()
    guide.update(
        {
            "source": "fastapi-personalized-guide",
            "maps_embed_url": trip.maps_embed_url
            or f"https://www.google.com/maps?q={quote_plus(trip.destination)}&output=embed",
            "itinerary": _daily_itinerary(trip),
            "hotels": trip.hotels
            or [
                {
                    "name": f"{trip.destination} {hotel_preference}",
                    "area": "Central, well-connected area",
                    "price_note": "Matched to the saved budget and stay preference",
                    "image": "",
                }
            ],
            "nearby_places": trip.nearby_places
            or [
                {"name": f"{trip.destination} heritage district", "category": interests[0]},
                {"name": f"{trip.destination} signature viewpoint", "category": "Scenic"},
                {"name": f"{trip.destination} local market", "category": "Shopping and food"},
            ],
            "restaurants": trip.restaurants
            or [
                {
                    "name": f"{trip.destination} local kitchen",
                    "category": "Regional cuisine",
                    "address": "Near the central district",
                }
            ],
            "transport": trip.transport
            or [
                {
                    "title": "Arrival and departure",
                    "detail": f"Use {transport_preference}; pre-book the first and last transfer.",
                },
                {
                    "title": "Daily movement",
                    "detail": "Group nearby attractions together to reduce travel time and cost.",
                },
            ],
            "budget_recommendations": _budget_recommendations(trip),
            "travel_tips": [
                f"Keep digital and offline copies of bookings for {trip.destination}.",
                "Verify local weather, attraction closures, and transport schedules before each day.",
                "Keep emergency cash, identification, medication, and travel insurance details accessible.",
                f"Reserve popular {', '.join(interests[:2])} experiences in advance.",
            ],
        }
    )
    return guide


@router.post("/travel-plan")
async def generate_travel_plan(payload: TravelGuideRequest):
    if not payload.trip.destination.strip():
        raise HTTPException(status_code=400, detail="The selected trip must include a destination.")

    return build_travel_guide(payload.trip)
