from django.urls import path
from . import views

urlpatterns = [
    path('signup', views.signup, name='signup'),
    path('login', views.login_view, name='login'),
    path('logout', views.logout_view, name='logout'),
    path('me', views.me, name='me'),
    path('profile', views.profile, name='profile'),
    path('profile/image', views.upload_profile_image, name='profile_image'),
    path('profile/password/send-otp', views.send_password_otp, name='profile_password_send_otp'),
    path('profile/password/verify-otp', views.verify_password_otp, name='profile_password_verify_otp'),
    path('profile/password/change', views.change_password, name='profile_password_change'),
    path('forgot-password/send-otp', views.forgot_password_send_otp, name='forgot_password_send_otp'),
    path('forgot-password/verify-otp', views.forgot_password_verify_otp, name='forgot_password_verify_otp'),
    path('forgot-password/change', views.forgot_password_change, name='forgot_password_change'),
    path('password-reset', views.password_reset_request, name='password_reset'),
    path('password-reset/confirm', views.password_reset_confirm, name='password_reset_confirm'),
    path('verify-email/<str:uidb64>/<str:token>', views.verify_email, name='verify_email'),
]
