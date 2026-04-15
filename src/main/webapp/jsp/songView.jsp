<%@ page contentType="text/html;charset=UTF-8" language="java" import="java.util.Locale, com.worship.util.HtmlEscaper" %>
<% long cacheBuster = System.currentTimeMillis(); %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fn" uri="jakarta.tags.functions" %>
<!DOCTYPE html>
<html class="light" lang="en">
<head>
    <title><c:out value="${song.title}"/> — Worship Song Library</title>
    <meta name="description" content="View chords and lyrics for <c:out value="${song.title}"/> by <c:out value="${song.artist}"/>">
    <jsp:include page="/jsp/includes/head.jsp"/>
    <style>
        /* Chord Palette UI */
        .chord-palette {
            background: var(--surface-solid-bg);
            padding: 1.5rem;
            border-radius: 1.5rem;
            border: 1px solid rgba(198, 198, 204, 0.82);
            margin-bottom: 2rem;
            box-shadow: var(--surface-solid-shadow);
        }
        .chord-palette-label {
            font-size: 0.75rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #001264; /* primary */
            margin-bottom: 1.25rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .chord-palette-label::after {
            content: "";
            flex-grow: 1;
            height: 1px;
            background: #c6c6cc;
        }
        .chord-types, .chord-roots {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        .chord-root-btn, .chord-type-btn {
            background: #ffffff;
            color: var(--text-mid);
            border: 1px solid rgba(198, 198, 204, 0.9);
            padding: 0.6rem 1rem;
            border-radius: 0.75rem;
            font-size: 0.85rem;
            font-weight: 700;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
        }
        .chord-type-btn:hover, .chord-root-btn:hover {
            background: #d9dadb; /* surface-dim */
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .chord-root-btn.selected {
            background: #001264;
            color: #ffffff;
            border-color: #001264;
        }

        /* Control Panel UI */
        .ctrl-bar {
            background: var(--surface-glass-bg);
            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);
            border: 1px solid rgba(255, 255, 255, 0.56);
            border-radius: 999px;
            padding: 0.35rem 0.6rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            box-shadow: 0 18px 40px rgba(28, 36, 76, 0.18);
            white-space: nowrap;
        }
        .ctrl-bar::-webkit-scrollbar { display: none; }
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
            color: var(--text-mid);
            font-weight: 700;
            font-size: 0.85rem;
            padding: 0.5rem 1rem;
            border-radius: 999px;
            cursor: pointer;
            transition: all 0.2s;
            white-space: nowrap;
        }
        .ctrl-btn:hover {
            background: rgba(255, 255, 255, 0.8);
            color: var(--text-strong);
        }
        .ctrl-btn.active {
            background: #dee0ff; /* primary-fixed */
            color: #00105c; /* on-primary-fixed */
        }
        .ctrl-val {
            font-weight: 800;
            font-size: 0.9rem;
            min-width: 2.5rem;
            text-align: center;
            color: #001264;
        }
        .ctrl-slider {
            width: 80px;
            accent-color: #001264;
        }
        .song-meta-panel {
            background: var(--surface-mist-bg);
            border: 1px solid var(--surface-mist-border);
            box-shadow: var(--surface-mist-shadow);
        }
        .song-sheet-solid {
            background: var(--surface-solid-bg);
            border: 1px solid rgba(198, 198, 204, 0.76);
            box-shadow: 0 18px 48px rgba(28, 36, 76, 0.08);
        }
        .field-solid {
            background: var(--surface-solid-bg);
            border: 1px solid rgba(198, 198, 204, 0.8);
            box-shadow: inset 0 1px 2px rgba(28, 36, 76, 0.04);
        }
        .ctrl-wake {
            display: flex;
            align-items: center;
            gap: 0.35rem;
            font-size: 0.75rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #001264;
            margin-left: 0.5rem;
            white-space: nowrap;
        }
        .ctrl-wake-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #22c55e;
            box-shadow: 0 0 8px #22c55e;
        }

        @media print {
            @page {
                margin: 10mm;
            }
            html, body {
                background: #ffffff !important;
            }
            body {
                min-height: auto !important;
            }
            .no-print,
            #songControls,
            #songMetaColumn,
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
            .section-label {
                margin-top: 0.6rem !important;
                margin-bottom: 0.2rem !important;
            }
            .song-pair {
                margin-bottom: 0 !important;
            }
        }
        /* --- POSITION-BASED CHORD RENDERING --- */
        .song-pair {
            position: relative;
            white-space: nowrap;
            overflow-x: auto;
            font-family: "Courier New", Consolas, monospace !important;
            margin-bottom: 0.5em;
            line-height: 1.25em;
        }

        .chord-layer {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            overflow: visible;
            pointer-events: none;
            z-index: 2;
        }

        .chord-stack {
            position: absolute;
            bottom: 0;
            display: flex;
            flex-direction: column-reverse;
            align-items: flex-start;
        }

        .chord-span {
            color: var(--primary);
            font-weight: bold;
            background: var(--surface-solid-bg); /* Opaque background to prevent lyric overlap */
            padding: 0 1px;
            white-space: nowrap;
        }

        .lyric-line {
            position: relative;
            z-index: 1;
            min-height: 1.25em;
        }

        .chord-only-line {
            display: flex;
            gap: 1ch;
            font-family: "Courier New", Consolas, monospace !important;
            margin-bottom: 1em;
            color: var(--primary);
            font-weight: bold;
        }
    </style>
</head>
<body class="mesh-bg font-body text-on-surface flex min-h-screen flex-col">
    <jsp:include page="/jsp/navbar.jsp"/>
    <input type="hidden" id="songId" value="${song.id}">

    <!-- Floating Action Control Bar (Fixed Bottom Offset) -->
    <div class="fixed bottom-6 left-1/2 -translate-x-1/2 lg:translate-x-[-50%] lg:ml-[112px] z-50 no-print flex justify-center pointer-events-none" id="songControls">
        <div class="ctrl-bar pointer-events-auto shadow-2xl">

            <!-- GROUP 1: Mode -->
            <div class="ctrl-group">
                <button data-mode="chords" onclick="setViewMode('chords')" class="ctrl-btn active">Chords</button>
                <button data-mode="lyrics" onclick="setViewMode('lyrics')" class="ctrl-btn">Lyrics</button>
            </div>

            <div class="ctrl-divider"></div>

            <!-- GROUP 2: Transpose -->
            <div class="ctrl-group">
                <button onclick="transposeUI(-1)" class="ctrl-btn px-1">−</button>
                <span id="semitoneDisplay" class="font-bold text-[10px] min-w-[12px] text-center">0</span>
                <button onclick="transposeUI(1)" class="ctrl-btn px-1">+</button>
            </div>

            <div class="ctrl-divider"></div>

            <!-- GROUP 3: FontSize -->
            <div class="ctrl-group">
                <button onclick="decreaseFontSize()" class="ctrl-btn px-1">A−</button>
                <span id="fontSizeDisplay" class="font-bold text-[10px] min-w-[14px] text-center">16</span>
                <button onclick="increaseFontSize()" class="ctrl-btn px-1">A+</button>
            </div>

            <div class="ctrl-divider"></div>

            <!-- GROUP 4: View -->
            <div class="ctrl-group">
                <button data-col="1" onclick="setColumnCount(1)" class="ctrl-btn active">1 Col</button>
                <button data-col="2" onclick="setColumnCount(2)" class="ctrl-btn">2 Col</button>
            </div>

            <div class="ctrl-divider"></div>

            <!-- GROUP 5: Scroll -->
            <div class="ctrl-group">
                <button id="scrollToggle" onclick="toggleAutoScroll()" class="ctrl-btn">▶ Scroll</button>
                <div id="scrollSpeedContainer" class="flex items-center gap-1.5 px-1">
                     <input type="range" id="scrollSpeedSlider" min="1" max="25" value="5" step="1" class="ctrl-slider w-10" oninput="updateScrollSpeed(this.value)">
                     <span id="scrollSpeedVal" class="text-[9px] font-black text-primary uppercase min-w-[18px]">S:5</span>
                </div>
            </div>

        </div>
    </div>

    <main class="relative z-10 mx-auto flex w-full max-w-[1920px] flex-grow flex-col gap-12 px-6 py-12 md:flex-row md:px-12" id="songViewMain">
        
        <!-- Left Column: Settings / Attributes / Metadata -->
        <div class="w-full md:w-56 flex-shrink-0 space-y-6 sticky top-24 self-start no-print" id="songMetaColumn">
            <div class="song-meta-panel rounded-[1.75rem] p-5">
                <h1 class="text-4xl font-headline font-black text-on-surface mb-2 tracking-tight"><c:out value="${song.title}"/></h1>
                <p class="text-xl font-medium text-primary tracking-wide uppercase"><c:out value="${song.artist}"/></p>
            </div>
            
            <div class="song-meta-panel space-y-4 rounded-[1.75rem] p-5">
                <div class="flex justify-between items-center">
                    <span class="text-sm font-semibold text-outline tracking-[0.18em] uppercase">Original Key</span>
                    <span class="ui-pill-solid px-3 py-1 font-bold rounded-md" id="keyDisplay"><c:out value="${song.originalKey}"/></span>
                </div>
                <div class="flex justify-between items-center" id="capoHint" style="display: ${song.capo > 0 ? 'flex' : 'none'}">
                    <span class="text-sm font-semibold text-outline tracking-[0.18em] uppercase">Capo</span>
                    <span class="ui-pill-solid px-3 py-1 font-bold rounded-md">Capo <span id="capoValue"><c:out value="${song.capo}"/></span></span>
                </div>
                <c:if test="${song.bpm > 0}">
                <div class="flex justify-between items-center">
                    <span class="text-sm font-semibold text-outline tracking-[0.18em] uppercase">Tempo</span>
                    <span class="ui-pill-solid px-3 py-1 font-bold rounded-md"><c:out value="${song.bpm}"/> BPM</span>
                </div>
                </c:if>
                <div class="flex justify-between items-center">
                    <span class="text-sm font-semibold text-outline tracking-[0.18em] uppercase">Language</span>
                    <span class="ui-pill-solid px-3 py-1 font-bold rounded-md capitalize"><c:out value="${song.language}"/></span>
                </div>
            </div>

            <!-- Hashtag Pills -->
            <div class="song-meta-panel rounded-[1.75rem] p-5">
                <div class="flex flex-wrap gap-2">
                    <c:forEach var="tag" items="${song.hashtags}">
                        <a href="${pageContext.request.contextPath}/search?q=${tag}" class="ui-pill-solid rounded-full px-3 py-1 text-xs font-bold tracking-widest uppercase text-decoration-none" style="text-decoration: none;">#<c:out value="${tag}"/></a>
                    </c:forEach>
                </div>
            </div>

            <!-- Actions -->
            <div class="song-meta-panel space-y-3 rounded-[1.75rem] p-5">
                <button onclick="toggleInlineEditor()" class="w-full flex items-center justify-center gap-2 py-3 bg-white border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary-fixed transition-colors">
                    <span class="material-symbols-outlined text-sm">edit</span> Edit Chords
                </button>
                <button onclick="window.print()" class="surface-solid w-full flex items-center justify-center gap-2 py-3 text-on-surface font-bold rounded-xl hover:bg-surface-container-low transition-colors">
                    <span class="material-symbols-outlined text-sm">print</span> Print
                </button>
                <button onclick="shareToWhatsApp('${fn:escapeXml(song.title)}', window.location.href); return false;" class="surface-solid w-full flex items-center justify-center gap-2 py-3 text-on-surface font-bold rounded-xl hover:bg-surface-container-low transition-colors">
                    <span class="material-symbols-outlined text-sm">share</span> Share
                </button>
            </div>

            <!-- My Notes Panel -->
            <div class="song-meta-panel rounded-[1.75rem] p-5">
                <button onclick="document.getElementById('notesPanelContent').classList.toggle('hidden')" class="w-full flex items-center justify-between py-2 text-on-surface font-bold">
                    <span class="flex items-center gap-2"><span class="material-symbols-outlined text-sm">sticky_note_2</span> My Notes</span>
                    <span class="material-symbols-outlined text-sm">expand_more</span>
                </button>
                <div id="notesPanelContent" class="hidden mt-3 space-y-3">
                    <c:choose>
                        <c:when test="${not empty sessionScope.username}">
                            <textarea id="personalNote" class="field-solid w-full h-32 resize-y rounded-xl p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary disabled:bg-surface-dim" placeholder="Type your personal notes here..."><c:out value="${personalNote}"/></textarea>
                            <button onclick="savePersonalNote()" class="w-full py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-container transition-all">Save Note</button>
                        </c:when>
                        <c:otherwise>
                            <textarea disabled class="field-solid w-full h-32 cursor-not-allowed rounded-xl p-3 text-sm text-on-surface-variant">Login to save your notes.</textarea>
                            <a href="${pageContext.request.contextPath}/login" class="surface-solid block w-full rounded-xl py-2 text-center text-sm font-bold text-on-surface transition-all hover:bg-surface-container-low text-decoration-none" style="text-decoration: none;">Login</a>
                        </c:otherwise>
                    </c:choose>
                </div>
            </div>
        </div>

        <!-- Center Column: Song Lyrics & Chords -->
        <div class="song-sheet-solid relative max-w-4xl flex-grow rounded-3xl p-8 md:p-16" id="songSheet">
            <c:if test="${isPersonalVersion}">
                <div class="absolute top-0 left-0 w-full bg-tertiary-fixed text-on-tertiary-fixed text-center py-2 text-sm font-bold tracking-wide rounded-t-3xl">
                    &#x1F4DD; Showing your personal version. <button onclick="resetToOriginal()" class="underline bg-transparent border-none p-0 cursor-pointer text-inherit">Reset</button>
                </div>
            </c:if>

            <div id="printSongHeader" style="display:none;">
                <h1 style="font-size: 20px; font-weight: 800; margin: 0 0 2px 0;"><c:out value="${song.title}"/></h1>
                <p style="font-size: 11px; font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: 0.08em;"><c:out value="${song.artist}"/></p>
            </div>

            <div class="song-body font-mono text-lg text-on-surface" style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;" id="songBody">
                <script>
                    window.initialStructuredLines = ${not empty structuredLinesJson ? structuredLinesJson : '[]'};
                </script>
            </div>

            <!-- Inline Editor -->
            <div id="inlineEditor" style="display: none;" class="mt-12 border-t border-surface-dim pt-8 no-print">
                <c:if test="${empty sessionScope.username}">
                    <div class="bg-secondary-fixed text-on-secondary-fixed p-4 rounded-xl mb-6 text-sm font-semibold">
                        &#x1F4DD; You are editing as a guest — <a href="${pageContext.request.contextPath}/register" class="underline text-primary">sign up</a> to save your edits permanently.
                    </div>
                </c:if>
                <label class="block font-headline font-bold text-lg mb-4 text-on-surface">Edit chords (bracket format):</label>

                <!-- Universal Section Palette -->
                <div class="chord-palette mb-4" id="sectionPalette" style="padding: 1.25rem 1.5rem;">
                    <div class="chord-palette-label mb-3">Section Headers — tap to insert</div>
                    <div class="flex flex-wrap gap-2">
                        <button type="button" class="section-label cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5" onmousedown="event.preventDefault();" onclick="insertSectionAtCursor('Verse')">Verse</button>
                        <button type="button" class="section-label cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5" onmousedown="event.preventDefault();" onclick="insertSectionAtCursor('Chorus')">Chorus</button>
                        <button type="button" class="section-label cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5" onmousedown="event.preventDefault();" onclick="insertSectionAtCursor('Bridge')">Bridge</button>
                        <button type="button" class="section-label cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5" onmousedown="event.preventDefault();" onclick="insertSectionAtCursor('Pre-Chorus')">Pre-Chorus</button>
                        <button type="button" class="section-label cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5" onmousedown="event.preventDefault();" onclick="insertSectionAtCursor('Intro')">Intro</button>
                        <button type="button" class="section-label cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5" onmousedown="event.preventDefault();" onclick="insertSectionAtCursor('Outro')">Outro</button>
                        <button type="button" class="section-label cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5" onmousedown="event.preventDefault();" onclick="insertSectionAtCursor('Refrain')">Refrain</button>
                        <button type="button" class="section-label cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5" onmousedown="event.preventDefault();" onclick="insertSectionAtCursor('Tag')">Tag</button>
                    </div>
                </div>

                <!-- Chord Palette -->
                <div class="chord-palette" id="chordPalette">
                    <div class="chord-palette-label">Chord Palette — tap to insert</div>
                    <div id="keyStripChords" class="chord-types mb-3"></div>
                    <div class="chord-roots mb-2" id="familyTabs">
                        <button type="button" class="chord-root-btn selected" onclick="selectChordFamily(0)">Major/Minor</button>
                        <button type="button" class="chord-root-btn" onclick="selectChordFamily(1)">7th/Maj7</button>
                        <button type="button" class="chord-root-btn" onclick="selectChordFamily(2)">Sus/Add</button>
                        <button type="button" class="chord-root-btn" onclick="selectChordFamily(3)">Slash/Ext</button>
                    </div>
                    <div class="chord-types" id="chordFamilyGrid"></div>
                </div>

                <textarea id="editChords" class="field-solid mb-6 h-96 w-full resize-y rounded-2xl p-6 font-mono text-sm outline-none focus:ring-2 focus:ring-primary"><c:out value="${song.chords}"/></textarea>
                
                <div class="flex flex-wrap gap-4 pb-20">
                    <button class="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-md" onclick="savePersonalVersion()">Save Version</button>
                    <button class="surface-solid px-6 py-3 text-on-surface font-bold rounded-xl" onclick="resetToOriginal()">Reset</button>
                    <button class="surface-solid px-6 py-3 text-on-surface font-bold rounded-xl" onclick="toggleInlineEditor()">Cancel</button>
                </div>
            </div>
        </div>
    </main>

    <!-- Bug #40: Admin link in footer for easier navigation -->
    <jsp:include page="/jsp/includes/footer.jsp"/>

    <script>const contextPath = '${pageContext.request.contextPath}';</script>
    <script src="${pageContext.request.contextPath}/js/app.js?v=<%= cacheBuster %>"></script>
</body>
</html>
