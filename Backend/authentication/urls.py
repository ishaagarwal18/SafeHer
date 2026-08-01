from django.urls import path
from . import views
from . import api_views

urlpatterns = [
    path('', views.home, name='home'),
    path('login/', views.login_page, name='login'),
    path('signup/', views.signup_page, name='signup'),
    path("send-otp/", views.send_email_otp, name="send_otp"),
    path("verify-email/", views.verify_email, name="verify_email"),
    # REST API endpoints consumed by the React frontend
    path("api/signup/", views.signup_api, name="signup_api"),
    path("api/send-otp/", api_views.api_send_otp, name="api_send_otp"),
    path("api/verify-otp/", api_views.api_verify_otp, name="api_verify_otp"),
    path("api/login/", api_views.api_login, name="api_login"),
    path("api/logout/", api_views.api_logout, name="api_logout"),
]