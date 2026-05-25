from datetime import date

from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.parsers import JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from registration.models import (
    LegalRepresentative,
    RegistrationCampaign,
    RegistrationFile,
    RegistrationSupervisor,
)
from rest_api.serializers import (
    LegalRepresentativeCreateSerializer,
    LegalRepresentativeListItemSerializer,
    RegistrationFileCreateSerializer,
    RegistrationListItemSerializer,
)


def _get_role(user):
    if LegalRepresentative.objects.filter(user=user).exists():
        return "legal_representative"
    if RegistrationSupervisor.objects.filter(user=user).exists():
        return "registration_supervisor"
    return None


class LoginView(APIView):
    permission_classes = (AllowAny,)
    authentication_classes = ()

    def post(self, request):
        username = request.data.get("username", "")
        password = request.data.get("password", "")
        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response({"detail": "Identifiants invalides."}, status=status.HTTP_401_UNAUTHORIZED)
        login(request, user)
        get_token(request)  # ensure csrftoken cookie is set on the response
        role = _get_role(user)
        if role is None:
            return Response({"detail": "Aucun rôle attribué à ce compte."}, status=status.HTTP_403_FORBIDDEN)
        return Response({"username": user.username, "role": role})


class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)

    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)

    def get(self, request):
        role = _get_role(request.user)
        return Response({"username": request.user.username, "role": role})


class RegistrationsView(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)
    parser_classes = (MultiPartParser, JSONParser)

    def get(self, request):
        if not RegistrationSupervisor.objects.filter(user=request.user).exists():
            return Response({"detail": "Réservé aux gestionnaires."}, status=status.HTTP_403_FORBIDDEN)
        today = date.today()
        campaign = RegistrationCampaign.objects.filter(year__year=today.year).first()
        if not campaign:
            return Response([])
        qs = RegistrationFile.objects.filter(campaign=campaign).select_related("pupil")
        serializer = RegistrationListItemSerializer(qs, many=True, context={"request": request})
        return Response(serializer.data)

    def post(self, request):
        if not LegalRepresentative.objects.filter(user=request.user).exists():
            return Response({"detail": "Réservé aux représentants légaux."}, status=status.HTTP_403_FORBIDDEN)
        serializer = RegistrationFileCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        registration_file = serializer.save()
        return Response({"id": registration_file.id}, status=status.HTTP_201_CREATED)


class LegalRepresentativesView(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)

    def get(self, request):
        if not RegistrationSupervisor.objects.filter(user=request.user).exists():
            return Response({"detail": "Réservé aux gestionnaires."}, status=status.HTTP_403_FORBIDDEN)
        qs = LegalRepresentative.objects.select_related("user").order_by("-date_creation")
        serializer = LegalRepresentativeListItemSerializer(qs, many=True)
        return Response(serializer.data)

    def post(self, request):
        if not RegistrationSupervisor.objects.filter(user=request.user).exists():
            return Response({"detail": "Réservé aux gestionnaires."}, status=status.HTTP_403_FORBIDDEN)
        serializer = LegalRepresentativeCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        lr = serializer.save()
        return Response({"id": lr.id}, status=status.HTTP_201_CREATED)