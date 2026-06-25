import { Box, Divider, Typography } from "@mui/material";

export function CguPage() {
    return (
        <Box maxWidth={800} mx="auto" mt={4} mb={8}>
            <Typography variant="h4" gutterBottom>
                Conditions Générales d'Utilisation
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" mb={3}>
                Version en vigueur au 1er septembre 2025
            </Typography>

            <Divider sx={{ mb: 3 }} />

            {/* 1 */}
            <Typography variant="h6" gutterBottom>
                1. Présentation du service
            </Typography>
            <Typography variant="body2" paragraph>
                Le présent service numérique, dénommé <strong>Calcas Dashboard</strong>, est mis à
                disposition par l'association <strong>Calandreta Castanet Tolosan</strong> (ci-après
                « l'Association »), dont le siège social est situé 2 avenue Salvador Allende, 31650 Castanet-Tolosan.
            </Typography>
            <Typography variant="body2" paragraph>
                Calcas Dashboard est une plateforme de gestion des dossiers d'inscription scolaire
                destinée à faciliter les échanges entre les familles et l'équipe administrative de
                l'école. Elle permet aux représentants légaux de déposer et de mettre à jour le
                dossier d'inscription de leur enfant, et aux gestionnaires de l'école d'en assurer
                le suivi.
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* 2 */}
            <Typography variant="h6" gutterBottom>
                2. Acceptation des CGU
            </Typography>
            <Typography variant="body2" paragraph>
                L'accès et l'utilisation du service impliquent l'acceptation pleine et entière des
                présentes Conditions Générales d'Utilisation (CGU). Si vous n'acceptez pas ces
                conditions, veuillez ne pas utiliser le service et contacter l'Association pour
                effectuer votre inscription par voie papier.
            </Typography>
            <Typography variant="body2" paragraph>
                L'Association se réserve le droit de modifier les présentes CGU à tout moment. La
                version en vigueur est celle accessible depuis l'interface de la plateforme. Les
                utilisateurs seront informés de toute modification substantielle par messagerie
                électronique.
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* 3 */}
            <Typography variant="h6" gutterBottom>
                3. Accès au service et comptes utilisateurs
            </Typography>
            <Typography variant="body2" paragraph>
                L'accès à Calcas Dashboard est réservé aux personnes disposant d'un compte créé par
                l'Association. Deux types de comptes existent :
            </Typography>
            <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                <li>
                    <Typography variant="body2">
                        <strong>Représentant légal</strong> : parent ou tuteur d'un enfant inscrit ou
                        souhaitant s'inscrire à la Calandreta Castanet Tolosan. Le compte est ouvert
                        sur demande auprès de l'équipe administrative.
                    </Typography>
                </li>
                <li>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>Gestionnaire des inscriptions</strong> : membre du personnel
                        administratif de l'école habilité à consulter et gérer l'ensemble des dossiers.
                    </Typography>
                </li>
            </Box>
            <Typography variant="body2" paragraph>
                Chaque utilisateur est responsable de la confidentialité de ses identifiants de
                connexion. Toute utilisation du service effectuée depuis votre compte est réputée
                être de votre fait. En cas de perte ou de suspicion de compromission de vos
                identifiants, vous devez en informer immédiatement l'Association.
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* 4 */}
            <Typography variant="h6" gutterBottom>
                4. Utilisation du service
            </Typography>
            <Typography variant="body2" paragraph>
                Les utilisateurs s'engagent à utiliser la plateforme de manière loyale, conformément
                à sa finalité (gestion des inscriptions scolaires) et dans le respect des lois et
                règlements en vigueur.
            </Typography>
            <Typography variant="body2" paragraph>
                Il est notamment interdit :
            </Typography>
            <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                <li>
                    <Typography variant="body2">
                        de renseigner des informations fausses ou trompeuses dans les formulaires ;
                    </Typography>
                </li>
                <li>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                        de téléverser des fichiers contenant des virus, logiciels malveillants ou
                        tout contenu illicite ;
                    </Typography>
                </li>
                <li>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                        de tenter d'accéder aux données d'autres utilisateurs ou à des fonctionnalités
                        non attribuées à votre rôle ;
                    </Typography>
                </li>
                <li>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                        de partager votre compte avec des tiers non autorisés.
                    </Typography>
                </li>
            </Box>
            <Typography variant="body2" paragraph>
                Les données renseignées (informations personnelles de l'enfant, fiche sanitaire,
                documents joints, etc.) doivent être exactes, complètes et mises à jour dès que
                nécessaire.
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* 5 */}
            <Typography variant="h6" gutterBottom>
                5. Dossier d'inscription et validité
            </Typography>
            <Typography variant="body2" paragraph>
                Un dossier d'inscription soumis via la plateforme est traité par l'équipe
                administrative dans les meilleurs délais. La soumission d'un dossier en ligne ne
                vaut pas confirmation d'inscription. L'inscription n'est définitive qu'après
                validation explicite de l'Association et réception de l'ensemble des pièces
                requises.
            </Typography>
            <Typography variant="body2" paragraph>
                Un dossier peut être modifié par le représentant légal tant qu'il n'a pas été
                clôturé par le gestionnaire. Une fois clôturé, il passe en lecture seule ; toute
                modification doit être demandée directement à l'Administration.
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* 6 */}
            <Typography variant="h6" gutterBottom>
                6. Disponibilité du service
            </Typography>
            <Typography variant="body2" paragraph>
                L'Association s'efforce de maintenir le service accessible en permanence. Toutefois,
                des interruptions peuvent survenir pour des raisons de maintenance, de mise à jour ou
                de force majeure. L'Association ne saurait être tenue responsable de toute
                interruption ou indisponibilité du service.
            </Typography>
            <Typography variant="body2" paragraph>
                En dehors des périodes d'ouverture des campagnes d'inscription, certaines
                fonctionnalités peuvent être restreintes.
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* 7 */}
            <Typography variant="h6" gutterBottom>
                7. Protection des données personnelles
            </Typography>
            <Typography variant="body2" paragraph>
                Le traitement des données à caractère personnel collectées via la plateforme est
                décrit dans notre Politique de confidentialité (RGPD), accessible depuis le menu de
                navigation (« Données personnelles »).
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* 8 */}
            <Typography variant="h6" gutterBottom>
                8. Propriété intellectuelle
            </Typography>
            <Typography variant="body2" paragraph>
                L'ensemble des éléments composant la plateforme (code source, logo, graphismes,
                contenus éditoriaux) est la propriété de l'Association ou de ses ayants droit. Toute
                reproduction, représentation ou exploitation non autorisée est interdite.
            </Typography>
            <Typography variant="body2" paragraph>
                Les documents téléversés par les utilisateurs (attestations, carnet de santé, etc.)
                restent la propriété de leurs auteurs. L'utilisateur concède à l'Association le
                droit de les stocker et de les consulter dans le seul cadre de la gestion des
                inscriptions.
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* 9 */}
            <Typography variant="h6" gutterBottom>
                9. Limitation de responsabilité
            </Typography>
            <Typography variant="body2" paragraph>
                L'Association ne saurait être tenue responsable des dommages directs ou indirects
                résultant de l'utilisation ou de l'impossibilité d'utiliser le service, d'une
                erreur ou d'une omission dans les informations fournies par un utilisateur, ou
                d'une utilisation contraire aux présentes CGU.
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* 10 */}
            <Typography variant="h6" gutterBottom>
                10. Droit applicable et juridiction compétente
            </Typography>
            <Typography variant="body2" paragraph>
                Les présentes CGU sont soumises au droit français. En cas de litige relatif à leur
                interprétation ou à leur exécution, les parties s'efforceront de trouver une
                solution amiable. À défaut, les tribunaux compétents de Toulouse seront seuls
                habilités à connaître du différend.
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* 11 */}
            <Typography variant="h6" gutterBottom>
                11. Contact
            </Typography>
            <Typography variant="body2" paragraph>
                Pour toute question relative aux présentes CGU, vous pouvez contacter l'Association
                à l'adresse suivante :{" "}
                cap.castanet@calandreta.org ou par courrier postal : 2 avenue Salvador Allende,
                31650 Castanet-Tolosan — tél. 05 62 71 29 67.
            </Typography>
        </Box>
    );
}
