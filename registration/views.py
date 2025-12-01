from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import HttpResponseRedirect
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

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def get_initial(self):
        initial = super().get_initial()
        initial["email"] = self.request.session.get("email", None)
        return initial

    def is_valid(self):
        super().is_valid()

    def get(self, request, *args, **kwargs):
        """Handle GET requests: instantiate a blank version of the form."""
        username_from_session = request.session.get("username", None)
        if username_from_session is None:
            return HttpResponseRedirect(self.login_url)

        subdomain = sub_domain_from_request(self.request)

        if subdomain:
            self.request.session["subdomain"] = subdomain
            self.request.session.save()

        # Block Internet Explorer
        if is_request_from_internet_exporer(self.request):
            userAgentBlock = True
            return self.render_to_response({'userAgentBlock': userAgentBlock})
        else:
            return self.render_to_response(self.get_context_data(subdomain=subdomain))

    def form_valid(self, form):
        # Variable de droit des application
        user = form.get_user()
        email = form.cleaned_data.get('email')
        if user.is_authenticated():

            self.request.session.setdefault('token', None)
            # TODO generate Access Token
            """
            login(self.request, user)
            token, _ = Token.objects.get_or_create(user=authenticated_user)

            self.request.session['token'] = str(token)
            self.request.session.save()
            """
            return HttpResponseRedirect(self.get_success_url())
        else:
            return self.form_invalid(form)

    def form_invalid(self, form):

        email = form.cleaned_data.get('email', '')

        return self.render_to_response(self.get_context_data(form=form))

class DashboardViewHome(LoginRequiredMixin, TemplateView):
    template_name = 'home.html'
    login_url = settings.LOGIN_URL
    redirect_field_name = settings.LOGIN_REDIRECT_URL

class Recover(SaltMixin, FormView):
    # TODO
    ...