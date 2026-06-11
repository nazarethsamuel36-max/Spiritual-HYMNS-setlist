/* ========================================
   Worship Song Library — App JavaScript
   ======================================== */

// ===== Transpose UI =====
let currentSemitones = 0;
let currentColumnCount = 1;
let currentSongViewMode = 'lyrics';
let currentStructuredLines = [];

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
        if (songBody && data.structuredLines) {
            renderSongPairs(data.structuredLines);
        }

        updateKeyDisplay(data.key, data.capo);
    })
    .catch(error => console.error('Transpose error:', error));
}

function resetTranspose() {
    if (currentSemitones !== 0) {
        transposeUI(-currentSemitones);
    }
}

/**
 * Single Rendering Pipeline for Chords and Lyrics.
 * Renders structured lines into the DOM securely.
 */
function renderSongPairs(structuredLines) {
    const songBody = document.getElementById('songBody');
    if (!songBody || !structuredLines) return;

    currentStructuredLines = structuredLines;
    renderSongBody();
}

async function renderSongBody() {
    const songBody = document.getElementById('songBody');
    if (!songBody || !currentStructuredLines) return;

    // Requirement 7: Ensure fonts are loaded before measuring
    if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
    }

    let html = '';
    const showChords = currentSongViewMode === 'lyrics-chords';
    
    // JS decides layout: get available width
    const maxWidth = songBody.clientWidth || 800; 
    const font = currentFontSize + "px monospace"; // Requirement 2: Font match

    currentStructuredLines.forEach(function(line) {
        const lyrics = line.lyrics || "";
        const chords = line.chords || [];

        const sectionMatch = lyrics.trim().match(/^[\[\{]([^\]\}]+)[\]\}]$/);
        const isSectionLabel = (chords.length === 0 && sectionMatch);

        if (isSectionLabel) {
            const labelText = sectionMatch[1].toLowerCase();
            let cssClass = 'section-other';
            if (labelText.startsWith('verse')) cssClass = 'section-verse';
            else if (labelText.startsWith('chorus')) cssClass = 'section-chorus';
            else if (labelText.startsWith('bridge')) cssClass = 'section-bridge';
            else if (labelText.startsWith('pre')) cssClass = 'section-prechorus';
            else if (labelText.startsWith('intro')) cssClass = 'section-intro';
            else if (labelText.startsWith('outro')) cssClass = 'section-outro';
            
            html += `<div class="section-label ${cssClass} mt-6 mb-2 block w-max">${escapeHtml(sectionMatch[1])}</div>`;
        } else if (!lyrics.replace(/\s/g, '').length) {
            if (showChords && chords.length > 0) {
                const chordLine = buildChordLine(lyrics, chords);
                html += '<div class="song-pair">';
                html += `<div class="chord-line">${escapeHtml(chordLine).replace(/ /g, '&nbsp;')}</div>`;
                html += '</div>';
            } else {
                html += '<div class="song-stanza-gap"></div>';
            }
        } else {
            // Requirement 5: structuredLines → splitStructuredLine() → segments → render
            const segments = splitStructuredLine({ lyrics, chords }, maxWidth, font);
            
            segments.forEach(seg => {
                if (showChords) {
                    const chordLine = buildChordLine(seg.text, seg.chords);
                    html += '<div class="song-pair">';
                    html += `<div class="chord-line">${escapeHtml(chordLine).replace(/ /g, '&nbsp;')}</div>`;
                    html += `<div class="lyrics-line">${escapeHtml(seg.text).replace(/ /g, '&nbsp;')}</div>`;
                    html += '</div>';
                } else {
                    html += `<div class="lyrics-line lyrics-only-line">${escapeHtml(seg.text).replace(/ /g, '&nbsp;')}</div>`;
                }
            });
        }
    });
    
    songBody.innerHTML = html;
    applyColumnCount();
}

function buildChordLine(lyrics, chords) {
    if (!chords || chords.length === 0) return '';

    const line = lyrics.split('');
    const sortedChords = chords
        .slice()
        .sort((a, b) => (parseInt(a.position, 10) || 0) - (parseInt(b.position, 10) || 0));

    let output = '';
    let cursor = 0;

    sortedChords.forEach(occ => {
        const position = Math.max(0, parseInt(occ.position, 10) || 0);
        const chord = occ.chord || '';
        const target = position;

        if (target > cursor) {
            output += ' '.repeat(target - cursor);
            cursor = target;
        } else if (target < cursor) {
            // Chord is at or before current cursor, ensure at least one space if not at start
            if (output.length > 0 && !output.endsWith(' ')) {
                output += ' ';
                cursor += 1;
            }
        }

        output += chord;
        cursor += chord.length;
    });

    console.log("OUTPUT:", output);
    return output;
}

function setSongViewMode(mode) {
    currentSongViewMode = mode === 'lyrics-chords' ? 'lyrics-chords' : 'lyrics';
    localStorage.setItem('ws_view_mode', currentSongViewMode);

    document.querySelectorAll('[data-view-mode]').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-view-mode') === currentSongViewMode);
    });

    renderSongBody();
}

function updateKeyDisplay(newKey, capo) {
    const keyBadge = document.getElementById('keyDisplay');
    if (keyBadge) keyBadge.textContent = newKey;

    const keyBadgeMobile = document.getElementById('keyDisplayMobile');
    if (keyBadgeMobile) keyBadgeMobile.textContent = newKey;

    const capoHint = document.getElementById('capoHint');
    if (capoHint) {
        capoHint.style.display = capo ? 'flex' : 'none';
    }

    const capoValue = document.getElementById('capoValue');
    if (capoValue) {
        capoValue.textContent = capo || '';
    }

    const semitoneDisplay = document.getElementById('semitoneDisplay');
    if (semitoneDisplay) {
        semitoneDisplay.textContent = (currentSemitones >= 0 ? '+' : '') + currentSemitones;
    }
}

// ===== Font Size Controls =====
let currentFontSize = 16;
let fontScale = 1; // placeholder for future control

function applyFontSize() {
    localStorage.setItem('ws_font_size', currentFontSize);
    
    // apply scale to root for responsive REM system
    document.documentElement.style.fontSize = (16 * fontScale) + "px";
    
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

// ===== Column Controls =====
function applyColumnCount() {
    const songBody = document.getElementById('songBody');
    if (!songBody) return;

    const isMultiColumn = currentColumnCount > 1 && window.innerWidth >= 1024;
    songBody.style.columnCount = isMultiColumn ? String(currentColumnCount) : '1';
    songBody.style.columnGap = isMultiColumn ? '2.5rem' : '0';

    localStorage.setItem('ws_column_count', String(currentColumnCount));
}

function setColumnCount(count) {
    currentColumnCount = count === 2 ? 2 : 1;

    document.querySelectorAll('[data-col]').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll(`[data-col="${currentColumnCount}"]`).forEach(btn => btn.classList.add('active'));

    applyColumnCount();
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
    if (slider) scrollSpeed = parseInt(slider.value, 10) || 5;

    // Finer speed control (1-25 range)
    const interval = Math.max(5, 200 - (scrollSpeed * 7.5));
    scrollInterval = setInterval(() => {
        window.scrollBy(0, 1);
        if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight) {
            stopAutoScroll();
        }
    }, interval);

    const btn = document.getElementById('scrollToggle');
    if (btn) {
        btn.classList.add('active');
        btn.textContent = 'Stop';
    }

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
        btn.textContent = 'Scroll';
    }
    
    updateWakeLock(false);
}

function updateScrollSpeed(val) {
    scrollSpeed = parseInt(val, 10);
    const valDisplay = document.getElementById('scrollSpeedVal');
    if (valDisplay) valDisplay.textContent = 'S:' + scrollSpeed;
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

function insertSectionAtCursor(sectionLabel) {
    const textarea = document.getElementById('editChords');
    if (!textarea) return;
    
    // Check if the cursor is already at the start of a new line
    const text = textarea.value;
    const start = textarea.selectionStart;
    const prependNewline = (start > 0 && text.charAt(start - 1) !== '\n');
    
    const insertion = (prependNewline ? '\n' : '') + `{${sectionLabel}}\n`;
    
    const end = textarea.selectionEnd;
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

// ===== Live Search (Bug #39 / #41 / New Spec) =====
function initLiveSearch(inputId, resultsId) {
    const input = document.getElementById(inputId);
    const resultsContainer = document.getElementById(resultsId);
    if (!input || !resultsContainer) return;

    let timeout = null;
    let requestCounter = 0;

    // Loading indicator element
    const loaderId = resultsId + '-loader';
    let loader = document.getElementById(loaderId);
    if (!loader) {
        loader = document.createElement('div');
        loader.id = loaderId;
        loader.className = 'hidden text-center p-2 mt-2';
        loader.innerHTML = '<span class="material-symbols-outlined animate-spin text-primary">autorenew</span>';
        input.parentNode.appendChild(loader);
    }

    input.addEventListener('input', () => {
        clearTimeout(timeout);
        const rawQuery = input.value;
        const query = rawQuery.trim();
        
        if (query.length === 0) {
            resultsContainer.innerHTML = '';
            loader.classList.add('hidden');
            return;
        }

        // Debounce
        timeout = setTimeout(() => {
            const isNumber = /^\\d+$/.test(query);
            const type = isNumber ? 'number' : 'text';
            
            // Extract language if there is a language filter dropdown
            const langSelect = document.getElementById('languageFilter');
            const language = langSelect ? langSelect.value : '';

            const currentRequestId = ++requestCounter;
            
            loader.classList.remove('hidden');

            fetch(`${contextPath}/api/live-search`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json' 
                },
                body: JSON.stringify({
                    query: query,
                    type: type,
                    language: language,
                    requestId: String(currentRequestId)
                })
            })
            .then(r => r.json())
            .then(data => {
                // Ignore older responses
                if (data.requestId && parseInt(data.requestId, 10) !== currentRequestId) {
                    return;
                }
                
                loader.classList.add('hidden');
                
                const results = Array.isArray(data) ? data : (data.results || []);
                let html = '';
                
                if (results.length === 0) {
                    if (type === 'number') {
                        html = `<div class="p-4 text-center text-muted">No song ${escapeHtml(query)} in selected language</div>`;
                    } else {
                        html = `<div class="p-4 text-center text-muted">No results found</div>`;
                    }
                } else {
                    results.forEach(song => {
                        html += `
                            <div class="song-card group bg-surface-container-lowest p-4 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-surface-dim hover:border-primary/20 flex flex-col justify-between text-decoration-none mb-3 cursor-pointer" onclick="window.location.href='${contextPath}/song?id=${song.id}'">
                                <div class="flex justify-between items-start">
                                    <div class="flex-grow">
                                        <span style="font-size:10px;font-weight:800;letter-spacing:0.12em;color:#9ca3af;text-transform:uppercase;display:block;margin-bottom:4px">#${escapeHtml(String(song.songNumber))}</span>
                                        <h2 class="text-lg font-headline font-bold text-on-surface leading-tight group-hover:text-primary transition-colors">${escapeHtml(song.title)}</h2>
                                    </div>
                                </div>
                                <p class="text-xs font-semibold text-primary/80 tracking-wide uppercase">${escapeHtml(song.artist || 'Unknown')}</p>
                                ${song.matchedLine ? `<div class="mt-2 text-xs font-mono text-on-surface-variant">...${escapeHtml(song.matchedLine)}...</div>` : ''}
                            </div>`;
                    });
                }
                
                // Replace smoothly (we could add a simple CSS animation class if we wanted)
                resultsContainer.style.opacity = '0.8';
                setTimeout(() => {
                    resultsContainer.innerHTML = html;
                    resultsContainer.style.opacity = '1';
                }, 50);
            })
            .catch(error => {
                console.error("Live search error:", error);
                loader.classList.add('hidden');
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

    const savedColumns = parseInt(localStorage.getItem('ws_column_count') || '1', 10);
    setColumnCount(savedColumns);

    const savedMode = localStorage.getItem('ws_view_mode');
    currentSongViewMode = savedMode || 'lyrics-chords';
    
    document.querySelectorAll('[data-view-mode]').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-view-mode') === currentSongViewMode);
    });

    window.addEventListener('resize', applyColumnCount);

    // Initial render if data is provided from backend Single Rendering Pipeline
    if (window.initialStructuredLines && window.initialStructuredLines.length > 0) {
        renderSongPairs(window.initialStructuredLines);
    }
});
