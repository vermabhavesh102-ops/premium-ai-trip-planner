from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from unittest.mock import patch
import uuid

from trips.models import Trip
from .models import PasswordOtpLog, User


class AuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.email = f'auth-{uuid.uuid4().hex}@example.com'
        self.username = f'auth-{uuid.uuid4().hex[:10]}'

    def tearDown(self):
        User.objects(email=self.email).delete()
        PasswordOtpLog.objects(email=self.email).delete()

    def test_signup_and_me(self):
        resp = self.client.post(reverse('signup'), {'email': self.email, 'username': self.username, 'password': 'pass123'})
        self.assertEqual(resp.status_code, 201)
        token = resp.data.get('access_token')
        self.assertTrue(token)

        resp = self.client.post(reverse('login'), {'email': self.email, 'password': 'pass123'}, format='json')
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.data.get('access_token'))


class ProfileApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User(email='profile@example.com', username='profile-user', full_name='Profile User')
        self.user.set_password('OldPassword!123')
        self.user.save()
        self.client.force_authenticate(user=self.user)

    def tearDown(self):
        Trip.objects(owner_id=str(self.user.id)).delete()
        PasswordOtpLog.objects(email=self.user.email).delete()
        User.objects(id=self.user.id).delete()

    def test_profile_stats_and_email_is_read_only(self):
        Trip(owner_id=str(self.user.id), destination='Goa', duration_days=4).save()
        Trip(owner_id=str(self.user.id), destination='Jaipur', duration_days=3).save()

        response = self.client.get(reverse('profile'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['stats']['saved_trips'], 2)
        self.assertEqual(response.data['stats']['destinations'], 2)
        self.assertEqual(response.data['stats']['days_planned'], 7)

        response = self.client.patch(
            reverse('profile'),
            {'full_name': 'Updated User', 'username': 'updated-user', 'email': 'changed@example.com'},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.user.reload()
        self.assertEqual(self.user.email, 'profile@example.com')
        self.assertEqual(self.user.username, 'updated-user')

    @patch('users.views.send_otp_email', return_value='<test-message@example.com>')
    @patch('users.views.secrets.randbelow', return_value=123456)
    def test_otp_verification_and_password_change(self, randbelow_mock, send_otp_mock):
        response = self.client.post(reverse('profile_password_send_otp'), {}, format='json')
        self.assertEqual(response.status_code, 200)
        send_otp_mock.assert_called_once()

        response = self.client.post(reverse('profile_password_verify_otp'), {'otp': '123456'}, format='json')
        self.assertEqual(response.status_code, 200)

        response = self.client.post(
            reverse('profile_password_change'),
            {
                'verification_token': response.data['verification_token'],
                'new_password': 'NewPassword!456',
                'confirm_password': 'NewPassword!456',
            },
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.user.reload()
        self.assertTrue(self.user.check_password('NewPassword!456'))


class ForgotPasswordOtpTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.email = f'forgot-{uuid.uuid4().hex}@example.com'
        self.user = User(email=self.email, username=f'forgot-{uuid.uuid4().hex[:10]}', full_name='Forgot User')
        self.user.set_password('OldPassword!123')
        self.user.save()

    def tearDown(self):
        PasswordOtpLog.objects(email=self.email).delete()
        PasswordOtpLog.objects(email='missing@example.com').delete()
        User.objects(id=self.user.id).delete()

    @patch('users.views.send_otp_email', return_value='<forgot@example.com>')
    @patch('users.views.secrets.randbelow', return_value=654321)
    def test_forgot_password_full_flow(self, randbelow_mock, send_otp_mock):
        response = self.client.post(reverse('forgot_password_send_otp'), {'email': self.email}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertIn('If that email is registered', response.data['detail'])
        send_otp_mock.assert_called_once()
        self.assertEqual(PasswordOtpLog.objects(email=self.email, status='sent').count(), 1)

        response = self.client.post(reverse('forgot_password_verify_otp'), {'email': self.email, 'otp': '654321'}, format='json')
        self.assertEqual(response.status_code, 200)
        token = response.data['verification_token']

        response = self.client.post(
            reverse('forgot_password_change'),
            {
                'email': self.email,
                'verification_token': token,
                'new_password': 'FreshPassword!789',
                'confirm_password': 'FreshPassword!789',
            },
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.user.reload()
        self.assertTrue(self.user.check_password('FreshPassword!789'))

    @patch('users.views.send_otp_email')
    def test_forgot_password_does_not_expose_missing_email(self, send_otp_mock):
        response = self.client.post(reverse('forgot_password_send_otp'), {'email': 'missing@example.com'}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertIn('If that email is registered', response.data['detail'])
        send_otp_mock.assert_not_called()
        self.assertEqual(PasswordOtpLog.objects(email='missing@example.com', status='requested').count(), 1)

    @patch('users.views.send_otp_email', return_value='<forgot@example.com>')
    def test_forgot_password_daily_request_limit(self, send_otp_mock):
        for index in range(5):
            PasswordOtpLog(email=self.email, user_id=str(self.user.id), purpose='forgot_password', status='sent').save()

        response = self.client.post(reverse('forgot_password_send_otp'), {'email': self.email}, format='json')
        self.assertEqual(response.status_code, 200)
        send_otp_mock.assert_not_called()
        self.assertEqual(PasswordOtpLog.objects(email=self.email, status='blocked').count(), 1)
