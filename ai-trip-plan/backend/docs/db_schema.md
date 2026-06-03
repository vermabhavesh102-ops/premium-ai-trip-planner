# MongoDB Schema (Collections)

Collections and main fields used by the backend to satisfy the frontend:

- users
  - _id (ObjectId)
  - username (string)
  - email (string, unique)
  - full_name (string)
  - role (string: 'user'|'admin')
  - is_email_verified (bool)
  - email_verified_at (datetime)

- trips
  - _id (ObjectId)
  - owner (Reference to users._id or null for anonymous)
  - destination (string)
  - source (string)
  - duration_days (int)
  - travelers (int)
  - maps_embed_url (string)
  - itinerary (array of day objects)
  - hotels (array)
  - nearby_places (array)
  - restaurants (array)
  - transport (array)
  - planner_meta (object)
  - saved_at (datetime)

Notes:
- `itinerary`, `hotels`, `restaurants`, and similar are stored as JSON arrays to reflect the frontend data model.
- Relationships are intentionally denormalized for read performance (typical in MongoDB).
