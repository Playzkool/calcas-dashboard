from django.shortcuts import render
from django.contrib.auth.views import LoginView

# Create your views here.
class LoginViewHome(LoginView):
    template_name = 'registration/login.html'
    login_url = settings.LOGIN_URL
    redirect_field_name = settings.LOGIN_REDIRECT_URL
