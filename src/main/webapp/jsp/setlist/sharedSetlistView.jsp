<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fmt" uri="jakarta.tags.fmt" %>

<!DOCTYPE html>
<html lang="en" class="light">
<head>
    <jsp:include page="/jsp/includes/head.jsp" />
    <title>${setlist.title} - Worship Song Library</title>
    <!-- We inject custom CSS for print media formatting to split elements cleanly -->
    <style>
        @media print {
            .no-print { display: none !important; }
            .print-break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
            body { background: white !important; color: black !important; padding: 0 !important; margin: 0 !important; }
            .print-border-none { border: none !important; box-shadow: none !important; }
        }
    </style>
</head>
<body class="bg-surface text-on-surface font-manrope min-h-screen flex flex-col">

<div class="no-print">
    <jsp:include page="/jsp/navbar.jsp" />
</div>

<div class="flex-grow max-w-[1000px] mx-auto w-full px-4 py-8 md:py-12 print-border-none">
    <!-- Header -->
    <div class="text-center mb-12">
        <div class="inline-flex items-center gap-3 mb-4">
            <span class="bg-primary-container text-on-primary-container text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">${setlist.occasion}</span>
            <span class="text-slate-500 text-sm"><fmt:formatDate value="${setlist.createdAt}" pattern="MMMM d, yyyy" /></span>
        </div>
        <h1 class="text-5xl md:text-6xl font-black tracking-tight text-on-surface uppercase font-headline mb-6">${setlist.title}</h1>
        
        <div class="no-print mt-4">
            <button onclick="window.print()" class="inline-flex items-center gap-2 bg-gradient-to-br from-primary to-primary-container text-white px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all">
                <span class="material-symbols-outlined text-sm">print</span> Print Setlist
            </button>
        </div>
    </div>

    <!-- Songs -->
    <div class="space-y-16">
        <c:choose>
            <c:when test="${empty setlist.songs}">
                <div class="text-center text-on-surface-variant p-12 bg-surface-container border border-surface-dim rounded-3xl">
                    This setlist is currently empty.
                </div>
            </c:when>
            <c:otherwise>
                <c:forEach var="song" items="${setlist.songs}">
                    <div class="print-break-inside-avoid song-container" data-song-id="${song.songId}" data-creator-offset="${song.position}">
                        <div class="border-b-2 border-surface-dim pb-4 mb-6 flex justify-between items-end">
                            <div>
                                <h2 class="text-3xl font-black text-on-surface font-headline uppercase leading-tight mb-1">${song.songTitle}</h2>
                                <h3 class="text-lg text-on-surface-variant font-medium">${song.songArtist}</h3>
                            </div>
                            
                            <!-- Viewer UI details & Transpose controls -->
                            <div class="text-right">
                                <div class="text-xl font-bold text-primary mb-2" id="key-capo-display-${song.songId}">
                                    Key: <span id="current-key-${song.songId}">${song.creatorKey}</span>
                                    <c:if test="${song.creatorCapo > 0}">
                                        <span class="text-sm font-medium text-slate-500 ml-2">(Capo ${song.creatorCapo})</span>
                                    </c:if>
                                </div>
                                <div class="no-print inline-flex bg-surface-container-low rounded-lg p-1 border border-surface-dim">
                                    <button onclick="transposeSong(${song.songId}, -1)" class="w-8 h-8 flex items-center justify-center rounded text-on-surface hover:bg-surface-dim transition-colors" title="Transpose Down">
                                        <span class="material-symbols-outlined text-sm">remove</span>
                                    </button>
                                    <button onclick="transposeSong(${song.songId}, 1)" class="w-8 h-8 flex items-center justify-center rounded text-on-surface hover:bg-surface-dim transition-colors" title="Transpose Up">
                                        <span class="material-symbols-outlined text-sm">add</span>
                                    </button>
                                    <button onclick="resetSong(${song.songId}, '${song.creatorKey}', ${song.creatorCapo})" class="w-8 h-8 flex items-center justify-center rounded text-on-surface hover:bg-surface-dim transition-colors" title="Reset to Creator Key">
                                        <span class="material-symbols-outlined text-sm">refresh</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Transpiled formatting block -->
                        <div class="font-manrope text-lg leading-relaxed relative" id="lyrics-container-${song.songId}">
                            ${song.lyricsChords}
                        </div>
                    </div>
                </c:forEach>
            </c:otherwise>
        </c:choose>
    </div>
</div>

<script>
    const contextPath = '${pageContext.request.contextPath}';
    
    // Maintain a dictionary tracking each song's individual rolling semitone offset relative to the DATABASE original.
    // The server passes the exact delta inside data-creator-offset.
    const offsets = {};
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.song-container').forEach(container => {
            const id = container.getAttribute('data-song-id');
            const initOffset = parseInt(container.getAttribute('data-creator-offset') || 0);
            offsets[id] = { current: initOffset, default: initOffset };
        });
    });

    function transposeSong(songId, shift) {
        if (!offsets[songId]) return;
        offsets[songId].current += shift;
        executeTranspose(songId);
    }

    function resetSong(songId, defaultKey, defaultCapo) {
        if (!offsets[songId]) return;
        offsets[songId].current = offsets[songId].default;
        
        // Optimistic UI reset directly to known bindings
        document.getElementById('current-key-' + songId).textContent = defaultKey;
        executeTranspose(songId);
    }

    function executeTranspose(songId) {
        const offset = offsets[songId].current;
        const container = document.getElementById('lyrics-container-' + songId);
        
        container.style.opacity = '0.5';

        fetch(`${contextPath}/transpose`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `songId=${songId}&semitones=${offset}`
        })
        .then(r => r.json())
        .then(data => {
            if (data.error) {
                alert('Transpose error: ' + data.error);
                container.style.opacity = '1';
                return;
            }
            
            // Build reconstructed HTML directly mirroring SongServlet's render HTML flow
            let html = '';
            for (let i = 0; i < data.chordLines.length; i++) {
                const chords = data.chordLines[i];
                const lyrics = data.lyricLines[i];
                
                html += '<div class="song-line leading-tight whitespace-pre-wrap break-words">\n';
                if (chords && chords.trim().length > 0) {
                    html += `<div class="chord font-bold text-primary dark:text-blue-400 mt-2 font-mono">${chords}</div>\n`;
                }
                if (lyrics && lyrics.length > 0) {
                    html += `<div class="lyric text-on-surface dark:text-slate-200 mt-0.5">${lyrics}</div>\n`;
                }
                html += '</div>\n';
            }
            container.innerHTML = html;
            container.style.opacity = '1';
            
            // Reattach display key from the server response
            document.getElementById('current-key-' + songId).textContent = data.key;
        })
        .catch(err => {
            console.error('Transpose failed', err);
            container.style.opacity = '1';
        });
    }
</script>

</body>
</html>
