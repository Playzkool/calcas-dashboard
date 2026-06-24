from django.utils.decorators import method_decorator
from django.views.generic import TemplateView, FormView
from django_ratelimit.decorators import ratelimit


class SaltMixin(object):
    salt = "password_recovery"
    url_salt = "password_recovery_url"


class DashboardViewHome(TemplateView):
    template_name = 'registration/react_app.html'


class Recover(SaltMixin, FormView):
    # TODO
    @method_decorator(ratelimit(key='ip', rate='5/min', method='POST', block=True))
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)