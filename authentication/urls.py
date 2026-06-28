from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('login/', views.login_page, name='login'),
    path('signup/', views.signup_page, name='signup'),
    path("send-otp/",views.send_email_otp,name="send_otp"),
    path("verify-email/",views.verify_email,name="verify_email"),
]