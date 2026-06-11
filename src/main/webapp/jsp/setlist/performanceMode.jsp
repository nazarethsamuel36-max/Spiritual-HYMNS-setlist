<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fmt" uri="jakarta.tags.fmt" %>
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <jsp:include page="/jsp/includes/head.jsp" />
    <title>${setlist.title} - Performance Mode</title>
    <style>
        :root {
            --stage-bg: #000000;
            --stage-surface: #121212;
            --stage-text: #ffffff;
            --stage-primary: #4d61ff;
            --stage-acc: #22c55e;
        }
        body, html {
            margin: 0;
            padding: 0;
            height: 100%;
            width: 100%;
            background: var(--stage-bg);
            color: var(--stage-text);
            overflow: hidden;
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }
        
        /* Performance Slider */
        .stage-container {
            position: relative;
            height: 100%;
            width: 100%;
            overflow: hidden;
        }
        .stage-track {
            display: flex;
            height: 100%;
            width: 100%;
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            will-change: transform;
        }
        .stage-slide {
            flex: 0 0 100%;
            height: 100%;
            width: 100%;
            overflow-y: auto;
            position: relative;
            padding: 2rem 1rem 8rem 1rem;
            box-sizing: border-box;
            -webkit-overflow-scrolling: touch;
        }
        
        /* Song Aesthetic */
        .song-card {
            max-width: 800px;
            margin: 0 auto;
            cursor: pointer;
            transition: opacity 0.2s ease;
            position: relative;
        }
        .song-card:hover {
            opacity: 0.85;
        }
        .song-card::after {
            content: '↗';
            position: absolute;
            top: 1rem;
            right: 1rem;
            font-size: 1.5rem;
            opacity: 0.5;
            transition: opacity 0.2s;
        }
        .song-card:hover::after {
            opacity: 1;
        }
        .song-header {
            border-bottom: 2px solid #333;
            padding-bottom: 1.5rem;
            margin-bottom: 2.5rem;
            text-align: center;
        }
        .song-title {
            font-size: 3.5rem;
            font-weight: 900;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: -0.02em;
            line-height: 1.1;
        }
        .song-artist {
            font-size: 1.5rem;
            color: #888;
            font-weight: 600;
            margin-top: 0.5rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }
        
        /* Chords & Lyrics Alignment */
        .song-line {
            font-family: 'Courier New', Courier, monospace;
            font-size: 1.5rem;
            line-height: 1.4;
            margin-bottom: 1.25rem;
            white-space: pre-wrap;
        }
        .chord {
            color: var(--stage-primary);
            font-weight: bold;
            font-size: 1.4rem;
        }
        .lyric {
            color: #e0e0e0;
        }
        
        /* Note/Event Aesthetic */
        .note-card {
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 2rem;
        }
        .note-icon {
            font-size: 5rem;
            color: var(--stage-primary);
            margin-bottom: 2rem;
            opacity: 0.8;
        }
        .note-title {
            font-size: 5rem;
            font-weight: 900;
            text-transform: uppercase;
            margin: 0;
            color: #fff;
            letter-spacing: 0.05em;
        }
        .note-desc {
            font-size: 2rem;
            color: #aaa;
            margin-top: 1.5rem;
            max-width: 600px;
        }
        
        /* Controls */
        .stage-nav {
            position: fixed;
            bottom: 2rem;
            left: 0;
            right: 0;
            display: flex;
            justify-content: space-between;
            padding: 0 2rem;
            pointer-events: none;
            z-index: 100;
        }
        .nav-btn {
            pointer-events: auto;
            width: 70px;
            height: 70px;
            border-radius: 50%;
            background: rgba(40, 40, 40, 0.8);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .nav-btn:hover {
            background: var(--stage-primary);
            transform: scale(1.1);
        }
        .nav-btn.disabled {
            opacity: 0.3;
            cursor: not-allowed;
            pointer-events: none;
        }
        
        /* Status Bar */
        .stage-status {
            position: fixed;
            bottom: 2.5rem;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(40, 40, 40, 0.9);
            backdrop-filter: blur(10px);
            padding: 0.75rem 2rem;
            border-radius: 999px;
            display: flex;
            align-items: center;
            gap: 1.5rem;
            font-weight: 800;
            border: 1px solid rgba(255, 255, 255, 0.15);
            z-index: 101;
        }
        .progress-pill {
            font-size: 0.75rem;
            background: #333;
            padding: 0.25rem 0.75rem;
            border-radius: 999px;
            color: #aaa;
        }
        
        /* Wake Lock Indicator */
        .wake-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: var(--stage-acc);
            box-shadow: 0 0 10px var(--stage-acc);
        }
        
        /* Transpose Controls (Mini) */
        .transpose-mini {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            background: #222;
            padding: 0.2rem 0.5rem;
            border-radius: 10px;
        }
        .trans-btn {
            background: none;
            border: none;
            color: #fff;
            font-size: 1rem;
            padding: 0 0.4rem;
            cursor: pointer;
        }
        
        /* Scrollbar */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
        
        @media (max-width: 768px) {
            .song-title { font-size: 2.2rem; }
            .note-title { font-size: 3rem; }
            .song-line { font-size: 1.1rem; }
            .stage-status { padding: 0.5rem 1rem; gap: 0.75rem; bottom: 1.5rem; }
            .nav-btn { width: 55px; height: 55px; }
        }
    </style>
</head>
<body class="stage-bg">

    <div class="stage-container">
        <div class="stage-track" id="stageTrack">
            <c:forEach var="item" items="${setlist.songs}" varStatus="loop">
                <div class="stage-slide" data-index="${loop.index}" data-type="${item.isHeader ? 'note' : 'song'}" id="slide-${loop.index}">
                    <c:choose>
                        <c:when test="${item.isHeader}">
                            <!-- NOTE SLIDE -->
                            <div class="note-card">
                                <span class="material-symbols-outlined note-icon">event_note</span>
                                <h2 class="note-title">${item.songTitle}</h2>
                                <p class="note-desc">Upcoming event in the setlist</p>
                            </div>
                        </c:when>
                        <c:otherwise>
                            <!-- SONG SLIDE -->
                            <div class="song-card" id="song-container-${item.songId}" data-song-id="${item.songId}" data-transpose="${item.transpositionOffset}" onclick="openSongView(${item.songId}, ${item.transpositionOffset})">
                                <div class="song-header">
                                    <h1 class="song-title">${item.songTitle}</h1>
                                    <p class="song-artist">${item.songArtist}</p>
                                </div>
                                <div class="song-body" id="lyrics-body-${item.songId}">
                                    ${item.lyricsChords}
                                </div>
                            </div>
                        </c:otherwise>
                    </c:choose>
                </div>
            </c:forEach>
        </div>
    </div>

    <!-- Navigation Overlay -->
    <div class="stage-nav">
        <div class="nav-btn disabled" id="prevBtn" onclick="prevSlide()">
            <span class="material-symbols-outlined">chevron_left</span>
        </div>
        <div class="nav-btn" id="nextBtn" onclick="nextSlide()">
            <span class="material-symbols-outlined">chevron_right</span>
        </div>
    </div>

    <!-- Central Status Bar -->
    <div class="stage-status">
        <div class="wake-dot" title="Wake Lock Active"></div>
        <div id="slideCounter" class="progress-pill">1 / ${setlist.songs.size()}</div>
        
        <div id="activeSongControls" class="flex items-center gap-4 hidden">
             <div class="text-xs uppercase text-slate-500 tracking-tighter">Key</div>
             <div class="transpose-mini">
                 <button class="trans-btn" onclick="transposeActive(-1)">−</button>
                 <span id="currentKeyDisplay" class="font-black text-primary text-sm min-w-[20px] text-center">-</span>
                 <button class="trans-btn" onclick="transposeActive(1)">+</button>
             </div>
        </div>

        <button onclick="exitPerformance()" class="text-xs font-black uppercase text-error hover:underline bg-transparent border-none p-0 cursor-pointer">Exit</button>
    </div>

    <script>
        const setlistId = ${setlist.id};
        const contextPath = '${pageContext.request.contextPath}';
        const totalSlides = ${setlist.songs.size()};
        const items = [
            <c:forEach var="item" items="${setlist.songs}" varStatus="loop">
                {
                    id: ${item.id},
                    songId: ${item.songId},
                    type: "${item.isHeader ? 'note' : 'song'}",
                    baseKey: "${item.creatorKey}",
                    currentOffset: ${item.transpositionOffset},
                    baseOffset: ${item.transpositionOffset}
                }${!loop.last ? ',' : ''}
            </c:forEach>
        ];

        let currentIndex = 0;
        const track = document.getElementById('stageTrack');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const counter = document.getElementById('slideCounter');
        const songControls = document.getElementById('activeSongControls');
        const keyDisplay = document.getElementById('currentKeyDisplay');

        // Navigation Logic
        function updateUI() {
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
            counter.innerText = `${currentIndex + 1} / ${totalSlides}`;
            
            prevBtn.classList.toggle('disabled', currentIndex === 0);
            nextBtn.classList.toggle('disabled', currentIndex === totalSlides - 1);

            const active = items[currentIndex];
            if (active && active.type === 'song') {
                songControls.classList.remove('hidden');
                updateKeyDisplay();
            } else {
                songControls.classList.add('hidden');
            }
        }

        function nextSlide() {
            if (currentIndex < totalSlides - 1) {
                resetCurrentSongKey(); // Reset key before leaving
                currentIndex++;
                updateUI();
            }
        }

        function prevSlide() {
            if (currentIndex > 0) {
                resetCurrentSongKey(); // Reset key before leaving
                currentIndex--;
                updateUI();
            }
        }

        // Key Logic
        function updateKeyDisplay() {
            const active = items[currentIndex];
            keyDisplay.innerText = active.baseKey || '?';
        }

        function resetCurrentSongKey() {
            const item = items[currentIndex];
            if (item && item.type === 'song' && item.currentOffset !== item.baseOffset) {
                item.currentOffset = item.baseOffset;
                executeTranspose(currentIndex, true);
            }
        }

        function transposeActive(delta) {
            const item = items[currentIndex];
            if (!item || item.type !== 'song') return;
            item.currentOffset += delta;
            executeTranspose(currentIndex, false);
        }

        async function executeTranspose(index, silent) {
            const item = items[index];
            const container = document.getElementById(`lyrics-body-${item.songId}`);
            if (!container) return;

            if (!silent) container.style.opacity = '0.5';

            try {
                const r = await fetch(`${contextPath}/transpose`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `songId=${item.songId}&semitones=${item.currentOffset}`
                });
                const data = await r.json();
                
                if (data.error) throw new Error(data.error);

                let html = '';
                for (let i = 0; i < data.chordLines.length; i++) {
                    const chords = data.chordLines[i];
                    const lyrics = data.lyricLines[i];
                    html += '<div class="song-line">\n';
                    if (chords && chords.trim().length > 0) {
                        html += `  <div class="chord">${chords.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</div>\n`;
                    }
                    if (lyrics && lyrics.length > 0) {
                        html += `  <div class="lyric">${lyrics.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</div>\n`;
                    }
                    html += '</div>\n';
                }
                container.innerHTML = html;
                if (!silent) keyDisplay.innerText = data.key;
            } catch (err) {
                console.error('Transpose failed', err);
            } finally {
                container.style.opacity = '1';
            }
        }

        // Exit
        function exitPerformance() {
            if (confirm('Exit Performance Mode?')) {
                window.location.href = `${contextPath}/setlist/${setlistId}`;
            }
        }

        // Swipe Detection
        let touchStartX = 0;
        let touchEndX = 0;

        document.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        });

        document.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });

        function handleSwipe() {
            const threshold = 50;
            if (touchStartX - touchEndX > threshold) nextSlide(); // Swipe Left
            if (touchEndX - touchStartX > threshold) prevSlide(); // Swipe Right
        }

        // Keyboard Shortcuts
        document.addEventListener('keydown', e => {
            if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
            if (e.key === 'ArrowLeft') prevSlide();
        });

        // Wake Lock Implementation
        let wakeLock = null;
        async function requestWakeLock() {
            if ('wakeLock' in navigator) {
                try {
                    wakeLock = await navigator.wakeLock.request('screen');
                    console.log('Wake Lock is active');
                } catch (err) {
                    console.error(err.name + ', ' + err.message);
                }
            }
        }
        requestWakeLock();

        // Song Navigation from Setlist
        async function openSongView(songId, transpose) {
            try {
                // Store transpose in session via setlist servlet
                const response = await fetch(`${contextPath}/setlist/setTranspose`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `songId=${songId}&semitones=${transpose}`
                });

                if (response.ok) {
                    // Navigate to song view with transpose applied
                    window.location.href = `${contextPath}/song?id=${songId}`;
                } else {
                    console.error('Failed to store transpose');
                    // Still navigate even if transpose storage failed
                    window.location.href = `${contextPath}/song?id=${songId}`;
                }
            } catch (err) {
                console.error('Error opening song:', err);
                // Fallback: navigate directly to song
                window.location.href = `${contextPath}/song?id=${songId}`;
            }
        }

        // Initial UI State
        updateUI();
    </script>
</body>
</html>
