<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fn" uri="jakarta.tags.functions" %>
<%@ page import="com.worship.util.ChordParser, java.util.List" %>
<!DOCTYPE html>
<html class="light bg-white" lang="en">
<head>
    <title>${leaflet.title} — Print</title>
    <jsp:include page="/jsp/includes/head.jsp"/>
    <style>
        /* Essential print and specific layout overrides that Tailwind doesn't handle natively as well for complex print jobs */
        body { background-color: white !important; }
        
        @media print {
            @page {
                margin: 1.5cm;
                size: auto;
            }
            body { 
                padding: 0 !important;
                background-color: white !important;
                color: black !important;
                font-size: 11pt !important;
            }
            .print-song { 
                page-break-inside: avoid;
                margin-bottom: 2rem !important;
            }
            .print-song-content {
                page-break-inside: auto;
            }
            /* Start a new page for every song except the first */
            .print-song { page-break-before: always; }
            .print-song:first-of-type { page-break-before: auto; }
            
            /* Ensure chords print clearly */
            .chord-line { 
                color: #000 !important; 
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            
            /* Hide elements meant only for screen */
            .no-print, .material-symbols-outlined { display: none !important; }
            
            /* Adjust borders for print */
            .print-border-b { border-bottom: 1px solid #000 !important; }
            
            /* Simplify song key badge for print */
            .print-badge {
                background: transparent !important;
                color: black !important;
                border: 1px solid black !important;
                padding: 0 4px !important;
            }
        }
    </style>
</head>
<body class="font-body text-on-surface bg-gray-50/50 min-h-screen p-4 md:p-8">

    <div class="max-w-[800px] mx-auto bg-white sm:shadow-lg sm:rounded-2xl sm:border border-surface-dim p-6 md:p-12 print:p-0 print:shadow-none print:border-none print:max-w-none print:m-0">
        
        <!-- Controls (Hidden on Print) -->
        <div class="no-print flex flex-wrap gap-3 mb-10 pb-6 border-b border-surface-dim items-center justify-between">
            <a href="javascript:history.back()" class="flex items-center gap-2 px-4 py-2 bg-surface-container-low text-on-surface hover:bg-surface-dim transition-colors rounded-xl font-bold text-sm text-decoration-none" style="text-decoration: none;">
                <span class="material-symbols-outlined text-[18px]">arrow_back</span> Back
            </a>
            <div class="flex gap-3">
                <button onclick="shareToWhatsApp('${fn:escapeXml(leaflet.title)}', window.location.href)" class="flex items-center gap-2 px-4 py-2 bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 transition-colors rounded-xl font-bold text-sm border border-[#25D366]/30">
                    <span class="material-symbols-outlined text-[18px]">share</span> Share
                </button>
                <button onclick="window.print()" class="flex items-center gap-2 px-6 py-2 bg-primary text-white hover:bg-primary-container transition-colors rounded-xl font-bold text-sm shadow-sm">
                    <span class="material-symbols-outlined text-[18px]">print</span> Print
                </button>
            </div>
        </div>

        <!-- Leaflet Header -->
        <div class="text-center mb-10 pb-6 border-b-4 border-primary print:border-b-2 print:border-black print-border-b">
            <h1 class="text-3xl font-headline font-extrabold tracking-tight text-primary print:text-black mb-1">${leaflet.title}</h1>
            <div class="text-lg font-medium text-on-surface-variant print:text-black">${leaflet.occasionName}</div>
        </div>

        <%-- Render each song in the leaflet --%>
        <c:forEach var="ls" items="${leaflet.songs}" varStatus="loop">
            <div class="print-song mb-12">
                <div class="flex justify-between items-baseline mb-2 pb-2 border-b border-surface-dim print:border-gray-300 print-border-b">
                    <h3 class="text-xl font-headline font-bold text-on-surface print:text-black m-0">${loop.index + 1}. ${ls.songTitle}</h3>
                    <span class="print-badge bg-primary text-white text-xs font-bold px-3 py-1 rounded-full font-mono tracking-widest">${ls.displayKey}</span>
                </div>
                
                <c:if test="${not empty ls.songArtist}">
                    <div class="text-sm font-medium text-on-surface-variant print:text-gray-600 mb-4">${ls.songArtist}</div>
                </c:if>

                <%-- Parse chord/lyric lines and render them --%>
                <div class="print-song-content font-mono text-[13px] md:text-sm leading-[1.8] whitespace-pre-wrap mt-4">
                    <c:choose>
                        <c:when test="${not empty ls.songChords}">
                            <%
                                com.worship.model.LeafletSong currentSong =
                                    (com.worship.model.LeafletSong) pageContext.getAttribute("ls");
                                if (currentSong != null && currentSong.getSongChords() != null) {
                                    java.util.List<String[]> parsedLines =
                                        ChordParser.parseFullSong(currentSong.getSongChords());
                                    for (String[] line : parsedLines) {
                                        if (line[0] != null && !line[0].trim().isEmpty()) {
                            %>
                            <div class="chord-line text-primary font-bold print:font-bold -mb-1"><%=line[0]%></div>
                            <%          }  %>
                            <div class="lyric-line text-on-surface print:text-black mb-1"><%=line[1]%></div>
                            <%      }
                                }
                            %>
                        </c:when>
                        <c:otherwise>
                            <%-- Fallback: plain lyrics if no chords --%>
                            <c:forEach var="lyricLine" items="${fn:split(ls.songLyrics, '\n')}">
                                <div class="lyric-line text-on-surface print:text-black">${lyricLine}</div>
                            </c:forEach>
                        </c:otherwise>
                    </c:choose>
                </div>
            </div>
        </c:forEach>

        <c:if test="${empty leaflet.songs}">
            <div class="text-center py-16 text-on-surface-variant font-medium bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant/30 print:hidden">
                <span class="material-symbols-outlined text-4xl mb-4 text-outline block">music_off</span>
                <p>No songs found in this leaflet.</p>
                <a href="${pageContext.request.contextPath}/leaflet" class="inline-block mt-4 text-primary font-bold hover:underline">Go back to builder</a>
            </div>
        </c:if>

    </div>

    <script>
        function shareToWhatsApp(title, url) {
            const text = 'Song leaflet: ' + title + ' — ' + url;
            window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
        }
    </script>
</body>
</html>
