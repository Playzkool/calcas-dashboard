from django.urls import path

from rest_api.views import (
    CoRepresentativeView,
    LegalRepresentativesView,
    LoginView,
    LogoutView,
    MeView,
    MyProfileView,
    MyRegistrationsView,
    RegistrationDetailView,
    RegistrationDownloadView,
    RegistrationsView,
)

urlpatterns = [
    path("login/", LoginView.as_view()),
    path("logout/", LogoutView.as_view()),
    path("me/", MeView.as_view()),
    path("registrations/", RegistrationsView.as_view()),
    path("registrations/<int:pk>/", RegistrationDetailView.as_view()),
    path("registrations/<int:pk>/download/", RegistrationDownloadView.as_view()),
    path("my-registrations/", MyRegistrationsView.as_view()),
    path("legal-representatives/", LegalRepresentativesView.as_view()),
    path("co-representative/", CoRepresentativeView.as_view()),
    path("my-profile/", MyProfileView.as_view()),
]