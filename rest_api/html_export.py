"""
Generate a printable HTML recap of a registration dossier.
No external dependencies required.
"""

import html
from typing import Optional

from registration.models import LegalRepresentative, PupilLegalRepresentative, RegistrationFile

DISEASE_LABELS = {
    "angine": "Angine",
    "asthme": "Asthme",
    "coqueluche": "Coqueluche",
    "oreillons": "Oreillons",
    "otites": "Otites",
    "rhumatisme": "Rhumatisme",
    "rougeole": "Rougeole",
    "rubeole": "Rubéole",
    "scarlatine": "Scarlatine",
    "varicelle": "Varicelle",
}

FAMILY_SITUATION_LABELS = {
    "married_or_cohabiting": "Marié(e) / En couple",
    "divorced_or_separated": "Divorcé(e) / Séparé(e)",
    "single_parent": "Parent seul",
}

CSS = """
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #222; background: #fff; padding: 24px; }
h1 { font-size: 20px; margin-bottom: 4px; }
.subtitle { color: #666; font-size: 13px; margin-bottom: 24px; }
h2 { font-size: 14px; font-weight: bold; color: #1a56a0; border-bottom: 2px solid #1a56a0; padding-bottom: 4px; margin: 20px 0 10px; }
h3 { font-size: 13px; font-weight: bold; margin: 14px 0 8px; color: #333; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px 16px; }
.grid.two { grid-template-columns: repeat(2, 1fr); }
.grid.four { grid-template-columns: repeat(4, 1fr); }
.field { margin-bottom: 8px; }
.label { font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: .3px; }
.value { font-size: 13px; color: #111; }
.value.empty { color: #aaa; font-style: italic; }
.bool-yes { color: #1a7f37; font-weight: bold; }
.bool-no { color: #cf1322; }
.bool-na { color: #aaa; font-style: italic; }
.tag { display: inline-block; background: #fff3cd; border: 1px solid #ffc107; color: #664d03; border-radius: 3px; padding: 1px 6px; font-size: 11px; margin: 2px; }
.doc { margin: 4px 0; font-size: 12px; }
.doc .ok { color: #1a7f37; }
.doc .missing { color: #aaa; font-style: italic; }
.contact-block { border-left: 3px solid #ddd; padding-left: 10px; margin: 6px 0; }
.contact-block .name { font-weight: bold; }
.lr-card { border: 1px solid #ccc; border-radius: 4px; padding: 12px 16px; margin-top: 12px; }
.lr-card h3 { margin-top: 0; color: #1a56a0; }
.completion { font-size: 12px; color: #555; }
.completion-bar-bg { background: #e9ecef; border-radius: 4px; height: 8px; width: 200px; display: inline-block; vertical-align: middle; margin: 0 8px; }
.completion-bar-fg { background: #1a56a0; border-radius: 4px; height: 8px; }
hr { border: none; border-top: 1px solid #eee; margin: 4px 0; }
@media print {
    body { padding: 0; }
    h2 { break-before: auto; }
}
"""


def esc(value) -> str:
    """Escape and format a value for HTML output."""
    if value is None or value == "":
        return '<span class="value empty">—</span>'
    return f'<span class="value">{html.escape(str(value))}</span>'


def field(label: str, value) -> str:
    return (
        f'<div class="field">'
        f'<div class="label">{html.escape(label)}</div>'
        f'{esc(value)}'
        f'</div>'
    )


def bool_field(label: str, value: Optional[bool]) -> str:
    if value is True:
        disp = '<span class="bool-yes">✓ Oui</span>'
    elif value is False:
        disp = '<span class="bool-no">✗ Non</span>'
    else:
        disp = '<span class="bool-na">Non renseigné</span>'
    return (
        f'<div class="field">'
        f'<div class="label">{html.escape(label)}</div>'
        f'<div class="value">{disp}</div>'
        f'</div>'
    )


def doc_field(label: str, has_file: bool) -> str:
    if has_file:
        return f'<div class="doc"><span class="ok">✓</span> {html.escape(label)}</div>'
    else:
        return f'<div class="doc"><span class="missing">✗ {html.escape(label)} — non fourni</span></div>'


def generate_registration_html(reg: RegistrationFile, completion_pct: int) -> str:
    pupil = reg.pupil
    plrs = (
        PupilLegalRepresentative.objects
        .filter(pupil=pupil)
        .select_related("legal_representative__user")
    )
    lrs: list[LegalRepresentative] = [plr.legal_representative for plr in plrs]

    # ── Section: Élève ──
    fam_sit = (
        FAMILY_SITUATION_LABELS.get(pupil.family_situation, pupil.family_situation)
        if pupil.family_situation else None
    )
    sibs = []
    if pupil.siblings_brothers is not None:
        sibs.append(f"{pupil.siblings_brothers} frère(s)")
    if pupil.siblings_sisters is not None:
        sibs.append(f"{pupil.siblings_sisters} sœur(s)")

    section_eleve = f"""
<h2>Informations de l'élève</h2>
<div class="grid">
  {field("Prénom", pupil.firstname)}
  {field("Nom", pupil.lastname)}
  {field("Niveau", pupil.get_grade_display())}
  {field("Date de naissance", pupil.birth_date)}
  {field("Lieu de naissance", pupil.birth_place)}
  {field("Nationalité", pupil.nationality)}
  {field("Code postal", pupil.postal_code)}
  {field("Adresse", pupil.address)}
</div>

<h2>Situation familiale</h2>
<div class="grid">
  {field("Situation", fam_sit)}
  {field("Fratrie", ", ".join(sibs) if sibs else None)}
</div>
"""

    # ── Section: Fiche sanitaire ──
    diseases = [
        DISEASE_LABELS.get(k, k)
        for k, v in reg.diseases_history.items()
        if v
    ]
    diseases_html = (
        "".join(f'<span class="tag">{html.escape(d)}</span>' for d in diseases)
        if diseases else '<span class="value empty">Aucun antécédent signalé</span>'
    )

    contacts_html = ""
    for c in (reg.emergency_contacts or []):
        name = html.escape(c.get("name", ""))
        phone = html.escape(c.get("phone", ""))
        relation = html.escape(c.get("relation", ""))
        contacts_html += f"""
<div class="contact-block">
  <div class="name">{name}</div>
  <div>{phone}{f" — {relation}" if relation else ""}</div>
</div>
"""
    if not contacts_html:
        contacts_html = '<span class="value empty">—</span>'

    section_sanitaire = f"""
<h2>Fiche sanitaire de liaison</h2>
<div class="grid">
  {bool_field("Autorisation appel SAMU / pompiers", reg.samu_authorized)}
  {field("Médecin traitant", reg.doctor_name_phone)}
  {field("Allergies / informations médicales", reg.allergies_info)}
  {field("Autres vaccinations", reg.other_vaccines)}
</div>
<h3>Antécédents médicaux</h3>
{diseases_html}
<h3>Contacts d'urgence</h3>
{contacts_html}
"""

    # ── Section: Autorisations ──
    pickup_html = ""
    for p in (reg.authorized_pickup_persons or []):
        name = html.escape(p.get("name", ""))
        relation = html.escape(p.get("relation", ""))
        phone = html.escape(p.get("phone", ""))
        address_p = html.escape(p.get("address", ""))
        details = " — ".join(filter(None, [phone, address_p]))
        pickup_html += f"""
<div class="contact-block">
  <div class="name">{name}{f" ({relation})" if relation else ""}</div>
  {f"<div>{details}</div>" if details else ""}
</div>
"""
    if not pickup_html:
        pickup_html = '<span class="value empty">—</span>'

    section_autorisations = f"""
<h2>Autorisations</h2>
<div class="grid four">
  {bool_field("Sortie pédagogique", reg.school_trips_authorized)}
  {bool_field("Droit à l'image", reg.image_rights_authorized)}
  {bool_field("Charte acceptée", reg.charter_accepted)}
</div>
<h3>Personnes autorisées à récupérer l'enfant</h3>
{pickup_html}
"""

    # ── Section: Documents ──
    section_docs = f"""
<h2>Documents joints</h2>
{doc_field("Certificat de naissance / livret de famille", bool(reg.document))}
{doc_field("Carnet de santé / attestation vaccinale", bool(reg.vaccination_document))}
{doc_field("Attestation d'assurance", bool(reg.insurance_document))}
{doc_field("Jugement de divorce / séparation", bool(reg.divorce_judgment))}
"""

    # ── Section: Représentants légaux ──
    lr_cards = ""
    for i, lr in enumerate(lrs):
        full_name = " ".join(filter(None, [lr.firstname, lr.lastname])) or lr.user.email
        phones = [
            f"Portable : {lr.phone_mobile}" if lr.phone_mobile else "",
            f"Fixe : {lr.phone_home}" if lr.phone_home else "",
            f"Travail : {lr.phone_work}" if lr.phone_work else "",
        ]
        phones_html = "<br>".join(p for p in phones if p) or "—"
        pool_atttest = doc_field("Attestation natation", bool(lr.pool_attestation))
        lr_cards += f"""
<div class="lr-card">
  <h3>Représentant {i + 1} — {html.escape(full_name)}</h3>
  <div class="grid two">
    {field("Email", lr.user.email)}
    {field("Date de naissance", lr.birth_date)}
    {field("Adresse", lr.address)}
    {field("Profession", lr.profession)}
    {field("Téléphones", None)}
    {field("Référence assurance", lr.insurance_reference)}
  </div>
  <div class="field"><div class="label">Téléphones</div><div class="value">{phones_html}</div></div>
  <div class="grid four" style="margin-top:8px">
    {bool_field("Autorité parentale", lr.has_parental_authority)}
    {bool_field("Diffusion coordonnées", lr.coordinates_sharing_authorized)}
    {bool_field("Accompagnement piscine", lr.pool_accompaniment)}
  </div>
  {pool_atttest}
</div>
"""

    if not lr_cards:
        lr_cards = '<span class="value empty">Aucun représentant légal associé.</span>'

    section_lr = f"<h2>Représentants légaux</h2>{lr_cards}"

    # ── Completion bar ──
    bar_width = max(0, min(100, completion_pct))
    completion_html = f"""
<div class="completion" style="margin-bottom:16px">
  Complétion du dossier :
  <span class="completion-bar-bg">
    <span class="completion-bar-fg" style="width:{bar_width}%"></span>
  </span>
  <strong>{completion_pct} %</strong>
</div>
"""

    # ── Full document ──
    title = html.escape(f"{pupil.firstname} {pupil.lastname} — Dossier d'inscription")
    return f"""<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>{title}</title>
  <style>{CSS}</style>
</head>
<body>
  <h1>{title}</h1>
  <div class="subtitle">Niveau : {html.escape(pupil.get_grade_display())}</div>
  {completion_html}
  <hr>
  {section_eleve}
  {section_sanitaire}
  {section_autorisations}
  {section_docs}
  {section_lr}
</body>
</html>"""
