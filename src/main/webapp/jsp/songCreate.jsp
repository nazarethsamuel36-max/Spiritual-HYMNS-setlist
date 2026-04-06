<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html class="light" lang="en">
<head>
    <title>Add New Song — The Resonant Archive</title>
    <jsp:include page="/jsp/includes/head.jsp"/>
    <style>
        .chord-palette {
            background: var(--md-sys-color-surface-container-low);
            padding: 1.5rem;
            border-radius: 1.5rem;
            border: 1px solid var(--md-sys-color-outline-variant);
            margin-bottom: 2rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .chord-palette-label {
            font-size: 0.75rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: var(--md-sys-color-primary);
            margin-bottom: 1.25rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .chord-palette-label::after {
            content: "";
            flex-grow: 1;
            height: 1px;
            background: var(--md-sys-color-outline-variant);
        }
        .chord-root-btn {
            background: var(--md-sys-color-surface-container-lowest);
            color: var(--md-sys-color-on-surface-variant);
            border: 1px solid var(--md-sys-color-outline-variant);
            padding: 0.6rem 1rem;
            border-radius: 0.75rem;
            font-size: 0.85rem;
            font-weight: 700;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
        }
        .chord-root-btn:hover {
            background: var(--md-sys-color-surface-dim);
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .chord-root-btn.selected {
            background: var(--md-sys-color-primary);
            color: var(--md-sys-color-on-primary);
            border-color: var(--md-sys-color-primary);
        }
        .chord-types {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        .chord-roots {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-bottom: 1rem;
        }
    </style>
</head>
<body class="bg-surface font-body text-on-surface flex flex-col min-h-screen">
    <jsp:include page="/jsp/navbar.jsp"/>

    <main class="flex-grow max-w-4xl mx-auto w-full px-6 py-16">
        <div class="mb-12">
            <h1 class="text-4xl font-headline font-black tracking-tight text-on-surface mb-4">Add New Song</h1>
            <p class="text-on-surface-variant text-lg">Build your personal library. Type chords in brackets: <code class="bg-surface-container-highest px-2 py-1 rounded text-primary font-bold">[G]Amazing [D]Grace</code></p>
        </div>

        <c:if test="${not empty error}">
            <div class="bg-error-container text-on-error-container p-6 rounded-2xl mb-8 font-bold flex items-center gap-4 animate-pulse">
                <span class="material-symbols-outlined">error</span>
                ${error}
            </div>
        </c:if>

        <form action="${pageContext.request.contextPath}/song/add" method="post" class="space-y-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="space-y-2">
                    <label class="block font-bold text-sm uppercase tracking-widest text-outline ml-1">Song Title</label>
                    <input type="text" name="title" required placeholder="e.g. 10,000 Reasons" class="w-full px-6 py-4 bg-surface-container-low border border-outline-variant/30 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm font-medium">
                </div>
                <div class="space-y-2">
                    <label class="block font-bold text-sm uppercase tracking-widest text-outline ml-1">Artist / Writer</label>
                    <input type="text" name="artist" placeholder="e.g. Matt Redman" class="w-full px-6 py-4 bg-surface-container-low border border-outline-variant/30 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm font-medium">
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="space-y-2">
                    <label class="block font-bold text-sm uppercase tracking-widest text-outline ml-1">Original Key</label>
                    <select name="key" class="w-full px-6 py-4 bg-surface-container-low border border-outline-variant/30 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm font-bold cursor-pointer">
                        <option value="C">C Major</option>
                        <option value="D">D Major</option>
                        <option value="E">E Major</option>
                        <option value="F">F Major</option>
                        <option value="G" selected>G Major</option>
                        <option value="A">A Major</option>
                        <option value="B">B Major</option>
                        <option value="Am">A Minor</option>
                        <option value="Em">E Minor</option>
                        <option value="Dm">D Minor</option>
                    </select>
                </div>
                <div class="space-y-2">
                    <label class="block font-bold text-sm uppercase tracking-widest text-outline ml-1">Language</label>
                    <select name="language" class="w-full px-6 py-4 bg-surface-container-low border border-outline-variant/30 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm font-bold cursor-pointer">
                        <option value="english" selected>English</option>
                        <option value="hindi">Hindi</option>
                        <option value="marathi">Marathi</option>
                        <option value="bengali">Bengali</option>
                    </select>
                </div>
            </div>

            <div class="space-y-2">
                <div class="flex justify-between items-end mb-2 ml-1">
                    <label class="block font-bold text-sm uppercase tracking-widest text-outline">Lyrics & Chords</label>
                    <span class="text-xs font-bold text-primary px-3 py-1 bg-primary/10 rounded-full">Pro Tip: Use [brackets] for chords</span>
                </div>

                <!-- Specialized Creation Palette -->
                <div class="chord-palette" id="chordPalette">
                    <div class="chord-palette-label">Chord Palette — tap to insert</div>
                    <div class="chord-roots mb-4" id="creationTabs">
                        <button type="button" class="chord-root-btn selected" onclick="selectCreationFamily(0)">Common (Major/Minor)</button>
                        <button type="button" class="chord-root-btn" onclick="selectCreationFamily(1)">7th & Maj7</button>
                        <button type="button" class="chord-root-btn" onclick="selectCreationFamily(2)">Sus / Add</button>
                        <button type="button" class="chord-root-btn" onclick="selectCreationFamily(3)">Slash / Adv</button>
                    </div>
                    <div class="chord-types" id="creationGrid"></div>
                </div>

                <textarea id="createChords" name="chords" rows="15" required placeholder="[G]Bless the [D]Lord O my [Em]soul..." class="w-full p-8 bg-surface-container-lowest border border-outline-variant/30 rounded-3xl font-mono text-base focus:ring-2 focus:ring-primary outline-none transition-all shadow-inner leading-relaxed"></textarea>
            </div>

            <div class="flex items-center gap-6 pt-8 pb-32">
                <button type="submit" class="px-10 py-5 bg-primary text-white font-black text-lg rounded-2xl shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all active:scale-95 flex items-center gap-3">
                    <span class="material-symbols-outlined font-black">save</span>
                    Create Song
                </button>
                <a href="${pageContext.request.contextPath}/songs" class="px-8 py-5 bg-surface-container-high text-on-surface font-bold text-lg rounded-2xl hover:bg-surface-dim transition-all text-decoration-none" style="text-decoration: none;">Cancel</a>
            </div>
        </form>
    </main>

    <jsp:include page="/jsp/includes/footer.jsp"/>

    <script>
        const textarea = document.getElementById('createChords');
        
        // Comprehensive Chord Families for the Library Creation
        const Families = [
            ["C", "D", "E", "F", "G", "A", "B", "Cm", "Dm", "Em", "Fm", "Gm", "Am", "Bm", "C#", "Eb", "F#", "Ab", "Bb"],
            ["C7", "D7", "E7", "F7", "G7", "A7", "B7", "Cmaj7", "Dmaj7", "Emaj7", "Fmaj7", "Gmaj7", "Amaj7", "Bmaj7", "Am7", "Em7", "Dm7", "Bm7", "F#m7"],
            ["Csus2", "Csus4", "Dsus2", "Dsus4", "Esus4", "Gsus4", "Asus4", "Cadd9", "Dadd9", "Eadd9", "Gadd9", "Aadd9", "C2", "D2", "G2", "A2"],
            ["C/E", "D/F#", "G/B", "A/C#", "C/G", "D/A", "E/G#", "Am/G", "Dm/C", "F/A", "Cdim", "Adim", "Gdim", "G/F", "C7/E"]
        ];

        function selectCreationFamily(index) {
            // Update UI
            const btns = document.querySelectorAll('#creationTabs .chord-root-btn');
            btns.forEach((b, i) => b.classList.toggle('selected', i === index));
            
            // Build Grid
            const grid = document.getElementById('creationGrid');
            grid.innerHTML = "";
            Families[index].forEach(c => {
                const btn = document.createElement('button');
                btn.type = "button";
                btn.className = "chord-root-btn";
                btn.textContent = c;
                btn.onclick = () => insertChord(c);
                grid.appendChild(btn);
            });
        }

        function insertChord(chord) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = textarea.value;
            const before = text.substring(0, start);
            const after = text.substring(end);
            
            // Auto-wrap in brackets
            const wrapped = `[${chord}]`;
            textarea.value = before + wrapped + after;
            
            // Restore focus and position cursor after the chord
            textarea.focus();
            const newPos = start + wrapped.length;
            textarea.setSelectionRange(newPos, newPos);
            
            // Subtle feedback
            textarea.classList.add('ring-2', 'ring-primary/30');
            setTimeout(() => textarea.classList.remove('ring-2', 'ring-primary/30'), 300);
        }

        // Initialize First Tab
        selectCreationFamily(0);
    </script>
</body>
</html>
