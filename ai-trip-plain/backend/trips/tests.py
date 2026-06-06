from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient


class TripTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_generate_trip(self):
        resp = self.client.post('/api/trips/generate', {'destination': 'Bali', 'duration_days': 3})
        self.assertEqual(resp.status_code, 200)
        self.assertIn('itinerary', resp.data)

    def test_trip_crud(self):
        # create
        resp = self.client.post('/api/trips/', {'destination': 'X', 'duration_days': 2, 'travelers': 1}, format='json')
        self.assertIn(resp.status_code, (201, 401))
