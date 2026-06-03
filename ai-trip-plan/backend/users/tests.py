from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient


class AuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_signup_and_me(self):
        resp = self.client.post(reverse('signup'), {'email': 'u@example.com', 'username': 'u', 'password': 'pass123'})
        self.assertEqual(resp.status_code, 201)
        token = resp.data.get('access_token')
        self.assertTrue(token)
