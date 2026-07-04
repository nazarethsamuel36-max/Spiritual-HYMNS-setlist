<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<% long cacheBuster = System.currentTimeMillis(); %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html class="light" lang="en">
<head>
    <title><c:out value="${song.title}"/> - Worship Song Library</title>
    <meta name="description" content="View chords and lyrics for <c:out value="${song.title}"/>">
    <jsp:include page="/jsp/includes/head.jsp"/>
    <style>
        :root {
            --bottom-bar-height: 88px;
        }

        .song-page-content {
            padding-bottom: calc(var(--bottom-bar-height) + 24px) !important;
        }

        .song-performance-header {
            background: rgba(255, 255, 255, 0.18);
            border: 1px solid rgba(255, 255, 255, 0.42);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
        }

        .song-sheet-solid {
            background: rgba(255, 255, 255, 0.28);
            border: 1px solid rgba(255, 255, 255, 0.48);
            box-shadow: 0 18px 48px rgba(28, 36, 76, 0.08);
        }

        .ctrl-shell {
            position: fixed;
            left: 50%;
            bottom: 0.75rem;
            transform: translateX(-50%);
            z-index: 50;
            display: flex;
            justify-content: center;
            width: 100%;
            padding: 0 0.5rem;
            pointer-events: none;
        }

        .ctrl-bar {
            background: rgba(255, 255, 255, 0.32);
            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);
            border: 1px solid rgba(255, 255, 255, 0.56);
            border-radius: 1.25rem;
            padding: 0.35rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.25rem;
            max-height: 20vh;
            max-width: calc(100vw - 1rem);
            overflow-x: auto;
            overflow-y: hidden;
            box-shadow: 0 18px 40px rgba(28, 36, 76, 0.18);
            pointer-events: auto;
        }

        .ctrl-bar::-webkit-scrollbar {
            display: none;
        }

        .ctrl-group {
            display: flex;
            align-items: center;
            gap: 0.25rem;
        }

        .ctrl-divider {
            width: 1px;
            height: 24px;
            background: #c6c6cc;
            flex-shrink: 0;
        }

        .ctrl-btn {
            background: transparent;
            border: none;
            color: #21345f;
            font-weight: 800;
            font-size: 0.85rem;
            padding: 0.55rem 0.8rem;
            border-radius: 999px;
            cursor: pointer;
            transition: all 0.2s;
            white-space: nowrap;
        }

        .ctrl-btn:hover {
            background: rgba(255, 255, 255, 0.8);
            color: #1a1a2e;
        }

        .ctrl-btn.active {
            background: #dee0ff;
            color: #00105c;
        }

        .ctrl-btn.view-mode-btn {
            min-height: 40px;
        }

        .ctrl-slider {
            width: 72px;
            accent-color: #001264;
        }

        .song-pair {
            display: block;
            margin-bottom: 0.85rem;
        }

        .chord-line, .lyrics-line, .lyrics-only-line {
            font-family: monospace !important;
            white-space: pre !important;
            display: block;
            min-height: 1.2em;
        }

        .chord-line {
            color: #001264;
            font-weight: bold;
            margin-bottom: 0.35rem;
        }

        .song-stanza-gap {
            height: 1.8em;
        }

        .section-label {
            margin-top: 1.1rem;
            margin-bottom: 0.35rem;
        }

        @media (max-width: 640px) {
            .ctrl-bar {
                width: calc(100vw - 1rem);
                flex-wrap: wrap;
                border-radius: 1rem;
                white-space: normal;
            }

            .ctrl-btn {
                padding: 0.5rem 0.65rem;
                font-size: 0.78rem;
            }

            .ctrl-divider {
                height: 20px;
            }

            .ctrl-slider {
                width: 56px;
            }
        }

        @media (max-height: 520px) and (orientation: landscape) {
            .ctrl-bar {
                padding: 0.25rem;
                border-radius: 0.9rem;
            }

            .ctrl-btn {
                padding: 0.35rem 0.6rem;
                font-size: 0.75rem;
            }

            .ctrl-divider {
                height: 18px;
            }
        }

        @media print {
            @page {
                margin: 10mm;
            }

            html,
            body {
                background: #ffffff !important;
            }

            .no-print,
            #songControls,
            #mobile-menu,
            nav,
            footer {
                display: none !important;
            }

            #songViewMain {
                display: block !important;
                max-width: none !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                gap: 0 !important;
            }

            #songSheet {
                max-width: none !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                border: none !important;
                border-radius: 0 !important;
                box-shadow: none !important;
                background: #ffffff !important;
            }

            #printSongHeader {
                display: block !important;
                margin: 0 0 0.6rem 0 !important;
                padding-bottom: 0.35rem !important;
                border-bottom: 1px solid #cfcfcf !important;
            }

            #songBody {
                padding: 0 !important;
                margin: 0 !important;
                overflow: visible !important;
                font-size: 12px !important;
                line-height: 1.3 !important;
                column-count: 1 !important;
                column-gap: 0 !important;
            }
        }
    </style>
</head>
<body class="mesh-bg font-body text-on-surface flex min-h-screen flex-col">
    <jsp:include page="/jsp/navbar.jsp"/>
    <input type="hidden" id="songId" value="${song.id}">

    <div class="ctrl-shell no-print" id="songControls">
        <div class="ctrl-bar">
            <div class="ctrl-group" role="group" aria-label="Song view mode">
                <button data-view-mode="lyrics" onclick="setSongViewMode('lyrics')" class="ctrl-btn view-mode-btn active">Lyrics</button>
                <button data-view-mode="lyrics-chords" onclick="setSongViewMode('lyrics-chords')" class="ctrl-btn view-mode-btn">Lyrics + Chords</button>
            </div>

            <div class="ctrl-divider"></div>

            <div class="ctrl-group">
                <button onclick="decreaseFontSize()" class="ctrl-btn" aria-label="Decrease font size">A-</button>
                <span id="fontSizeDisplay" class="min-w-[28px] text-center text-[10px] font-black">16</span>
                <button onclick="increaseFontSize()" class="ctrl-btn" aria-label="Increase font size">A+</button>
            </div>

            <div class="ctrl-group">
                <button data-col="1" onclick="setColumnCount(1)" class="ctrl-btn active">1 Col</button>
                <button data-col="2" onclick="setColumnCount(2)" class="ctrl-btn">2 Col</button>
            </div>

            <div class="ctrl-divider"></div>

            <div class="ctrl-group">
                <button id="scrollToggle" onclick="toggleAutoScroll()" class="ctrl-btn">Scroll</button>
                <div id="scrollSpeedContainer" class="flex items-center gap-1.5 px-1">
                    <input type="range" id="scrollSpeedSlider" min="1" max="25" value="5" step="1" class="ctrl-slider" oninput="updateScrollSpeed(this.value)">
                    <span id="scrollSpeedVal" class="min-w-[18px] text-[9px] font-black uppercase text-primary">S:5</span>
                </div>
            </div>
        </div>
    </div>

    <main class="song-performance-main main-content song-page-content relative z-10 mx-auto flex w-full max-w-5xl flex-grow flex-col gap-4 px-4 py-4 md:px-6 md:py-6" id="songViewMain">
        <header class="song-performance-header rounded-2xl px-4 py-3 md:px-6 md:py-4">
            <div class="flex flex-wrap items-center gap-3">
                <span class="text-[11px] font-black uppercase tracking-[0.16em] text-outline">#<c:out value="${song.songNumber}"/></span>
                <span class="ui-pill-solid rounded-md px-3 py-1 text-xs font-bold uppercase tracking-widest" id="keyDisplay"><c:out value="${song.originalKey}"/></span>
            </div>
            <h1 class="mt-2 font-headline text-3xl font-black leading-tight tracking-tight text-on-surface md:text-5xl"><c:out value="${song.title}"/></h1>
        </header>

        <div class="song-sheet-solid song-card relative flex-grow rounded-2xl p-4 md:p-8" id="songSheet">
            <div id="printSongHeader" style="display:none;">
                <p style="font-size:9px;font-weight:800;margin:0 0 2px 0;text-transform:uppercase;letter-spacing:0.12em;color:#6b7280">#<c:out value="${song.songNumber}"/></p>
                <h1 style="font-size:20px;font-weight:800;margin:0 0 2px 0;"><c:out value="${song.title}"/></h1>
            </div>

            <div class="transpose-controls no-print" style="margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(0, 0, 0, 0.05);">
                <span class="text-[11px] font-black uppercase tracking-widest text-on-surface-variant mr-3" style="opacity: 0.7;">Transpose</span>
                <button onclick="transposeUI(-1)" aria-label="Transpose down">-</button>
                <span id="semitoneDisplay" class="font-black text-lg min-w-[36px] text-center" style="color: var(--color-brand);">+0</span>
                <button onclick="transposeUI(1)" aria-label="Transpose up">+</button>
                <button onclick="resetTranspose()" style="width:auto; min-width:auto; border:none; border-radius:0; height:auto; min-height:auto; font-size:0.75rem; font-weight: 800; margin-left:1rem; opacity:0.5; text-transform:uppercase; letter-spacing:0.05em;" aria-label="Reset transpose" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.5'">RESET</button>
            </div>

            <div class="song-body lyrics-container font-mono text-lg text-on-surface" style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;" id="songBody">
                <script>
                    window.initialStructuredLines = ${not empty structuredLinesJson ? structuredLinesJson : '[]'};
                </script>
            </div>
        </div>
    </main>


    <script>const contextPath = '${pageContext.request.contextPath}';</script>
    <script src="${pageContext.request.contextPath}/js/chord_splitting.js?v=<%= cacheBuster %>"></script>
    <script src="${pageContext.request.contextPath}/js/app.js?v=<%= cacheBuster %>"></script>
</body>
</html>
