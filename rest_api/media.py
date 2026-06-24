"""
Téléchargement authentifié des fichiers média.

Contexte sécurité
------------------
Les pièces jointes (certificats de naissance, carnets de santé, jugements de
divorce, photos d'identité…) concernent des mineurs et relèvent de données
personnelles sensibles (RGPD art. 9 pour les données de santé).

Avant ce correctif, ces fichiers étaient servis directement par nginx via
`location /media/`, SANS aucune vérification d'authentification ni
d'autorisation : toute personne connaissant (ou devinant) l'URL pouvait les
télécharger, contournant entièrement les contrôles d'accès de l'API.

Ce module réintroduit ces contrôles : un fichier n'est servi qu'à un
utilisateur authentifié ET autorisé à consulter l'objet auquel il est rattaché,
en réutilisant la même logique d'autorisation que les vues JSON.

Durcissement complémentaire : les fichiers sont renvoyés en pièce jointe
(`Content-Disposition: attachment`) avec `X-Content-Type-Options: nosniff`,
ce qui neutralise également le risque de XSS stocké via un fichier polyglotte.
"""

import os

from django.http import FileResponse, Http404
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from registration.models import (
    LegalRepresentative,
    PupilLegalRepresentative,
    RegistrationFile,
    RegistrationSupervisor,
)

# Champs fichier autorisés au téléchargement, avec le nom « lisible » redonné
# à l'utilisateur (le fichier est stocké sous un UUID : on lui rend un nom
# parlant au moment du téléchargement). Sert aussi de liste blanche stricte :
# tout `field` hors de ce dict renvoie 404 (pas d'accès à un attribut arbitraire).
REGISTRATION_FILE_FIELDS = {
    "document": "certificat_naissance",
    "vaccination_document": "carnet_sante",
    "insurance_document": "attestation_assurance",
    "divorce_judgment": "jugement_divorce",
    "photo": "photo_identite",
    **{f"document_{n}": f"autre_document_{n}" for n in range(2, 11)},
}


# ── Helpers d'autorisation (mêmes règles que les vues JSON) ───────────────────

def _is_supervisor(user) -> bool:
    return RegistrationSupervisor.objects.filter(user=user).exists()


def _registration_visible_to(user, pk):
    """Retourne le RegistrationFile si `user` peut le consulter, sinon None.

    - Gestionnaire        : accès à tous les dossiers.
    - Représentant légal  : uniquement les dossiers de ses propres élèves.
    """
    if _is_supervisor(user):
        return RegistrationFile.objects.filter(pk=pk).first()

    lr = LegalRepresentative.objects.filter(user=user).first()
    if not lr:
        return None
    pupil_ids = PupilLegalRepresentative.objects.filter(
        legal_representative=lr
    ).values_list("pupil_id", flat=True)
    return RegistrationFile.objects.filter(pk=pk, pupil_id__in=pupil_ids).first()


def _lr_visible_to(user, target_lr) -> bool:
    """Vrai si `user` peut voir l'attestation piscine de `target_lr`.

    - Gestionnaire : oui.
    - Soi-même : oui.
    - Représentant légal partageant un élève avec la cible : oui
      (cohérent avec l'affichage des co-représentants dans le détail dossier).
    """
    if _is_supervisor(user):
        return True
    viewer = LegalRepresentative.objects.filter(user=user).first()
    if not viewer:
        return False
    if viewer.id == target_lr.id:
        return True
    viewer_pupil_ids = PupilLegalRepresentative.objects.filter(
        legal_representative=viewer
    ).values_list("pupil_id", flat=True)
    return PupilLegalRepresentative.objects.filter(
        legal_representative=target_lr, pupil_id__in=viewer_pupil_ids
    ).exists()


def _serve(field_file, download_name: str) -> FileResponse:
    """Renvoie un FieldFile en téléchargement sécurisé.

    - `as_attachment=True` → force le téléchargement plutôt que l'interprétation
      du fichier par le navigateur (neutralise un HTML/SVG malveillant).
    - `X-Content-Type-Options: nosniff` → empêche le MIME sniffing.
    """
    ext = os.path.splitext(field_file.name)[1].lower()
    response = FileResponse(
        field_file.open("rb"),
        as_attachment=True,
        filename=f"{download_name}{ext}",
    )
    response["X-Content-Type-Options"] = "nosniff"
    return response


# ── Vues ──────────────────────────────────────────────────────────────────────

class RegistrationFileDownloadView(APIView):
    """GET /api/registrations/<pk>/files/<field>/ — pièce jointe d'un dossier."""

    permission_classes = (IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)

    def get(self, request, pk, field):
        # Liste blanche stricte des champs autorisés.
        if field not in REGISTRATION_FILE_FIELDS:
            raise Http404

        registration = _registration_visible_to(request.user, pk)
        # 404 (et non 403) : ne révèle pas l'existence d'un dossier non autorisé.
        if registration is None:
            raise Http404

        field_file = getattr(registration, field, None)
        if not field_file:
            raise Http404

        return _serve(field_file, REGISTRATION_FILE_FIELDS[field])


class PoolAttestationDownloadView(APIView):
    """GET /api/legal-representatives/<pk>/pool-attestation/ — attestation natation."""

    permission_classes = (IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)

    def get(self, request, pk):
        target = LegalRepresentative.objects.filter(pk=pk).first()
        if target is None or not _lr_visible_to(request.user, target):
            raise Http404
        if not target.pool_attestation:
            raise Http404
        return _serve(target.pool_attestation, "attestation_piscine")
