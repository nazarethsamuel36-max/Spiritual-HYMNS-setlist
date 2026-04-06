<%@ page contentType="text/html;charset=UTF-8" language="java" import="java.util.Locale, com.worship.util.HtmlEscaper" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fn" uri="jakarta.tags.functions" %>
<!DOCTYPE html>
<html class="light" lang="en">
<head>
    <title><c:out value="${song.title}"/> — Worship Song Library</title>
    <meta name="description" content="View chords and lyrics for <c:out value="${song.title}"/> by <c:out value="${song.artist}"/>">
    <jsp:include page="/jsp/includes/head.jsp"/>
</head>
<body class="bg-surface font-body text-on-surface flex flex-col min-h-screen">
    <jsp:include page="/jsp/navbar.jsp"/>
    <input type="hidden" id="songId" value="${song.id}">

    <!-- Floating Action Control Bar (Fixed Bottom) -->
    <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 no-print" style="width: 95%; max-width: 820px;" id="songControls">
        <div class="ctrl-bar">

            <!-- GROUP 1: View Mode -->
            <div class="ctrl-group">
                <button data-mode="chords" onclick="setViewMode('chords')" class="ctrl-btn active">Lyrics + Chords</button>
                <button data-mode="lyrics" onclick="setViewMode('lyrics')" class="ctrl-btn">Lyrics Only</button>
            </div>

            <div class="ctrl-divider"></div>

            <!-- GROUP 2: Transpose -->
            <div class="ctrl-group">
                <button onclick="transposeUI(-1)" class="ctrl-btn">−</button>
                <span id="semitoneDisplay" class="ctrl-val">0</span>
                <button onclick="transposeUI(1)" class="ctrl-btn">+</button>
            </div>

            <div class="ctrl-divider"></div>

            <!-- GROUP 3: Font Size -->
            <div class="ctrl-group">
                <button onclick="decreaseFontSize()" class="ctrl-btn">A−</button>
                <span id="fontSizeDisplay" class="ctrl-val">16px</span>
                <button onclick="increaseFontSize()" class="ctrl-btn">A+</button>
            </div>

            <div class="ctrl-divider"></div>

            <!-- GROUP 4: Columns -->
            <div class="ctrl-group">
                <button data-col="1" onclick="setColumnCount(1)" class="ctrl-btn active">1 Col</button>
                <button data-col="2" onclick="setColumnCount(2)" class="ctrl-btn">2 Col</button>
            </div>

            <div class="ctrl-divider"></div>

            <!-- GROUP 5: Autoscroll -->
            <div class="ctrl-group">
                <button id="scrollToggle" onclick="toggleAutoScroll()" class="ctrl-btn">▶ Scroll</button>
                <div id="scrollSpeedContainer" style="display:none;" class="flex items-center gap-1">
                    <input type="range" id="scrollSpeedSlider" min="1" max="10" value="3" step="1" class="ctrl-slider" oninput="updateScrollSpeed(this.value)">
                </div>
                <div id="wakeLockIndicator" class="ctrl-wake">
                    <div class="ctrl-wake-dot"></div>
                    Screen On
                </div>
            </div>

        </div>
    </div>

    <main class="flex-grow max-w-[1920px] mx-auto w-full px-6 py-12 md:px-12 flex flex-col md:flex-row gap-12 relative">
        
        <!-- Left Column: Settings / Attributes / Metadata -->
        <div class="w-full md:w-56 flex-shrink-0 space-y-6 sticky top-24 self-start no-print">
            <div>
                <h1 class="text-4xl font-headline font-black text-on-surface mb-2 tracking-tight"><c:out value="${song.title}"/></h1>
                <p class="text-xl font-medium text-primary tracking-wide uppercase"><c:out value="${song.artist}"/></p>
            </div>
            
            <div class="space-y-4 pt-4 border-t border-surface-dim">
                <div class="flex justify-between items-center">
                    <span class="text-sm font-semibold text-outline tracking-wider uppercase">Original Key</span>
                    <span class="px-3 py-1 bg-primary-fixed text-on-primary-fixed font-bold rounded-md" id="keyDisplay"><c:out value="${song.originalKey}"/></span>
                </div>
                <div class="flex justify-between items-center" id="capoHint" style="display: ${song.capo > 0 ? 'flex' : 'none'}">
                    <span class="text-sm font-semibold text-outline tracking-wider uppercase">Capo</span>
                    <span class="px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed font-bold rounded-md">Capo <c:out value="${song.capo}"/></span>
                </div>
                <c:if test="${song.bpm > 0}">
                <div class="flex justify-between items-center">
                    <span class="text-sm font-semibold text-outline tracking-wider uppercase">Tempo</span>
                    <span class="px-3 py-1 bg-secondary-fixed text-on-secondary-fixed font-bold rounded-md"><c:out value="${song.bpm}"/> BPM</span>
                </div>
                </c:if>
                <div class="flex justify-between items-center">
                    <span class="text-sm font-semibold text-outline tracking-wider uppercase">Language</span>
                    <span class="px-3 py-1 bg-surface-container-high text-on-surface font-bold rounded-md capitalize"><c:out value="${song.language}"/></span>
                </div>
            </div>

            <!-- Hashtag Pills -->
            <div class="pt-4 border-t border-surface-dim">
                <div class="flex flex-wrap gap-2">
                    <c:forEach var="tag" items="${song.hashtags}">
                        <a href="${pageContext.request.contextPath}/search?q=${tag}" class="px-3 py-1 bg-surface-container text-on-surface-variant hover:bg-outline-variant transition-colors rounded-full text-xs font-bold tracking-widest uppercase text-decoration-none" style="text-decoration: none;">#<c:out value="${tag}"/></a>
                    </c:forEach>
                </div>
            </div>

            <!-- Actions -->
            <div class="pt-4 space-y-3 border-t border-surface-dim">
                <button onclick="toggleInlineEditor()" class="w-full flex items-center justify-center gap-2 py-3 bg-white border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary-fixed transition-colors">
                    <span class="material-symbols-outlined text-sm">edit</span> Edit Chords
                </button>
                <button onclick="window.print()" class="w-full flex items-center justify-center gap-2 py-3 bg-surface-container text-on-surface font-bold rounded-xl hover:bg-surface-dim transition-colors">
                    <span class="material-symbols-outlined text-sm">print</span> Print
                </button>
                <button onclick="shareToWhatsApp('${fn:escapeXml(song.title)}', window.location.href); return false;" class="w-full flex items-center justify-center gap-2 py-3 bg-surface-container text-on-surface font-bold rounded-xl hover:bg-surface-dim transition-colors">
                    <span class="material-symbols-outlined text-sm">share</span> Share
                </button>
            </div>

            <!-- My Notes Panel -->
            <div class="pt-4 border-t border-surface-dim">
                <button onclick="document.getElementById('notesPanelContent').classList.toggle('hidden')" class="w-full flex items-center justify-between py-2 text-on-surface font-bold">
                    <span class="flex items-center gap-2"><span class="material-symbols-outlined text-sm">sticky_note_2</span> My Notes</span>
                    <span class="material-symbols-outlined text-sm">expand_more</span>
                </button>
                <div id="notesPanelContent" class="hidden mt-3 space-y-3">
                    <c:choose>
                        <c:when test="${not empty sessionScope.username}">
                            <textarea id="personalNote" class="w-full h-32 p-3 bg-surface-container disabled:bg-surface-dim text-sm rounded-xl border border-surface-dim focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-y" placeholder="Type your personal notes here..."><c:out value="${personalNote}"/></textarea>
                            <button onclick="savePersonalNote()" class="w-full py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-container transition-all">Save Note</button>
                        </c:when>
                        <c:otherwise>
                            <textarea disabled class="w-full h-32 p-3 bg-surface-container-high text-on-surface-variant text-sm rounded-xl border border-surface-dim cursor-not-allowed">Login to save your notes.</textarea>
                            <a href="${pageContext.request.contextPath}/login" class="block text-center w-full py-2 bg-surface-container text-on-surface text-sm font-bold rounded-xl hover:bg-surface-dim transition-all text-decoration-none" style="text-decoration: none;">Login</a>
                        </c:otherwise>
                    </c:choose>
                </div>
            </div>
        </div>

        <!-- Center Column: Song Lyrics & Chords -->
        <div class="flex-grow max-w-4xl bg-white shadow-sm border border-surface-dim/50 p-8 md:p-16 rounded-3xl relative">
            <c:if test="${isPersonalVersion}">
                <div class="absolute top-0 left-0 w-full bg-tertiary-fixed text-on-tertiary-fixed text-center py-2 text-sm font-bold tracking-wide rounded-t-3xl">
                    &#x1F4DD; Showing your personal version. <button onclick="resetToOriginal()" class="underline bg-transparent border-none p-0 cursor-pointer text-inherit">Reset</button>
                </div>
            </c:if>

            <div class="song-body font-mono text-lg text-on-surface tracking-tight" id="songBody">
<%
    // Bug #2 Fix: XSS Prevention in scriptlet rendering
    java.util.List<String[]> parsedLines = (java.util.List<String[]>) request.getAttribute("parsedLines");
    if (parsedLines != null) {
        java.util.regex.Pattern sectionPat = java.util.regex.Pattern.compile("^\\[([^\\]]+)\\]\\s*$");
        for (String[] line : parsedLines) {
            String chords = HtmlEscaper.escapeHtml(line[0]);
            String lyrics = HtmlEscaper.escapeHtml(line[1]);
            
            // Bug #6 Refined: Detect section labels
            if ((chords == null || chords.trim().isEmpty()) && lyrics != null) {
                java.util.regex.Matcher m = sectionPat.matcher(lyrics.trim());
                if (m.matches()) {
                    String label = m.group(1).toLowerCase(Locale.ROOT);
                    String cssClass = "section-other";
                    if (label.startsWith("verse"))     cssClass = "section-verse";
                    else if (label.startsWith("chorus")) cssClass = "section-chorus";
                    else if (label.startsWith("bridge")) cssClass = "section-bridge";
                    else if (label.startsWith("pre"))    cssClass = "section-prechorus";
                    else if (label.startsWith("intro"))  cssClass = "section-intro";
                    else if (label.startsWith("outro"))  cssClass = "section-outro";
%>
                    <div class="section-label <%=cssClass%> mt-6 mb-2 block w-max"><%=m.group(1)%></div>
<%
                    continue;
                }
            }
            
            if (chords != null && !chords.trim().isEmpty()) {
%>
<div class="chord-line text-primary font-bold"><%=chords%></div><div class="lyric-line"><%=lyrics != null ? lyrics : ""%></div>
<%          } else if (lyrics != null && !lyrics.trim().isEmpty()) { %>
<div class="lyric-line"><%=lyrics%></div>
<%          } else { %>
<div class="lyric-line blank"> </div>
<%          }
        }
    }
%>
            </div>

            <!-- Inline Editor -->
            <div id="inlineEditor" style="display: none;" class="mt-12 pt-8 border-t border-surface-dim no-print">
                <c:if test="${empty sessionScope.username}">
                    <div class="bg-secondary-fixed text-on-secondary-fixed p-4 rounded-xl mb-6 text-sm font-semibold">
                        &#x1F4DD; You are editing as a guest — <a href="${pageContext.request.contextPath}/register" class="underline text-primary">sign up</a> to save your edits permanently.
                    </div>
                </c:if>
                <label class="block font-headline font-bold text-lg mb-4 text-on-surface">Edit chords (bracket format):</label>

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

                <textarea id="editChords" class="w-full h-96 p-6 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl font-mono text-sm focus:ring-2 focus:ring-primary outline-none resize-y shadow-inner mb-6"><c:out value="${song.chords}"/></textarea>
                
                <div class="flex flex-wrap gap-4 pb-20">
                    <button class="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-md" onclick="savePersonalVersion()">Save Version</button>
                    <button class="px-6 py-3 bg-surface-container text-on-surface font-bold rounded-xl" onclick="resetToOriginal()">Reset</button>
                    <button class="px-6 py-3 bg-surface-container text-on-surface font-bold rounded-xl" onclick="toggleInlineEditor()">Cancel</button>
                </div>
            </div>
        </div>
    </main>

    <!-- Bug #40: Admin link in footer for easier navigation -->
    <jsp:include page="/jsp/includes/footer.jsp"/>

    <script>const contextPath = '${pageContext.request.contextPath}';</script>
    <script src="${pageContext.request.contextPath}/js/app.js"></script>
</body>
</html>
