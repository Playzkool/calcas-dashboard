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
    PupilLegalRepresentative,
    RegistrationCampaign,
    RegistrationFile,
    RegistrationSupervisor,
)
from rest_api.serializers import (
    LegalRepresentativeCreateSerializer,
    LegalRepresentativeListItemSerializer,
    LegalRepresentativeProfileSerializer,
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
        lr = LegalRepresentative.objects.filter(user=request.user).first()
        if not lr:
            return Response({"detail": "Réservé aux représentants légaux."}, status=status.HTTP_403_FORBIDDEN)
        serializer = RegistrationFileCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        registration_file = serializer.save(legal_representative=lr)
        return Response({"id": registration_file.id}, status=status.HTTP_201_CREATED)


class MyRegistrationsView(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)

    def get(self, request):
        lr = LegalRepresentative.objects.filter(user=request.user).first()
        if not lr:
            return Response({"detail": "Réservé aux représentants légaux."}, status=status.HTTP_403_FORBIDDEN)
        pupil_ids = PupilLegalRepresentative.objects.filter(legal_representative=lr).values_list("pupil_id", flat=True)
        qs = RegistrationFile.objects.filter(pupil_id__in=pupil_ids).select_related("pupil")
        serializer = RegistrationListItemSerializer(qs, many=True, context={"request": request})
        return Response(serializer.data)


class CoRepresentativeView(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)

    def get(self, request):
        lr = LegalRepresentative.objects.filter(user=request.user).first()
        if not lr:
            return Response({"detail": "Réservé aux représentants légaux."}, status=status.HTTP_403_FORBIDDEN)
        plrs = PupilLegalRepresentative.objects.filter(legal_representative=lr).select_related("pupil")
        result = []
        for plr in plrs:
            pupil = plr.pupil
            co_plr = (
                PupilLegalRepresentative.objects
                .filter(pupil=pupil)
                .exclude(legal_representative=lr)
                .select_related("legal_representative__user")
                .first()
            )
            result.append({
                "pupil_id": pupil.id,
                "pupil_firstname": pupil.firstname,
                "pupil_lastname": pupil.lastname,
                "grade_label": pupil.get_grade_display(),
                "co_representative_email": co_plr.legal_representative.user.email if co_plr else None,
            })
        return Response(result)

    def post(self, request):
        lr = LegalRepresentative.objects.filter(user=request.user).first()
        if not lr:
            return Response({"detail": "Réservé aux représentants légaux."}, status=status.HTTP_403_FORBIDDEN)
        pupil_id = request.data.get("pupil_id")
        if not pupil_id:
            return Response({"detail": "pupil_id est requis."}, status=status.HTTP_400_BAD_REQUEST)
        plr = PupilLegalRepresentative.objects.filter(legal_representative=lr, pupil_id=pupil_id).select_related("pupil").first()
        if not plr:
            return Response({"detail": "Élève non associé à votre compte."}, status=status.HTTP_400_BAD_REQUEST)
        pupil = plr.pupil
        if PupilLegalRepresentative.objects.filter(pupil=pupil).exclude(legal_representative=lr).exists():
            return Response({"detail": "Un co-représentant est déjà associé à cet élève."}, status=status.HTTP_400_BAD_REQUEST)
        serializer = LegalRepresentativeCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_lr = serializer.save()
        PupilLegalRepresentative.objects.create(pupil=pupil, legal_representative=new_lr)
        return Response({"id": new_lr.id}, status=status.HTTP_201_CREATED)


class MyProfileView(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)
    parser_classes = (MultiPartParser, JSONParser)

    def get(self, request):
        lr = LegalRepresentative.objects.filter(user=request.user).first()
        if not lr:
            return Response({"detail": "Réservé aux représentants légaux."}, status=status.HTTP_403_FORBIDDEN)
        serializer = LegalRepresentativeProfileSerializer(lr, context={"request": request})
        return Response(serializer.data)

    def patch(self, request):
        lr = LegalRepresentative.objects.filter(user=request.user).first()
        if not lr:
            return Response({"detail": "Réservé aux représentants légaux."}, status=status.HTTP_403_FORBIDDEN)
        serializer = LegalRepresentativeProfileSerializer(
            lr, data=request.data, partial=True, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


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