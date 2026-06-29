import { useEffect, useRef, useState } from "react";
import {
    Alert,
    Box,
    Button,
    ButtonGroup,
    Chip,
    CircularProgress,
    ClickAwayListener,
    Grow,
    LinearProgress,
    MenuItem,
    MenuList,
    Paper,
    Popper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchRegistrations } from "../store/registrations-list-slice";
import { RegistrationDetailView } from "./registration-detail";

// ─── Completion badge ─────────────────────────────────────────────────────────

function CompletionCell({ pct }: { pct: number }) {
    const color =
        pct >= 80 ? "success" :
        pct >= 50 ? "warning" :
        "error";

    return (
        <Box sx={{ minWidth: 100 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                    {pct} %
                </Typography>
            </Box>
            <LinearProgress
                variant="determinate"
                value={pct}
                color={color}
                sx={{ height: 6, borderRadius: 3 }}
            />
        </Box>
    );
}

// ─── Export dropdown ──────────────────────────────────────────────────────────

const EXPORT_OPTIONS = [
    { label: "Excel (.xlsx)", format: "excel" },
    { label: "CSV (.csv)",    format: "csv"   },
    { label: "ODT (.odt)",    format: "odt"   },
    { label: "HTML (.html)",  format: "html"  },
];

function ExportButton() {
    const [open, setOpen] = useState(false);
    const anchorRef = useRef<HTMLDivElement>(null);

    const handleToggle = () => setOpen((prev) => !prev);
    const handleClose = (event: Event) => {
        if (anchorRef.current?.contains(event.target as HTMLElement)) return;
        setOpen(false);
    };

    const handleExport = (format: string) => {
        window.location.href = `/api/registrations/export/?format=${format}`;
        setOpen(false);
    };

    return (
        <>
            <ButtonGroup variant="contained" ref={anchorRef}>
                <Button
                    startIcon={<DownloadIcon />}
                    onClick={() => handleExport("excel")}
                >
                    Exporter
                </Button>
                <Button size="small" onClick={handleToggle} aria-label="Choisir le format d'export">
                    <ArrowDropDownIcon />
                </Button>
            </ButtonGroup>

            <Popper open={open} anchorEl={anchorRef.current} transition disablePortal placement="bottom-end" style={{ zIndex: 10 }}>
                {({ TransitionProps }) => (
                    <Grow {...TransitionProps}>
                        <Paper elevation={3}>
                            <ClickAwayListener onClickAway={handleClose}>
                                <MenuList autoFocusItem>
                                    {EXPORT_OPTIONS.map(({ label, format }) => (
                                        <MenuItem key={format} onClick={() => handleExport(format)}>
                                            {label}
                                        </MenuItem>
                                    ))}
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function RegistrationsList() {
    const dispatch = useAppDispatch();
    const { items, status, error } = useAppSelector((s) => s.registrationsList);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    useEffect(() => {
        if (status === "idle") dispatch(fetchRegistrations());
    }, [dispatch, status]);

    if (selectedId !== null) {
        return (
            <RegistrationDetailView
                id={selectedId}
                onBack={() => setSelectedId(null)}
            />
        );
    }

    if (status === "idle" || status === "loading") {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (status === "failed") {
        return <Alert severity="error">{error ?? "Erreur lors du chargement."}</Alert>;
    }

    return (
        <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h5">
                    Inscriptions – année en cours
                </Typography>
                <ExportButton />
            </Box>

            {items.length === 0 ? (
                <Typography color="text.secondary">Aucune inscription pour l'année en cours.</Typography>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Prénom</TableCell>
                                <TableCell>Nom</TableCell>
                                <TableCell>Date de naissance</TableCell>
                                <TableCell>Niveau</TableCell>
                                <TableCell>Complétion</TableCell>
                                <TableCell>Statut</TableCell>
                                <TableCell align="center">Dossier</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map((item) => (
                                <Tooltip
                                    key={item.id}
                                    title="Cliquer pour voir le dossier complet"
                                    placement="left"
                                >
                                    <TableRow
                                        hover
                                        onClick={() => setSelectedId(item.id)}
                                        sx={{ cursor: "pointer" }}
                                    >
                                        <TableCell>{item.firstname}</TableCell>
                                        <TableCell>{item.lastname}</TableCell>
                                        <TableCell>{item.birth_date}</TableCell>
                                        <TableCell>{item.grade_label}</TableCell>
                                        <TableCell sx={{ minWidth: 130 }}>
                                            <CompletionCell pct={item.completion_pct} />
                                        </TableCell>
                                        <TableCell>
                                            {item.is_closed
                                                ? <Chip label="Clôturé" size="small" color="default" />
                                                : <Chip label="En cours" size="small" color="success" variant="outlined" />
                                            }
                                        </TableCell>
                                        <TableCell
                                            align="center"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Tooltip title="Télécharger le dossier (.zip)">
                                                <span>
                                                    <DownloadIcon
                                                        fontSize="small"
                                                        sx={{ cursor: "pointer", color: "primary.main", verticalAlign: "middle" }}
                                                        onClick={() => { window.location.href = `/api/registrations/${item.id}/download/`; }}
                                                    />
                                                </span>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                </Tooltip>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
}
