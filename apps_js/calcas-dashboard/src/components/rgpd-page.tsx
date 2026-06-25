import { Box, Chip, Divider, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";

export function RgpdPage() {
    return (
        <Box maxWidth={800} mx="auto" mt={4} mb={8}>
            <Typography variant="h4" gutterBottom>
                Protection des données personnelles
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                Politique de confidentialité — Règlement (UE) 2016/679 (RGPD)
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" mb={3}>
                Version en vigueur au 1er septembre 2025
            </Typography>

            <Divider sx={{ mb: 3 }} />

            {/* 1 */}
            <Typography variant="h6" gutterBottom>
                1. Responsable du traitement
            </Typography>
            <Typography variant="body2" paragraph>
                Le responsable du traitement des données collectées via la plateforme Calcas Dashboard
                est :
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="body2">
                    <strong>Association Calandreta Castanet Tolosan</strong>
                    <br />
                    2 avenue Salvador Allende
                    <br />
                    31650 Castanet-Tolosan
                    <br />
                    E-mail : cap.castanet@calandreta.org
                    <br />
                    Téléphone : 05 62 71 29 67
                </Typography>
            </Paper>

            <Divider sx={{ my: 3 }} />

            {/* 2 */}
            <Typography variant="h6" gutterBottom>
                2. Données collectées
            </Typography>
            <Typography variant="body2" paragraph>
                Dans le cadre de la gestion des inscriptions scolaires, la plateforme collecte les
                catégories de données suivantes :
            </Typography>

            <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Catégorie</strong></TableCell>
                            <TableCell><strong>Données</strong></TableCell>
                            <TableCell><strong>Sensibilité</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>Identité de l'enfant</TableCell>
                            <TableCell>Prénom, nom, date et lieu de naissance, nationalité, adresse, niveau de classe</TableCell>
                            <TableCell><Chip label="Standard" size="small" /></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Situation familiale</TableCell>
                            <TableCell>Statut marital des parents, nombre de frères et sœurs</TableCell>
                            <TableCell><Chip label="Standard" size="small" /></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Données de santé de l'enfant</TableCell>
                            <TableCell>Antécédents médicaux, vaccinations, allergies, autorisation SAMU, médecin traitant</TableCell>
                            <TableCell><Chip label="Sensible (Art. 9)" size="small" color="warning" /></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Représentants légaux</TableCell>
                            <TableCell>Prénom, nom, date de naissance, adresse, e-mail, téléphones (domicile, mobile, travail), profession, autorité parentale, référence assurance</TableCell>
                            <TableCell><Chip label="Standard" size="small" /></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Contacts d'urgence</TableCell>
                            <TableCell>Nom, téléphone, lien de parenté des personnes à prévenir</TableCell>
                            <TableCell><Chip label="Standard" size="small" /></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Personnes autorisées</TableCell>
                            <TableCell>Nom, lien, téléphone, adresse des personnes autorisées à récupérer l'enfant</TableCell>
                            <TableCell><Chip label="Standard" size="small" /></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Documents justificatifs</TableCell>
                            <TableCell>Carnet de santé / attestation vaccinale, attestation d'assurance, copie de jugement (divorce/séparation), autre document</TableCell>
                            <TableCell><Chip label="Standard / Sensible" size="small" color="warning" /></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Autorisations parentales</TableCell>
                            <TableCell>Accord pour les sorties scolaires, droit à l'image, accompagnement piscine</TableCell>
                            <TableCell><Chip label="Standard" size="small" /></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Données de connexion</TableCell>
                            <TableCell>Identifiant (adresse e-mail), mot de passe haché</TableCell>
                            <TableCell><Chip label="Standard" size="small" /></TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>

            <Typography variant="body2" paragraph>
                <strong>Note concernant les données de santé :</strong> les données de santé sont
                des données sensibles au sens de l'article 9 du RGPD. Leur collecte est fondée sur
                votre consentement explicite et sur la nécessité de protéger les intérêts vitaux de
                l'enfant (art. 9, §2, c et h du RGPD).
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* 3 */}
            <Typography variant="h6" gutterBottom>
                3. Finalités et bases légales du traitement
            </Typography>

            <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Finalité</strong></TableCell>
                            <TableCell><strong>Base légale (RGPD)</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>Gestion des dossiers d'inscription scolaire</TableCell>
                            <TableCell>Exécution d'un contrat (art. 6, §1, b)</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Suivi de la santé et de la sécurité de l'enfant (fiche sanitaire, autorisation SAMU)</TableCell>
                            <TableCell>Consentement + protection des intérêts vitaux (art. 6, §1, a et d ; art. 9, §2, c)</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Communication avec les familles</TableCell>
                            <TableCell>Intérêt légitime de l'association (art. 6, §1, f)</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Partage des coordonnées entre parents (avec consentement)</TableCell>
                            <TableCell>Consentement (art. 6, §1, a)</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Droit à l'image (photographies, vidéos)</TableCell>
                            <TableCell>Consentement (art. 6, §1, a)</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Respect des obligations légales (garde alternée, autorité parentale)</TableCell>
                            <TableCell>Obligation légale (art. 6, §1, c)</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Sécurité de la plateforme (authentification, logs)</TableCell>
                            <TableCell>Intérêt légitime (art. 6, §1, f)</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>

            <Divider sx={{ my: 3 }} />

            {/* 4 */}
            <Typography variant="h6" gutterBottom>
                4. Destinataires des données
            </Typography>
            <Typography variant="body2" paragraph>
                Les données collectées sont accessibles uniquement aux personnes habilitées :
            </Typography>
            <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                <li>
                    <Typography variant="body2">
                        <strong>L'équipe administrative de l'école</strong> (gestionnaires des
                        inscriptions) pour la gestion des dossiers ;
                    </Typography>
                </li>
                <li>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                        <strong>Les représentants légaux eux-mêmes</strong>, pour les données
                        relatives à leur propre dossier et à leur profil ;
                    </Typography>
                </li>
                <li>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                        <strong>Les prestataires techniques</strong> assurant l'hébergement et la
                        maintenance de la plateforme, liés par des obligations contractuelles de
                        confidentialité.
                    </Typography>
                </li>
            </Box>
            <Typography variant="body2" paragraph>
                Les données ne sont pas transmises à des tiers à des fins commerciales ou
                publicitaires, ni cédées à des partenaires extérieurs sans votre consentement
                explicite.
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* 5 */}
            <Typography variant="h6" gutterBottom>
                5. Durée de conservation
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Type de données</strong></TableCell>
                            <TableCell><strong>Durée de conservation</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>Dossier d'inscription (données de l'enfant et documents)</TableCell>
                            <TableCell>Durée de scolarisation + 3 ans après la sortie de l'enfant</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Données de santé</TableCell>
                            <TableCell>Durée de scolarisation, puis archivage sécurisé 5 ans</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Compte représentant légal</TableCell>
                            <TableCell>Durée de scolarisation du dernier enfant inscrit + 1 an</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Données de connexion (logs)</TableCell>
                            <TableCell>12 mois glissants</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
            <Typography variant="body2" paragraph>
                À l'expiration de ces délais, les données sont supprimées ou anonymisées de façon
                sécurisée.
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* 6 */}
            <Typography variant="h6" gutterBottom>
                6. Transferts hors Union européenne
            </Typography>
            <Typography variant="body2" paragraph>
                Les données sont hébergées sur des serveurs situés au sein de l'Union européenne.
                Aucun transfert de données vers des pays tiers n'est effectué. Si cette situation
                devait évoluer, vous en seriez informés préalablement et les garanties appropriées
                (clauses contractuelles types, décision d'adéquation) seraient mises en place.
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* 7 */}
            <Typography variant="h6" gutterBottom>
                7. Vos droits
            </Typography>
            <Typography variant="body2" paragraph>
                Conformément au RGPD (articles 15 à 22), vous disposez des droits suivants sur vos
                données personnelles :
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Droit</strong></TableCell>
                            <TableCell><strong>Description</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell><strong>Accès</strong> (art. 15)</TableCell>
                            <TableCell>Obtenir une copie des données vous concernant</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><strong>Rectification</strong> (art. 16)</TableCell>
                            <TableCell>Corriger des données inexactes ou incomplètes</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><strong>Effacement</strong> (art. 17)</TableCell>
                            <TableCell>Demander la suppression de vos données, sous réserve des obligations légales de conservation</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><strong>Limitation</strong> (art. 18)</TableCell>
                            <TableCell>Demander la suspension temporaire du traitement</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><strong>Portabilité</strong> (art. 20)</TableCell>
                            <TableCell>Recevoir vos données dans un format structuré et lisible par machine</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><strong>Opposition</strong> (art. 21)</TableCell>
                            <TableCell>Vous opposer à un traitement fondé sur l'intérêt légitime</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><strong>Retrait du consentement</strong> (art. 7)</TableCell>
                            <TableCell>Retirer à tout moment un consentement précédemment donné (ex. : droit à l'image, partage de coordonnées)</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
            <Typography variant="body2" paragraph>
                Pour exercer vos droits, vous pouvez contacter le responsable du traitement par
                e-mail à cap.castanet@calandreta.org ou par courrier postal.
                Une réponse vous sera apportée dans un délai d'un mois (délai pouvant être porté à
                trois mois pour les demandes complexes).
            </Typography>
            <Typography variant="body2" paragraph>
                Si vous estimez que vos droits ne sont pas respectés, vous pouvez également
                introduire une réclamation auprès de la{" "}
                <strong>
                    Commission Nationale de l'Informatique et des Libertés (CNIL)
                </strong>{" "}
                — 3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07 —{" "}
                <strong>www.cnil.fr</strong>.
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* 8 */}
            <Typography variant="h6" gutterBottom>
                8. Sécurité des données
            </Typography>
            <Typography variant="body2" paragraph>
                L'Association met en œuvre les mesures techniques et organisationnelles appropriées
                pour garantir la sécurité et la confidentialité des données :
            </Typography>
            <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                <li>
                    <Typography variant="body2">
                        Chiffrement des communications (HTTPS/TLS) ;
                    </Typography>
                </li>
                <li>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                        Mots de passe stockés sous forme hachée (non lisibles) ;
                    </Typography>
                </li>
                <li>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                        Contrôle d'accès strict par rôle (les représentants légaux ne voient que
                        leurs propres dossiers) ;
                    </Typography>
                </li>
                <li>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                        Protection contre les attaques CSRF et les injections ;
                    </Typography>
                </li>
                <li>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                        Sauvegardes régulières des données.
                    </Typography>
                </li>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* 9 */}
            <Typography variant="h6" gutterBottom>
                9. Cookies et traceurs
            </Typography>
            <Typography variant="body2" paragraph>
                La plateforme utilise uniquement des cookies de session strictement nécessaires au
                bon fonctionnement de l'authentification (maintien de la session utilisateur et
                protection CSRF). Ces cookies ne sont pas utilisés à des fins publicitaires ou de
                suivi comportemental et ne nécessitent pas de consentement préalable au sens de la
                directive ePrivacy.
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* 10 */}
            <Typography variant="h6" gutterBottom>
                10. Modification de la politique de confidentialité
            </Typography>
            <Typography variant="body2" paragraph>
                La présente politique peut être mise à jour pour refléter les évolutions légales ou
                techniques. La date de mise à jour est indiquée en haut du document. En cas de
                modification substantielle affectant vos droits, vous en serez informés par
                e-mail ou via une notification sur la plateforme.
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* 11 */}
            <Typography variant="h6" gutterBottom>
                11. Contact
            </Typography>
            <Typography variant="body2" paragraph>
                Pour toute question relative à la protection de vos données personnelles :
            </Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="body2">
                    <strong>Calandreta Castanet Tolosan</strong>
                    <br />
                    E-mail : cap.castanet@calandreta.org
                    <br />
                    2 avenue Salvador Allende, 31650 Castanet-Tolosan
                </Typography>
            </Paper>
        </Box>
    );
}
