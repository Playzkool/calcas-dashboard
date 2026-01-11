from django.urls import path, include

from rest_api.views import UserInfosView

urlpatterns = [
    path('user-infos/', UserInfosView.as_view()),
]