from rest_framework.authentication import SessionAuthentication
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from rest_api.serializers import RegistrationFileCreateSerializer


class UserInfosView(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)

    def get(self, request):
        return Response({"username": request.user.username})


class RegistrationFileCreateView(APIView):
    permission_classes = (AllowAny,)
    parser_classes = (MultiPartParser,)

    def post(self, request):
        serializer = RegistrationFileCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        registration_file = serializer.save()
        return Response({"id": registration_file.id}, status=status.HTTP_201_CREATED)