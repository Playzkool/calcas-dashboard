from django.contrib import admin
from django.contrib.auth import views as auth_views
from django.urls import path, include
from django.utils.decorators import method_decorator
from django_ratelimit.decorators import ratelimit


class _ThrottledLoginView(auth_views.LoginView):
    @method_decorator(ratelimit(key='ip', rate='10/min', method='POST', block=True))
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)


class _ThrottledPasswordResetView(auth_views.PasswordResetView):
    @method_decorator(ratelimit(key='ip', rate='5/min', method='POST', block=True))
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)


urlpatterns = [
    path('', include("registration.urls", namespace='registration')),
    # Auth views — login and password_reset are rate-limited by IP.
    path('accounts/login/', _ThrottledLoginView.as_view(), name='login'),
    path('accounts/logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('accounts/password_change/', auth_views.PasswordChangeView.as_view(), name='password_change'),
    path('accounts/password_change/done/', auth_views.PasswordChangeDoneView.as_view(), name='password_change_done'),
    path('accounts/password_reset/', _ThrottledPasswordResetView.as_view(), name='password_reset'),
    path('accounts/password_reset/done/', auth_views.PasswordResetDoneView.as_view(), name='password_reset_done'),
    path('accounts/reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('accounts/reset/done/', auth_views.PasswordResetCompleteView.as_view(), name='password_reset_complete'),
    path('admin/', admin.site.urls),
    path('api/', include('rest_api.urls')),
]
# SÉCURITÉ : /media/ n'est plus servi publiquement (faille d'accès non
# authentifié aux documents sensibles). Les fichiers transitent désormais
# uniquement par les endpoints authentifiés de rest_api.media.
