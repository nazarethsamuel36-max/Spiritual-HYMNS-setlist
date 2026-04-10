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
        .print-song-header {
            break-inside: avoid;
            page-break-inside: avoid;
        }
        .print-song-content {
            orphans: 3;
            widows: 3;
        }
        
        @media print {
            @page {
                size: A4;
                margin: 1.2cm;
            }
            body { 
                padding: 0 !important;
                background-color: white !important;
                color: black !important;
                font-size: 10pt !important;
                line-height: 1.4 !important;
            }
            .print-song {
                break-inside: auto;
                page-break-inside: auto;
                page-break-before: always;
                margin-bottom: 0 !important;
                padding-bottom: 0 !important;
                border-bottom: none !important;
            }
            .print-song:first-of-type { page-break-before: auto; }
            .print-song-content {
                break-inside: auto;
                page-break-inside: auto;
                margin-top: 0.75rem !important;
            }
            
            /* Ensure chords print clearly */
            .chord-line { 
                color: #000 !important; 
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                margin-bottom: -0.15rem !important;
            }
            .lyric-line {
                margin-bottom: 0.15rem !important;
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
            .print-shell {
                max-width: none !important;
                padding: 0 !important;
                margin: 0 !important;
                box-shadow: none !important;
                border: none !important;
            }
            .print-header {
                margin-bottom: 1.25rem !important;
                padding-bottom: 0.75rem !important;
            }
            .print-subtitle {
                font-size: 10pt !important;
                color: #444 !important;
            }
        }
    </style>
</head>
<body class="font-body text-on-surface bg-gray-50/50 min-h-screen p-4 md:p-8">

    <div class="print-shell max-w-[800px] mx-auto bg-white sm:shadow-lg sm:rounded-2xl sm:border border-surface-dim p-6 md:p-12 print:p-0 print:shadow-none print:border-none print:max-w-none print:m-0">
        
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
        <div class="print-header text-center mb-10 pb-6 border-b-4 border-primary print:border-b-2 print:border-black print-border-b">
            <h1 class="text-3xl font-headline font-extrabold tracking-tight text-primary print:text-black mb-1">${leaflet.title}</h1>
            <div class="text-lg font-medium text-on-surface-variant print:text-black">${leaflet.occasionName}</div>
            <div class="print-subtitle text-sm text-on-surface-variant mt-2">
                <c:choose>
                    <c:when test="${leaflet.printType == 'lyrics_only'}">Lyrics-only print</c:when>
                    <c:otherwise>Musician print with chords</c:otherwise>
                </c:choose>
            </div>
        </div>

        <%-- Render each item in the leaflet --%>
        <% 
           com.worship.model.Leaflet leafletData = (com.worship.model.Leaflet) request.getAttribute("leaflet");
           if (leafletData != null && leafletData.getSongs() != null) {
               int songCounter = 0;
               for (com.worship.model.LeafletSong ls : leafletData.getSongs()) {
                   if (ls.isHeader()) {
        %>
                    <div class="print-song-header my-12 py-4 border-y-2 border-primary/20 bg-primary/5 flex justify-center items-center">
                        <h2 class="text-2xl font-black text-primary uppercase tracking-[0.3em] font-headline text-center">
                            === <%= ls.getHeaderText() != null ? ls.getHeaderText() : ls.getSongTitle() %> ===
                        </h2>
                    </div>
        <% 
                   } else {
                       songCounter++; 
        %>
                    <div class="print-song mb-12">
                        <div class="print-song-header flex justify-between items-baseline mb-2 pb-2 border-b border-surface-dim print:border-gray-300 print-border-b">
                            <h3 class="text-xl font-headline font-bold text-on-surface print:text-black m-0"><%= songCounter %>. <%= ls.getSongTitle() %></h3>
                            <span class="print-badge bg-primary text-white text-xs font-bold px-3 py-1 rounded-full font-mono tracking-widest"><%= ls.getDisplayKey() %></span>
                        </div>
                        
                        <% if (ls.getSongArtist() != null && !ls.getSongArtist().trim().isEmpty()) { %>
                            <div class="text-sm font-medium text-on-surface-variant print:text-gray-600 mb-4"><%= ls.getSongArtist() %></div>
                        <% } %>

                        <div class="print-song-content font-mono text-[13px] md:text-sm leading-[1.8] mt-4">
                            <% 
                                String printType = leafletData.getPrintType();
                                if ("lyrics_only".equals(printType)) { 
                                    if (ls.getSongLyrics() != null) {
                                        for (String lyricLine : ls.getSongLyrics().split("\n")) {
                            %>
                                        <div class="lyric-line text-on-surface print:text-black whitespace-pre-wrap"><%= lyricLine %></div>
                            <%          } 
                                    }
                                } else if (ls.getSongChords() != null && !ls.getSongChords().trim().isEmpty()) {
                                    java.util.List<String[]> parsedLines = ChordParser.parseFullSong(ls.getSongChords());
                                    for (String[] line : parsedLines) {
                                        if (line[0] != null && !line[0].trim().isEmpty()) { 
                            %>
                                    <div class="chord-line text-primary font-bold print:font-bold -mb-1 whitespace-pre"><%= line[0] %></div>
                            <%          } %>
                                    <div class="lyric-line text-on-surface print:text-black mb-1 whitespace-pre-wrap"><%= line[1] %></div>
                            <%      }
                                } else { 
                                    // Fallback: plain lyrics if no chords
                                    if (ls.getSongLyrics() != null) {
                                        for (String lyricLine : ls.getSongLyrics().split("\n")) {
                            %>
                                        <div class="lyric-line text-on-surface print:text-black whitespace-pre-wrap"><%= lyricLine %></div>
                            <%          }
                                    }
                                } 
                            %>
                        </div>
                    </div>
        <% 
                   }
               }
           }
        %>

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
