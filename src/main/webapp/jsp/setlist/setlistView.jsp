<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.worship.model.Setlist, com.worship.model.SetlistSong, java.util.List" %>
<!DOCTYPE html>
<html lang="en" class="light">
<head>
    <jsp:include page="/jsp/includes/head.jsp" />
    <% 
        Setlist s = (Setlist) request.getAttribute("setlist"); 
        if (s == null) { response.sendRedirect(request.getContextPath() + "/setlist/my"); return; }
    %>
    <title><%= s.getTitle() %> - Worship Song Library</title>
    <script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.2/Sortable.min.js"></script>
</head>
<body class="bg-surface text-on-surface font-manrope min-h-screen flex flex-col">

<jsp:include page="/jsp/navbar.jsp" />

<div class="flex-grow max-w-[1200px] mx-auto w-full px-4 py-8 md:py-12">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 pb-6 border-b border-surface-dim">
        <div>
            <a href="<%=request.getContextPath()%>/setlist/my" class="inline-flex items-center gap-1 text-primary font-bold mb-3 hover:underline text-decoration-none" style="text-decoration: none;">
                <span class="material-symbols-outlined text-sm">arrow_back</span> Back to Setlists
            </a>
            <div class="flex items-center gap-3 mb-1">
                <span class="bg-primary-container text-on-primary-container text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider"><%= s.getOccasion() %></span>
                <span class="text-slate-400 text-sm flex items-center gap-1"><span class="material-symbols-outlined text-sm">calendar_month</span> <%= s.getCreatedAt() %></span>
            </div>
            <h1 class="text-4xl md:text-5xl font-black tracking-tight text-on-surface uppercase font-headline"><%= s.getTitle() %></h1>
        </div>
        
        <div class="flex flex-wrap gap-3">
            <button onclick="addDivider()" class="inline-flex items-center gap-2 bg-tertiary-fixed text-on-tertiary-fixed px-5 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all border border-tertiary/20">
                <span class="material-symbols-outlined text-sm">horizontal_rule</span> Add Divider
            </button>
            <button onclick="openSearchModal()" class="inline-flex items-center gap-2 bg-gradient-to-br from-primary to-primary-container text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all">
                <span class="material-symbols-outlined text-sm">add</span> Add Song
            </button>
            <button onclick="generateShareLink()" class="inline-flex items-center gap-2 bg-surface-container text-on-surface px-5 py-2.5 rounded-xl font-bold hover:bg-surface-dim transition-colors border border-surface-dim">
                <span class="material-symbols-outlined text-sm">share</span> Share Link
            </button>
            <a href="<%=request.getContextPath()%>/setlist/<%=s.getId()%>/performance" class="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl font-bold hover:opacity-80 transition-all border border-black shadow-lg text-decoration-none" style="text-decoration: none;">
                <span class="material-symbols-outlined text-sm">play_arrow</span> Performance Mode
            </a>
            <% if (s.getShareToken() != null && !s.getShareToken().isEmpty()) { %>
            <a href="<%=request.getContextPath()%>/setlist/shared/<%=s.getShareToken()%>" target="_blank" class="inline-flex items-center gap-2 bg-surface-container text-on-surface px-5 py-2.5 rounded-xl font-bold hover:bg-surface-dim transition-colors border border-surface-dim text-decoration-none" style="text-decoration: none;">
                <span class="material-symbols-outlined text-sm">print</span> Print View
            </a>
            <% } %>
        </div>
    </div>

    <!-- Share Link Container -->
    <div id="shareLinkContainer" class="hidden mb-8 bg-success-container/30 border border-success/30 rounded-2xl p-4 flex items-center justify-between gap-4">
        <div class="flex-grow">
            <label class="text-xs font-bold text-success uppercase tracking-wider mb-1 block">Public Share Link</label>
            <input type="text" id="shareUrl" readonly class="w-full bg-white dark:bg-slate-900 border border-surface-dim rounded-lg px-3 py-2 text-sm text-on-surface outline-none">
        </div>
        <button onclick="copyShareLink()" class="mt-5 bg-success text-on-success px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity">Copy</button>
    </div>

    <!-- Songs List -->
    <div class="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div class="grid grid-cols-[40px_minmax(0,1fr)_120px_100px_40px] gap-4 p-4 border-b border-surface-dim bg-surface-container-low text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            <div class="text-center">#</div>
            <div>Song Title & Artist</div>
            <div>Key</div>
            <div>Capo</div>
            <div></div>
        </div>

        <div id="sortable-list" class="divide-y divide-surface-dim">
            <% 
                List<SetlistSong> songs = s.getSongs();
                if (songs == null || songs.isEmpty()) { 
            %>
                <div class="p-12 text-center text-on-surface-variant">No items in this setlist yet. Click "Add Song" or "Add Divider" to begin.</div>
            <% 
                } else {
                    int songCounter = 0;
                    for (SetlistSong ss : songs) {
                        if (ss.isHeader()) {
            %>
                <div class="song-row group flex items-center p-3 hover:bg-tertiary-container/10 transition-colors bg-tertiary-container/5 border-x-4 border-tertiary" data-id="<%=ss.getId()%>">
                    <div class="drag-handle w-[40px] text-center cursor-grab text-tertiary/40 hover:text-tertiary transition-colors flex justify-center">
                        <span class="material-symbols-outlined">drag_indicator</span>
                    </div>
                    <div class="flex-grow flex items-center px-4">
                        <textarea onkeyup="renameHeader(<%=ss.getId()%>, this.value)" class="w-full bg-transparent border-none focus:outline-none text-tertiary font-black uppercase text-center tracking-widest placeholder:text-tertiary/30 resize-none overflow-hidden py-1" rows="1" placeholder="Enter divider purpose..."><%=ss.getSongTitle()%></textarea>
                    </div>
                    <div class="w-[40px] flex justify-end pr-2">
                        <button onclick="removeSong(<%=ss.getId()%>)" class="text-slate-400 hover:text-error transition-colors p-1"><span class="material-symbols-outlined text-xl">close</span></button>
                    </div>
                </div>
            <%
                        } else {
                            songCounter++;
            %>
                <div class="song-row group flex items-center p-4 hover:bg-surface-container-low transition-colors bg-white dark:bg-slate-800" data-id="<%=ss.getId()%>">
                    <div class="drag-handle w-[40px] text-center cursor-grab text-slate-300 dark:text-slate-600 hover:text-primary transition-colors flex justify-center">
                        <span class="material-symbols-outlined">drag_indicator</span>
                    </div>
                    <div class="w-[40px] text-center font-bold text-outline-variant text-sm"><%=songCounter%></div>
                    <div class="flex-grow min-w-0 pr-4">
                        <span style="font-size:9px;font-weight:800;letter-spacing:0.12em;color:#9ca3af;text-transform:uppercase;display:block">#<%=ss.getSongNumber()%></span>
                        <a href="<%=request.getContextPath()%>/song?id=<%=ss.getSongId()%>" target="_blank" class="font-bold text-on-surface hover:text-primary transition-colors text-lg truncate block text-decoration-none" style="text-decoration: none;"><%=ss.getSongTitle()%></a>
                        <div class="text-on-surface-variant text-sm truncate"><%=ss.getSongArtist()%></div>
                    </div>
                    <div class="w-[120px] px-2">
                        <select onchange="updateSongKey(<%=ss.getId()%>)" id="key-<%=ss.getId()%>" class="w-full bg-surface-container border border-surface-dim rounded-lg px-2 py-1.5 text-sm font-bold text-on-surface outline-none focus:border-primary">
                            <% String skey = ss.getCreatorKey(); %>
                            <option value="C" <%= "C".equals(skey) ? "selected" : "" %>>C</option>
                            <option value="D" <%= "D".equals(skey) ? "selected" : "" %>>D</option>
                            <option value="E" <%= "E".equals(skey) ? "selected" : "" %>>E</option>
                            <option value="F" <%= "F".equals(skey) ? "selected" : "" %>>F</option>
                            <option value="G" <%= "G".equals(skey) ? "selected" : "" %>>G</option>
                            <option value="A" <%= "A".equals(skey) ? "selected" : "" %>>A</option>
                            <option value="B" <%= "B".equals(skey) ? "selected" : "" %>>B</option>
                        </select>
                    </div>
                    <div class="w-[100px] px-2">
                        <input type="number" min="0" max="11" id="capo-<%=ss.getId()%>" value="<%=ss.getCreatorCapo()%>" onchange="updateSongKey(<%=ss.getId()%>)" class="w-full bg-surface-container border border-surface-dim rounded-lg px-2 py-1.5 text-sm font-bold text-center text-on-surface outline-none focus:border-primary">
                    </div>
                    <div class="w-[40px] flex justify-end pr-2">
                        <button onclick="removeSong(<%=ss.getId()%>)" class="text-slate-400 hover:text-error transition-colors p-1"><span class="material-symbols-outlined text-xl">close</span></button>
                    </div>
                </div>
            <% 
                        }
                    }
                } 
            %>
        </div>
    </div>
</div>

<!-- Modal & Scripts same as before but using scriptlet for IDs -->
<div id="searchModal" class="hidden fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 flex flex-col max-h-[80vh]">
        <div class="p-6 border-b border-surface-dim flex justify-between items-center bg-surface-container-low rounded-t-3xl">
            <h2 class="text-2xl font-black uppercase font-headline">Add Song</h2>
            <button onclick="closeSearchModal()" class="text-on-surface-variant hover:text-on-surface"><span class="material-symbols-outlined">close</span></button>
        </div>
        <div class="p-6 border-b border-surface-dim">
            <div class="relative">
                <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                <input type="text" id="searchInput" placeholder="Search by title, artist..." class="w-full bg-surface border-2 border-surface-dim rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-primary font-medium" onkeyup="debounceSearch()">
            </div>
        </div>
        <div class="p-0 overflow-y-auto flex-grow" id="searchResults">
            <div class="p-6 text-center text-on-surface-variant">Type to search the library...</div>
        </div>
    </div>
</div>

<script>
    var setlistId = <%= s.getId() %>;
    var contextPath = '<%= request.getContextPath() %>';

    // Initialize Sortable
    document.addEventListener('DOMContentLoaded', function() {
        var el = document.getElementById('sortable-list');
        if (el && el.children.length > 0 && !el.innerText.includes("No songs added")) {
            Sortable.create(el, {
                handle: '.drag-handle',
                animation: 150,
                onEnd: function () { saveOrder(); }
            });
        }
    });

    function saveOrder() {
        var rows = document.querySelectorAll('.song-row');
        var orderedIds = [];
        for (var i = 0; i < rows.length; i++) {
            orderedIds.push(parseInt(rows[i].getAttribute('data-id')));
        }
        fetch(contextPath + '/setlist/' + setlistId + '/reorder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderedIds)
        });
    }

    function addDivider() {
        fetch(contextPath + '/setlist/' + setlistId + '/add-header', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'text=NEW DIVIDER&position=999'
        }).then(function() { window.location.reload(); });
    }

    var renameTimeout;
    function renameHeader(id, text) {
        clearTimeout(renameTimeout);
        renameTimeout = setTimeout(function() {
            fetch(contextPath + '/setlist/' + setlistId + '/rename-header', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'id=' + id + '&text=' + encodeURIComponent(text)
            });
        }, 500);
    }

    function updateSongKey(id) {
        var key = document.getElementById('key-' + id).value;
        var capo = document.getElementById('capo-' + id).value;
        fetch(contextPath + '/setlist/' + setlistId + '/key', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'id=' + id + '&key=' + encodeURIComponent(key) + '&capo=' + capo
        });
    }

    function removeSong(id) {
        if (!confirm('Remove this item?')) return;
        fetch(contextPath + '/setlist/' + setlistId + '/remove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'id=' + id
        }).then(function() { window.location.reload(); });
    }

    function generateShareLink() {
        fetch(contextPath + '/setlist/' + setlistId + '/share', { method: 'POST' })
        .then(function(r) { return r.json(); }).then(function(data) {
            if (data.success) {
                document.getElementById('shareLinkContainer').classList.remove('hidden');
                document.getElementById('shareUrl').value = data.url;
            }
        });
    }

    function copyShareLink() {
        var input = document.getElementById('shareUrl');
        input.select();
        document.execCommand('copy');
        alert('Copied!');
    }

    // Modal Search Logic
    var searchTimeout;
    function openSearchModal() { document.getElementById('searchModal').classList.remove('hidden'); }
    function closeSearchModal() { document.getElementById('searchModal').classList.add('hidden'); }
    function debounceSearch() { clearTimeout(searchTimeout); searchTimeout = setTimeout(performSearch, 300); }

    function performSearch() {
        var q = document.getElementById('searchInput').value;
        if (q.length < 2) return;
        fetch(contextPath + '/search?q=' + encodeURIComponent(q), { headers: { 'Accept': 'application/json' } })
        .then(function(r) { return r.json(); }).then(function(data) {
            var results = Array.isArray(data) ? data : (data.results || []);
            var container = document.getElementById('searchResults');
            container.innerHTML = '';
            for (var i = 0; i < results.length; i++) {
                var song = results[i];
                var div = document.createElement('div');
                div.className = 'p-4 border-b border-surface-dim hover:bg-surface-container-low cursor-pointer flex justify-between items-center';
                div.innerHTML = '<div><span style="font-size:9px;font-weight:800;letter-spacing:0.12em;color:#9ca3af;text-transform:uppercase">#' + (song.songNumber || '') + '</span><div class="font-bold">' + song.title + '</div><div class="text-sm text-slate-400">' + song.artist + '</div></div> <button class="bg-primary text-white p-2 rounded-lg">+</button>';
                (function(sid, skey) {
                    div.onclick = function() { addSong(sid, skey); };
                })(song.id, song.key || 'C');
                container.appendChild(div);
            }
        });
    }

    function addSong(songId, defaultKey) {
        fetch(contextPath + '/setlist/' + setlistId + '/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'songId=' + songId + '&position=999&creatorKey=' + encodeURIComponent(defaultKey) + '&creatorCapo=0'
        }).then(function() { window.location.reload(); });
    }
</script>

</body>
</html>
