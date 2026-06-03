from django.urls import path
from . import views

urlpatterns = [
    path('signup', views.signup, name='signup'),
    path('login', views.login_view, name='login'),
    path('logout', views.logout_view, name='logout'),
    path('me', views.me, name='me'),
    path('password-reset', views.password_reset_request, name='password_reset'),
    path('password-reset/confirm', views.password_reset_confirm, name='password_reset_confirm'),
    path('verify-email/<str:uidb64>/<str:token>', views.verify_email, name='verify_email'),
]
