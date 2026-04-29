from django.urls import path

from rest_api.views import LoginView, LogoutView, MeView, RegistrationsView

urlpatterns = [
    path("login/", LoginView.as_view()),
    path("logout/", LogoutView.as_view()),
    path("me/", MeView.as_view()),
    path("registrations/", RegistrationsView.as_view()),
]