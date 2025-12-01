from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render
from django.contrib.auth.views import LoginView
from django.views.generic import TemplateView, FormView

from project import settings

class SaltMixin(object):
    salt = "password_recovery"
    url_salt = "password_recovery_url"


# Create your views here.
class LoginViewHome(LoginView):
    template_name = 'login.html'
    login_url = settings.LOGIN_URL
    redirect_field_name = settings.LOGIN_REDIRECT_URL


class DashboardViewHome(LoginRequiredMixin, TemplateView):
    template_name = 'home.html'
    login_url = settings.LOGIN_URL
    redirect_field_name = settings.LOGIN_REDIRECT_URL

class Recover(SaltMixin, FormView):
    # TODO
    ...