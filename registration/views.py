from django.views.generic import TemplateView, FormView


class SaltMixin(object):
    salt = "password_recovery"
    url_salt = "password_recovery_url"


class DashboardViewHome(TemplateView):
    template_name = 'registration/react_app.html'



class Recover(SaltMixin, FormView):
    # TODO
    ...