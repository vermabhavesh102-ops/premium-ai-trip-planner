import sys

# ensure local imports
sys.path.insert(0, "ai-trip-plan/backend")

from fastapi.testclient import TestClient

from app.main import create_app


client = TestClient(create_app())


def post_json(url, payload, expected_status):
    r = client.post(url, json=payload)
    print(url, r.status_code, r.text)
    assert r.status_code == expected_status
    return r


# 1) Health
r = client.get("/api/health")
print("GET /api/health", r.status_code, r.text)
assert r.status_code == 200

user = {
    "email": "test@example.com",
    "password": "StrongPass!123",
    "full_name": "Test User",
}

# 2) Signup happy path
post_json("/api/auth/signup", user, 201)

# 3) Duplicate signup
r = client.post("/api/auth/signup", json=user)
print("POST /api/auth/signup duplicate", r.status_code, r.text)
assert r.status_code == 409

# 4) Login happy path
r = client.post("/api/auth/login", data={"username": user["email"], "password": user["password"]})
print("POST /api/auth/login", r.status_code, r.text)
assert r.status_code == 200
token = r.json()["access_token"]

# 5) Login invalid credentials
r = client.post("/api/auth/login", data={"username": user["email"], "password": "wrongpass"})
print("POST /api/auth/login invalid", r.status_code, r.text)
assert r.status_code == 401

# 6) Me with valid token
r = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
print("GET /api/auth/me", r.status_code, r.text)
assert r.status_code == 200
assert r.json()["email"] == user["email"]

# 7) Me with invalid token
r = client.get("/api/auth/me", headers={"Authorization": "Bearer invalidtoken"})
print("GET /api/auth/me invalid", r.status_code, r.text)
assert r.status_code == 401

print("ALL TESTS PASSED")
