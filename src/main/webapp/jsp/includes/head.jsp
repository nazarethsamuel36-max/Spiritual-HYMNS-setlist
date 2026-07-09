<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<link href="${pageContext.request.contextPath}/css/tailwind-output.css" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Manrope:wght@200;300;400;500;600;700;800&family=Noto+Sans+Mono:wght@400;500&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="${pageContext.request.contextPath}/css/live-search.css">
<script src="${pageContext.request.contextPath}/js/live-search.js" defer></script>
<link rel="manifest" href="${pageContext.request.contextPath}/manifest.json">
<meta name="theme-color" content="#001264">
<script>window.CONTEXT_PATH = '${pageContext.request.contextPath}';</script>

<style>
/* ============================================================
   CHANGE 1: Full-page animated backdrop — TWO pastel colors
   ============================================================ */
html, body {
    margin: 0;
    padding: 0;
    font-size: 16px;
    min-height: 100vh;
    color: #1a1a2e;
}

body {
    background: linear-gradient(135deg, #c9d6f0 0%, #f0c9d6 100%);
    background-attachment: fixed;
    animation: bgCycle 12s ease infinite;
}

@keyframes bgCycle {
    0%   { background: linear-gradient(135deg, #c9d6f0 0%, #f0c9d6 100%); background-attachment: fixed; }
    25%  { background: linear-gradient(135deg, #d6f0c9 0%, #c9d6f0 100%); background-attachment: fixed; }
    50%  { background: linear-gradient(135deg, #f0e4c9 0%, #d6c9f0 100%); background-attachment: fixed; }
    75%  { background: linear-gradient(135deg, #c9f0ee 0%, #f0c9e4 100%); background-attachment: fixed; }
    100% { background: linear-gradient(135deg, #c9d6f0 0%, #f0c9d6 100%); background-attachment: fixed; }
}

.material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

/* ============================================================
   CHANGE 2: Navbar glass — applied via head.jsp as fallback
   (primary styling is inline in navbar.jsp)
   ============================================================ */
nav {
    position: sticky;
    top: 0;
    z-index: 9999 !important;
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    background: rgba(255, 255, 255, 0.18);
    border-bottom: 0.5px solid rgba(255, 255, 255, 0.35);
}

/* Mobile Menu Glassmorphism - STURDIER VERSION */
#mobile-menu {
    background: rgba(255, 255, 255, 0.98) !important;
    backdrop-filter: blur(24px) saturate(180%) !important;
    -webkit-backdrop-filter: blur(24px) saturate(180%) !important;
    border: 1px solid rgba(0, 0, 0, 0.12) !important;
    border-radius: 24px !important;
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4) !important;
    margin: 12px;
    width: calc(100% - 24px) !important;
    left: 0 !important;
    top: 64px !important;
    z-index: 10000 !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    max-height: 85vh;
    overflow-y: auto;
    padding: 12px 0 !important;
}

.mobile-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    backdrop-filter: blur(12px);
    background: rgba(0, 0, 0, 0.5);
    z-index: 9998 !important;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
}

.mobile-overlay.visible {
    opacity: 1;
    visibility: visible;
}

.mobile-nav-item {
    display: flex !important;
    align-items: center;
    gap: 16px;
    padding: 18px 24px !important;
    margin: 6px 14px;
    border-radius: 16px;
    color: #173164 !important;
    font-weight: 800 !important;
    text-decoration: none !important;
    transition: all 0.2s ease;
    background: rgba(0, 0, 0, 0.04);
    border: 1px solid rgba(0, 0, 0, 0.06);
    font-family: 'Manrope', sans-serif;
    font-size: 15px;
}

.mobile-nav-item:hover {
    background: rgba(0, 0, 0, 0.08);
    transform: translateX(6px);
}

.mobile-nav-item .material-symbols-outlined {
    font-size: 24px;
    opacity: 0.8;
}

.mobile-nav-item.text-error {
    color: #b91c1c !important;
    background: rgba(239, 68, 68, 0.06);
    border-color: rgba(239, 68, 68, 0.1);
}

/* ============================================================
   CHANGE 6: Main content area must be transparent
   ============================================================ */
main,
.app-bg-hero,
.app-bg-browse,
.app-bg-focus,
.mesh-bg {
    background: transparent !important;
    background-color: transparent !important;
}

/* ============================================================
   Surface utilities — tuned for pastel glass aesthetic
   ============================================================ */
.surface-glass {
    background: rgba(255, 255, 255, 0.25) !important;
    border: 0.5px solid rgba(255, 255, 255, 0.5) !important;
    box-shadow: none !important;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    position: relative;
    overflow: hidden;
}

.surface-mist {
    background: rgba(255, 255, 255, 0.14) !important;
    border: 0.5px solid rgba(255, 255, 255, 0.35) !important;
    box-shadow: none !important;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    position: relative;
    overflow: hidden;
}

.surface-solid {
    background: rgba(255, 255, 255, 0.2) !important;
    border: 0.5px solid rgba(255, 255, 255, 0.4) !important;
    box-shadow: none !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
}

/* Shimmer highlight for glass and mist surfaces */
.surface-glass::before,
.surface-mist::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    border-radius: inherit;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.06) 50%, rgba(255, 255, 255, 0.10) 100%);
    opacity: 0.8;
}

.surface-glass > *,
.surface-mist > * {
    position: relative;
    z-index: 1;
}

/* ============================================================
   CHANGE 3: Song card glass — defined globally for all pages
   ============================================================ */
.song-card {
    background: rgba(255, 255, 255, 0.25) !important;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 0.5px solid rgba(255, 255, 255, 0.5) !important;
    border-radius: 14px !important;
    position: relative;
    overflow: hidden;
    box-shadow: none !important;
    transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.song-card:hover {
    background: rgba(255, 255, 255, 0.38) !important;
    transform: translateY(-3px);
    border-color: rgba(255, 255, 255, 0.7) !important;
}

/* SHARP HIGHLIGHT — top edge */
.song-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.95), transparent);
    pointer-events: none;
    z-index: 2;
}

/* SHARP HIGHLIGHT — left edge */
.song-card::after {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 1px;
    height: 55%;
    background: linear-gradient(180deg, rgba(255,255,255,0.9), transparent);
    pointer-events: none;
    z-index: 2;
}

.song-card > * {
    position: relative;
    z-index: 1;
}

/* ============================================================
   CHANGE 4: Text readability on pastel background
   ============================================================ */
.song-card h2,
.song-card .song-title {
    color: #1a1a2e !important;
    font-weight: 600;
}

.song-card .text-primary\/80,
.song-card p[class*="uppercase"] {
    color: #4a5080 !important;
    font-weight: 600;
    font-size: 11px;
    letter-spacing: 0.05em;
}

/* ============================================================
   Badge styling for KEY/BPM/Language pills
   ============================================================ */
.ui-pill-solid {
    background: rgba(255, 255, 255, 0.35) !important;
    border: 0.5px solid rgba(26, 26, 46, 0.2) !important;
    color: #1a1a2e !important;
    box-shadow: none !important;
}

.ui-pill-solid:hover {
    background: rgba(255, 255, 255, 0.5) !important;
    border-color: rgba(26, 26, 46, 0.3) !important;
    color: #1a1a2e !important;
}

.ui-pill-muted {
    background: rgba(255, 255, 255, 0.3) !important;
    border: 0.5px solid rgba(26, 26, 46, 0.15) !important;
    color: #1a1a2e !important;
    box-shadow: none !important;
}

.ui-pill-muted:hover {
    background: rgba(255, 255, 255, 0.45) !important;
    border-color: rgba(26, 26, 46, 0.25) !important;
    color: #1a1a2e !important;
}

.ui-menu-solid {
    background: rgba(255, 255, 255, 0.6);
    border: 0.5px solid rgba(255, 255, 255, 0.5);
    box-shadow: 0 16px 32px rgba(28, 36, 76, 0.1);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
}

.ui-input-solid {
    background: rgba(255, 255, 255, 0.3);
    border: 0.5px solid rgba(26, 26, 46, 0.15);
    box-shadow: none;
    color: #1a1a2e;
}

.ui-input-solid::placeholder {
    color: rgba(74, 80, 128, 0.6);
}

.ui-input-mist {
    background: rgba(255, 255, 255, 0.3);
    border: 0.5px solid rgba(255, 255, 255, 0.4);
    box-shadow: none;
    color: #1a1a2e;
}

.ui-input-mist::placeholder {
    color: rgba(74, 80, 128, 0.55);
}

/* ============================================================
   Glass card utility (hero section, etc.)
   ============================================================ */
.glass-card {
    background: rgba(255, 255, 255, 0.30) !important;
    border: 0.5px solid rgba(255, 255, 255, 0.5) !important;
    box-shadow: none !important;
    backdrop-filter: blur(10px) !important;
    -webkit-backdrop-filter: blur(10px) !important;
}
.glass-card:hover {
    background: rgba(255, 255, 255, 0.40) !important;
    transform: translateY(-2px);
}

.glass-card::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    border-radius: inherit;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.05) 55%, rgba(255, 255, 255, 0.1) 100%);
    opacity: 0.8;
}

.glass-card > * {
    position: relative;
    z-index: 1;
}

/* ===== Song Sections ===== */
.section-label {
    background-color: rgba(255, 255, 255, 0.35) !important;
    color: #1a1a2e !important;
    padding: 0.35rem 0.85rem;
    border-radius: 9999px;
    font-size: 0.8125rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-family: inherit;
    border: 0.5px solid rgba(26, 26, 46, 0.2);
    display: inline-block;
}

/* ============================================================
   Dark mode overrides (preserved from original)
   ============================================================ */
html.dark body {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    background-attachment: fixed;
    animation: none;
    color: #f8fbff;
}

html.dark .surface-mist,
html.dark .surface-solid,
html.dark .glass-card,
html.dark .song-card {
    backdrop-filter: blur(20px) !important;
    -webkit-backdrop-filter: blur(20px) !important;
}

html.dark body,
html.dark .text-on-surface,
html.dark .text-on-background,
html.dark .text-on-surface-variant,
html.dark .text-outline,
html.dark .text-outline-variant,
html.dark .text-primary,
html.dark .text-on-primary-fixed,
html.dark .text-on-secondary-fixed,
html.dark .text-on-tertiary-fixed,
html.dark .text-\[\#001264\] {
    color: #f8fbff !important;
}

html.dark .text-error {
    color: #ffd0d0 !important;
}

html.dark [class*="bg-white"],
html.dark [class*="bg-surface-container"],
html.dark [class*="bg-surface-dim"],
html.dark [class*="bg-primary-fixed"],
html.dark [class*="bg-secondary-fixed"],
html.dark [class*="bg-tertiary-fixed"] {
    background-color: rgba(12, 28, 54, 0.62) !important;
    color: #f8fbff !important;
    border-color: rgba(255, 255, 255, 0.16) !important;
    backdrop-filter: blur(18px) !important;
    -webkit-backdrop-filter: blur(18px) !important;
}

html.dark [class*="border-surface-dim"],
html.dark [class*="border-outline-variant"],
html.dark [class*="border-white"] {
    border-color: rgba(124, 154, 219, 0.20) !important;
}

html.dark .hover\:bg-white:hover,
html.dark .hover\:bg-surface-container-low:hover,
html.dark .hover\:bg-surface-container-high:hover,
html.dark .hover\:bg-surface-dim:hover,
html.dark .hover\:bg-primary-fixed:hover {
    background-color: rgba(17, 40, 74, 0.74) !important;
    color: #f8fbff !important;
}

html.dark .hover\:text-primary:hover,
html.dark .hover\:text-primary-container:hover {
    color: #ffffff !important;
}

html.dark .bg-primary,
html.dark .hover\:bg-primary:hover,
html.dark .hover\:bg-primary-container:hover {
    background-color: rgba(16, 36, 69, 0.82) !important;
    color: #ffffff !important;
    backdrop-filter: blur(18px) !important;
    -webkit-backdrop-filter: blur(18px) !important;
}

html.dark .ring-black\/5,
html.dark .shadow-sm,
html.dark .shadow-lg,
html.dark .shadow-xl,
html.dark .shadow-2xl {
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.28) !important;
}

html.dark .ui-pill-solid,
html.dark .ui-pill-muted {
    background: rgba(15, 34, 65, 0.62) !important;
    border-color: rgba(255, 255, 255, 0.16) !important;
    color: #f8fbff !important;
    box-shadow: 0 10px 20px rgba(16, 39, 70, 0.10) !important;
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
}

html.dark .ui-pill-solid:hover,
html.dark .ui-pill-muted:hover {
    background: rgba(17, 40, 74, 0.72) !important;
    border-color: rgba(255, 255, 255, 0.22) !important;
    color: #f8fbff !important;
}

html.dark .ui-menu-solid {
    background: rgba(13, 30, 58, 0.76);
    border-color: rgba(255, 255, 255, 0.18);
    box-shadow: 0 20px 38px rgba(16, 39, 70, 0.20);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
}

html.dark .ui-input-solid,
html.dark .ui-input-mist {
    background: rgba(12, 28, 54, 0.60);
    border-color: rgba(255, 255, 255, 0.16);
    color: #f8fbff;
    box-shadow: 0 10px 20px rgba(16, 39, 70, 0.12);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
}

html.dark .ui-input-solid::placeholder,
html.dark .ui-input-mist::placeholder {
    color: rgba(214, 226, 245, 0.60);
}

html.dark .section-label {
    background-color: rgba(17, 40, 74, 0.76) !important;
    color: #ffffff !important;
    border-color: rgba(255, 255, 255, 0.18);
}

/* ============================================================
   Multi-column Break Fixes & List View
   ============================================================ */
.song-pair {
    break-inside: avoid;
    page-break-inside: avoid;
    display: block;
}
.song-stanza {
    break-inside: avoid;
    page-break-inside: avoid;
    display: block;
    margin-bottom: 1.5rem;
}

.song-list-view .song-grid {
    grid-template-columns: 1fr !important;
}
.song-list-view .song-card {
    padding: 1rem 1.5rem !important;
    flex-direction: row !important;
    align-items: center !important;
    gap: 1.5rem !important;
}
.song-list-view .song-card .song-card-meta {
    padding-top: 0 !important;
    border: none !important;
    margin-left: auto !important;
}
</style>
<script>
const isLocalHost =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        if (isLocalHost) {
            try {
                const registrations = await navigator.serviceWorker.getRegistrations();
                await Promise.all(registrations.map(reg => reg.unregister()));
                const cacheNames = await caches.keys();
                await Promise.all(cacheNames.map(name => caches.delete(name)));
                console.log('Service workers and caches cleared for local development');
            } catch (err) {
                console.log('Local cache cleanup failed', err);
            }
            return;
        }

        // Register SW — URL must NOT have cache-buster params (SW scope depends on it)
        navigator.serviceWorker.register('${pageContext.request.contextPath}/sw.js')
            .then(reg => console.log('Service Worker v5 registered', reg))
            .catch(err => console.log('Service Worker registration failed', err));
    });
}
</script>
<!-- offline-db: syncs all songs to IndexedDB when online (3s delay, 12h cache) -->
<script src="${pageContext.request.contextPath}/js/offline-db.js" defer></script>
