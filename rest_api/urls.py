from django.urls import path

from rest_api.views import UserInfosView, RegistrationFileCreateView

urlpatterns = [
    path('user-infos/', UserInfosView.as_view()),
    path('registrations/', RegistrationFileCreateView.as_view()),
]