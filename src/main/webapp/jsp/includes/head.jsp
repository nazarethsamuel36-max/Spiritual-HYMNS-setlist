<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Manrope:wght@200;300;400;500;600;700;800&family=Noto+Sans+Mono:wght@400;500&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
<link rel="manifest" href="${pageContext.request.contextPath}/manifest.json">
<meta name="theme-color" content="#001264">
<script id="tailwind-config">
tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "surface-container-low": "#f3f4f5",
                "surface-container-high": "#e7e8e9",
                "error": "#ba1a1a",
                "on-primary-fixed-variant": "#293ca0",
                "on-secondary": "#ffffff",
                "on-tertiary": "#ffffff",
                "outline": "#76777c",
                "error-container": "#ffdad6",
                "on-surface-variant": "#45474c",
                "tertiary-fixed-dim": "#ffb2bf",
                "surface-variant": "#e1e3e4",
                "surface": "#f8f9fa",
                "inverse-primary": "#bac3ff",
                "on-background": "#191c1d",
                "tertiary-container": "#6d002b",
                "inverse-surface": "#2e3132",
                "on-error-container": "#93000a",
                "on-secondary-fixed-variant": "#3c475a",
                "secondary-fixed-dim": "#bcc7dd",
                "surface-container-lowest": "#ffffff",
                "on-tertiary-container": "#ff698f",
                "on-primary-container": "#8395fd",
                "outline-variant": "#c6c6cc",
                "secondary-container": "#d5e0f7",
                "inverse-on-surface": "#f0f1f2",
                "surface-bright": "#f8f9fa",
                "on-secondary-container": "#586377",
                "tertiary-fixed": "#ffd9de",
                "primary": "#001264",
                "on-tertiary-fixed": "#3f0016",
                "surface-dim": "#d9dadb",
                "secondary": "#545f72",
                "on-surface": "#191c1d",
                "tertiary": "#460019",
                "primary-fixed": "#dee0ff",
                "background": "#f8f9fa",
                "primary-container": "#0f268d",
                "on-secondary-fixed": "#111c2c",
                "surface-container-highest": "#e1e3e4",
                "surface-container": "#edeeef",
                "on-primary": "#ffffff",
                "on-error": "#ffffff",
                "secondary-fixed": "#d8e3fa",
                "surface-tint": "#4355b9",
                "on-primary-fixed": "#00105c",
                "primary-fixed-dim": "#bac3ff",
                "on-tertiary-fixed-variant": "#90003b"
            },
            fontFamily: {
                "headline": ["Manrope", "sans-serif"],
                "body": ["Inter", "sans-serif"],
                "label": ["Inter", "sans-serif"],
                "mono": ["Noto Sans Mono", "monospace"]
            },
            borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
        },
    },
}
</script>
<style>
.material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
.mesh-bg {
    background-color: #f8f9fa;
    background-image: 
        radial-gradient(at 0% 0%, hsla(230, 100%, 95%, 1) 0, transparent 50%), 
        radial-gradient(at 50% 0%, hsla(220, 100%, 98%, 1) 0, transparent 50%), 
        radial-gradient(at 100% 0%, hsla(240, 100%, 96%, 1) 0, transparent 50%);
}
</style>
<script>
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('${pageContext.request.contextPath}/sw.js')
            .then(reg => console.log('Service Worker registered', reg))
            .catch(err => console.log('Service Worker registration failed', err));
    });
}
</script>
