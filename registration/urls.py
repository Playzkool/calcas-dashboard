from django.urls import path
from registration import views

app_name = 'registration'

urlpatterns = [
    path('', views.DashboardViewHome.as_view(), name='home'),
    path('recover/', views.Recover.as_view(), name='password_reset_recover'),
]