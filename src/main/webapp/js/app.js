/* ========================================
   Worship Song Library — App JavaScript
   ======================================== */

// ===== Transpose UI =====
let currentSemitones = 0;

/**
 * Transposes the song view live using AJAX.
 * Bug #6 fix: Restored section label styling ([Verse], [Chorus]) after transposition.
 * Bug #2 fix: Added HTML escaping for all injected content to prevent XSS.
 */
function transposeUI(direction) {
    currentSemitones += direction;

    const songId = document.getElementById('songId')?.value;
    if (!songId) return;

    fetch(`${contextPath}/transpose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `songId=${songId}&semitones=${currentSemitones}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error(data.error);
            return;
        }

        const songBody = document.getElementById('songBody');
        if (songBody && data.chordLines && data.lyricLines) {
            let html = '';
            for (let i = 0; i < data.chordLines.length; i++) {
                const chordLine = data.chordLines[i] || '';
                const lyricLine = data.lyricLines[i] || '';
                const noteLine = (data.noteLines && data.noteLines[i]) || '';

                // Bug #6 logic: Detect if this line is a section label like [Verse]
                const sectionMatch = lyricLine.trim().match(/^\[([^\]]+)\]$/);
                const isSectionLabel = (!chordLine.trim() && sectionMatch);

                if (isSectionLabel) {
                    const labelText = sectionMatch[1].toLowerCase();
                    let cssClass = 'section-other';
                    if (labelText.startsWith('verse')) cssClass = 'section-verse';
                    else if (labelText.startsWith('chorus')) cssClass = 'section-chorus';
                    else if (labelText.startsWith('bridge')) cssClass = 'section-bridge';
                    else if (labelText.startsWith('pre')) cssClass = 'section-prechorus';
                    else if (labelText.startsWith('intro')) cssClass = 'section-intro';
                    else if (labelText.startsWith('outro')) cssClass = 'section-outro';
                    
                    html += `<div class="section-label ${cssClass}">${escapeHtml(sectionMatch[1])}</div>`;
                } else {
                    // Normal chord+lyric pair
                    if (chordLine.trim()) {
                        html += `<div class="chord-line">${escapeHtml(chordLine)}</div>`;
                    }
                    if (lyricLine.trim()) {
                        html += `<div class="lyric-line">${escapeHtml(lyricLine)}</div>`;
                    } else {
                        html += `<div class="lyric-line blank"> </div>`;
                    }
                }

                if (noteLine.trim()) {
                    html += `<div class="note-line" style="display:none;">${escapeHtml(noteLine)}</div>`;
                }
            }
            songBody.innerHTML = html;
            
            // Re-apply current view mode (chords/lyrics/notes)
            const activeTab = document.querySelector('.view-tabs button.active, .ctrl-btn.active[data-mode]');
            if (activeTab) {
                setViewMode(activeTab.getAttribute('data-mode'));
            }
        }

        updateKeyDisplay(data.key, data.capo);
    })
    .catch(error => console.error('Transpose error:', error));
}

function updateKeyDisplay(newKey, capo) {
    const keyBadge = document.getElementById('keyDisplay');
    if (keyBadge) keyBadge.textContent = newKey;

    const keyBadgeMobile = document.getElementById('keyDisplayMobile');
    if (keyBadgeMobile) keyBadgeMobile.textContent = newKey;

    const capoHint = document.getElementById('capoHint');
    if (capoHint) {
        capoHint.textContent = capo ? 'Capo ' + capo : '';
        capoHint.style.display = capo ? 'flex' : 'none';
        // If it's a badge-style sibling, we might need to update its container
        if (capoHint.parentElement && capoHint.parentElement.classList.contains('justify-between')) {
            capoHint.parentElement.style.display = capo ? 'flex' : 'none';
        }
    }

    const semitoneDisplay = document.getElementById('semitoneDisplay');
    if (semitoneDisplay) {
        semitoneDisplay.textContent = (currentSemitones >= 0 ? '+' : '') + currentSemitones;
    }
}

// ===== Font Size Controls =====
let currentFontSize = 16;

function applyFontSize() {
    localStorage.setItem('ws_font_size', currentFontSize);
    const songBody = document.getElementById('songBody');
    if (songBody) {
        songBody.style.fontSize = currentFontSize + 'px';
    }
    const fontDisplay = document.getElementById('fontSizeDisplay');
    if (fontDisplay) fontDisplay.textContent = currentFontSize + 'px';
}

function increaseFontSize() {
    currentFontSize = Math.min(28, currentFontSize + 2);
    applyFontSize();
}

function decreaseFontSize() {
    currentFontSize = Math.max(10, currentFontSize - 2);
    applyFontSize();
}

// ===== View Mode Tabs =====
function setViewMode(mode) {
    document.querySelectorAll('[data-mode]').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll(`[data-mode="${mode}"]`).forEach(btn => btn.classList.add('active'));

    const songBody = document.getElementById('songBody');
    if (!songBody) return;

    const chordLines = songBody.querySelectorAll('.chord-line');
    const noteLines = songBody.querySelectorAll('.note-line');

    switch (mode) {
        case 'chords':
            chordLines.forEach(el => el.style.display = 'block');
            noteLines.forEach(el => el.style.display = 'none');
            break;
        case 'notes':
            chordLines.forEach(el => el.style.display = 'none');
            noteLines.forEach(el => el.style.display = 'block');
            break;
        case 'lyrics':
            chordLines.forEach(el => el.style.display = 'none');
            noteLines.forEach(el => el.style.display = 'none');
            break;
    }
}

// ===== Auto Scroll =====
let scrollInterval = null;
let scrollSpeed = 3;

function toggleAutoScroll() {
    if (scrollInterval) stopAutoScroll();
    else startAutoScroll();
}

function startAutoScroll() {
    stopAutoScroll();
    const slider = document.getElementById('scrollSpeedSlider');
    if (slider) scrollSpeed = parseInt(slider.value, 10) || 3;

    const interval = Math.max(10, 160 - (scrollSpeed * 15));
    scrollInterval = setInterval(() => {
        window.scrollBy(0, 1);
        if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight) {
            stopAutoScroll();
        }
    }, interval);

    const btn = document.getElementById('scrollToggle');
    if (btn) {
        btn.classList.add('active');
        btn.textContent = '⏸ Stop';
    }

    const speedContainer = document.getElementById('scrollSpeedContainer');
    if (speedContainer) speedContainer.style.display = 'flex';
    
    updateWakeLock(true);
}

function stopAutoScroll() {
    if (scrollInterval) {
        clearInterval(scrollInterval);
        scrollInterval = null;
    }
    const btn = document.getElementById('scrollToggle');
    if (btn) {
        btn.classList.remove('active');
        btn.textContent = '▶ Scroll';
    }
    const speedContainer = document.getElementById('scrollSpeedContainer');
    if (speedContainer) speedContainer.style.display = 'none';
    
    updateWakeLock(false);
}

function updateScrollSpeed(val) {
    scrollSpeed = parseInt(val, 10);
    if (scrollInterval) startAutoScroll();
}

// ===== Wake Lock (Bug #12 PWA Enhancement) =====
let wakeLock = null;
async function updateWakeLock(acquire) {
    if (!('wakeLock' in navigator)) return;
    try {
        if (acquire && !wakeLock) {
            wakeLock = await navigator.wakeLock.request('screen');
            document.getElementById('wakeLockIndicator')?.style.setProperty('display', 'flex', 'important');
        } else if (!acquire && wakeLock) {
            await wakeLock.release();
            wakeLock = null;
            document.getElementById('wakeLockIndicator')?.style.setProperty('display', 'none', 'important');
        }
    } catch (err) {
        console.error('Wake Lock error:', err);
    }
}

// ===== Inline Editor & Chord Palette =====
function toggleInlineEditor() {
    const editor = document.getElementById('inlineEditor');
    if (!editor) return;
    editor.style.display = (editor.style.display === 'none') ? 'block' : 'none';
    if (editor.style.display === 'block') {
        editor.scrollIntoView({ behavior: 'smooth' });
    }
}

function selectChordFamily(index) {
    const CHORD_FAMILIES = [
        { name: 'Major / Minor', chords: ['C','D','E','F','G','A','B','Db','Eb','F#', 'Cm','Dm','Em','Fm','Gm','Am','Bm'] },
        { name: '7th / Maj7', chords: ['C7','D7','E7','F7','G7','A7','B7','Cmaj7','Dmaj7','Fmaj7','Gmaj7','Amaj7','Bbmaj7'] },
        { name: 'Sus / Add / Dim', chords: ['Csus4','Dsus4','Gsus4','Asus4','Cadd9','Gadd9','Cdim','Ddim','Bdim','Caug'] },
        { name: 'Extended / Slash', chords: ['C9','G9','Bm7b5','C/E','C/G','D/F#','G/B','F/A','Am/C'] }
    ];

    document.querySelectorAll('#familyTabs .chord-root-btn').forEach((btn, i) => {
        btn.classList.toggle('selected', i === index);
    });

    const grid = document.getElementById('chordFamilyGrid');
    if (!grid) return;

    let html = '';
    CHORD_FAMILIES[index].chords.forEach(chord => {
        html += `<button type="button" class="chord-type-btn" onmousedown="event.preventDefault();" onclick="insertChordAtCursor('${chord}')">[${chord}]</button>`;
    });
    grid.innerHTML = html;
}

function insertChordAtCursor(chord) {
    const textarea = document.getElementById('editChords');
    if (!textarea) return;
    const insertion = `[${chord}]`;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    textarea.value = text.substring(0, start) + insertion + text.substring(end);
    textarea.selectionStart = textarea.selectionEnd = start + insertion.length;
    textarea.focus();
}

function savePersonalVersion() {
    const songId = document.getElementById('songId')?.value;
    const chords = document.getElementById('editChords')?.value;
    if (!songId) return;

    fetch(`${contextPath}/song/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `songId=${songId}&customChords=${encodeURIComponent(chords)}`
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            showToast(data.message);
            setTimeout(() => window.location.reload(), 1000);
        } else showToast(data.error, true);
    });
}

function resetToOriginal() {
    const songId = document.getElementById('songId')?.value;
    if (!songId || !confirm('Reset to master version?')) return;
    fetch(`${contextPath}/song/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `songId=${songId}`
    }).then(() => window.location.reload());
}

// ===== Live Search (Bug #39 / #41) =====
function initLiveSearch(inputId, resultsId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    let timeout = null;
    input.addEventListener('input', () => {
        clearTimeout(timeout);
        const query = input.value.trim();
        if (query.length < 2) {
            document.getElementById(resultsId).innerHTML = '';
            return;
        }
        timeout = setTimeout(() => {
            fetch(`${contextPath}/search?q=${encodeURIComponent(query)}`, {
                headers: { 'Accept': 'application/json' }
            })
            .then(r => r.json())
            .then(data => {
                let html = '';
                data.forEach(song => {
                    html += `
                        <div class="song-card mb-2">
                            <a href="${contextPath}/song?id=${song.id}" class="song-title">${escapeHtml(song.title)}</a>
                            <div class="song-artist">${escapeHtml(song.artist || 'Unknown')}</div>
                            <div class="mt-2 text-xs text-muted-worship">${song.matchedLine ? '...' + escapeHtml(song.matchedLine) + '...' : ''}</div>
                        </div>`;
                });
                document.getElementById(resultsId).innerHTML = html || '<div class="p-4 text-center text-muted">No results found</div>';
            });
        }, 300);
    });
}

// ===== Utilities =====
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(msg, isError = false) {
    const t = document.createElement('div');
    t.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl text-white font-bold shadow-2xl z-[9999]';
    t.style.backgroundColor = isError ? 'var(--color-danger)' : 'var(--color-success)';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

// ===== Bootstrap / Accessibility (Bug #45) =====
document.addEventListener('DOMContentLoaded', () => {
    initLiveSearch('searchInput', 'searchResults');
    initLiveSearch('leafletSearchInput', 'leafletSearchResults');
    
    // Add keyboard support for song cards
    document.querySelectorAll('.song-card').forEach(card => {
        if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '0');
        card.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const link = card.querySelector('a');
                if (link) link.click();
            }
        });
    });

    const savedSize = localStorage.getItem('ws_font_size');
    if (savedSize) { currentFontSize = parseInt(savedSize, 10); applyFontSize(); }
});
