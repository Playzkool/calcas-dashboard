from django.contrib import messages

from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.contrib.auth.views import LoginView
from django.urls import reverse_lazy
from django.views.generic import TemplateView, FormView

from project import settings
# Create your views here.
from django.shortcuts import redirect
from django.contrib.auth import login, authenticate

class SaltMixin(object):
    salt = "password_recovery"
    url_salt = "password_recovery_url"



def custom_login(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('home')
    return render(request, 'registration/login.html')


class DashboardViewHome(LoginRequiredMixin, TemplateView):
    template_name = 'home.html'
    login_url = settings.LOGIN_URL
    redirect_field_name = settings.LOGIN_REDIRECT_URL

    def get_context_data(self, *args, **kwargs):
        context = super(DashboardViewHome, self).get_context_data(*args, **kwargs)
        context['api_url'] = settings.API_URL
        return context



class Recover(SaltMixin, FormView):
    # TODO
    ...