<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html class="light" lang="en">
<head>
    <title>Leaflet Builder — Worship Song Library</title>
    <jsp:include page="/jsp/includes/head.jsp"/>
    <style>
        .selected-occasion {
            border-color: var(--color-primary);
            background-color: var(--color-primary-container);
            color: var(--color-on-primary-container);
            box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.2);
        }
        .drag-handle {
            cursor: grab;
            color: var(--color-outline);
            padding: 4px;
        }
        .drag-handle:active {
            cursor: grabbing;
        }
        #leafletSongList li {
            touch-action: none; /* Prevent scrolling during drag on touch devices */
        }
    </style>
</head>
<body class="bg-surface font-body text-on-surface flex flex-col min-h-screen">
    <jsp:include page="/jsp/navbar.jsp"/>

    <main class="flex-grow max-w-[1920px] mx-auto w-full px-6 md:px-24 py-12 max-w-5xl">
        <h1 class="text-3xl font-headline font-extrabold tracking-tight text-on-surface mb-8 pb-4 border-b border-surface-dim">Build a Custom Leaflet</h1>

        <!-- Step 1: Occasion Picker -->
        <div id="step1" class="mb-12">
            <h2 class="text-xl font-headline font-bold text-on-surface mb-6 flex items-center gap-2">
                <span class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">1</span> 
                Choose an Occasion
            </h2>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div class="occasion-card cursor-pointer bg-surface-container p-4 rounded-2xl border border-surface-dim hover:border-primary/40 transition-all flex flex-col items-center justify-center text-center gap-2 h-32" data-occasion="1" data-name="Sunday Worship" data-hashtags="praise,worship,adoration,thanksgiving,offertory" onclick="selectOccasion(this)">
                    <span class="text-4xl text-on-surface-variant">&#x26EA;</span>
                    <span class="font-bold text-sm text-on-surface">Sunday Worship</span>
                </div>
                <div class="occasion-card cursor-pointer bg-surface-container p-4 rounded-2xl border border-surface-dim hover:border-primary/40 transition-all flex flex-col items-center justify-center text-center gap-2 h-32" data-occasion="2" data-name="Wedding" data-hashtags="wedding,love,covenant,praise,blessing" onclick="selectOccasion(this)">
                    <span class="text-4xl text-on-surface-variant">&#x1F492;</span>
                    <span class="font-bold text-sm text-on-surface">Wedding</span>
                </div>
                <div class="occasion-card cursor-pointer bg-surface-container p-4 rounded-2xl border border-surface-dim hover:border-primary/40 transition-all flex flex-col items-center justify-center text-center gap-2 h-32" data-occasion="3" data-name="House Dedication" data-hashtags="dedication,blessing,protection,praise,thanksgiving" onclick="selectOccasion(this)">
                    <span class="text-4xl text-on-surface-variant">&#x1F3E0;</span>
                    <span class="font-bold text-sm text-on-surface">House Dedication</span>
                </div>
                <div class="occasion-card cursor-pointer bg-surface-container p-4 rounded-2xl border border-surface-dim hover:border-primary/40 transition-all flex flex-col items-center justify-center text-center gap-2 h-32" data-occasion="4" data-name="Baby Dedication" data-hashtags="dedication,children,blessing,thanksgiving,praise" onclick="selectOccasion(this)">
                    <span class="text-4xl text-on-surface-variant">&#x1F476;</span>
                    <span class="font-bold text-sm text-on-surface">Baby Dedication</span>
                </div>
                <div class="occasion-card cursor-pointer bg-surface-container p-4 rounded-2xl border border-surface-dim hover:border-primary/40 transition-all flex flex-col items-center justify-center text-center gap-2 h-32" data-occasion="5" data-name="Housewarming" data-hashtags="housewarming,blessing,thanksgiving,fellowship,praise" onclick="selectOccasion(this)">
                    <span class="text-4xl text-on-surface-variant">&#x1F3E1;</span>
                    <span class="font-bold text-sm text-on-surface">Housewarming</span>
                </div>
                
                <div class="occasion-card cursor-pointer bg-surface-container p-4 rounded-2xl border border-surface-dim hover:border-primary/40 transition-all flex flex-col items-center justify-center text-center gap-2 h-32" data-occasion="6" data-name="House Meeting" data-hashtags="fellowship,prayer,devotional,worship,intercession" onclick="selectOccasion(this)">
                    <span class="text-4xl text-on-surface-variant">&#x1F91D;</span>
                    <span class="font-bold text-sm text-on-surface">House Meeting</span>
                </div>
                <div class="occasion-card cursor-pointer bg-surface-container p-4 rounded-2xl border border-surface-dim hover:border-primary/40 transition-all flex flex-col items-center justify-center text-center gap-2 h-32" data-occasion="7" data-name="Christmas" data-hashtags="christmas,nativity,advent,praise,joy" onclick="selectOccasion(this)">
                    <span class="text-4xl text-on-surface-variant">&#x1F384;</span>
                    <span class="font-bold text-sm text-on-surface">Christmas</span>
                </div>
                <div class="occasion-card cursor-pointer bg-surface-container p-4 rounded-2xl border border-surface-dim hover:border-primary/40 transition-all flex flex-col items-center justify-center text-center gap-2 h-32" data-occasion="8" data-name="Funeral" data-hashtags="funeral,comfort,hope,eternallife,peace" onclick="selectOccasion(this)">
                    <span class="text-4xl text-on-surface-variant">&#x1F54A;</span>
                    <span class="font-bold text-sm text-on-surface">Funeral</span>
                </div>
                <div class="occasion-card cursor-pointer bg-surface-container p-4 rounded-2xl border border-surface-dim hover:border-primary/40 transition-all flex flex-col items-center justify-center text-center gap-2 h-32" data-occasion="9" data-name="Easter" data-hashtags="easter,resurrection,cross,goodfriday,victory" onclick="selectOccasion(this)">
                    <span class="text-4xl text-on-surface-variant">&#x271D;</span>
                    <span class="font-bold text-sm text-on-surface">Easter</span>
                </div>
                <div class="occasion-card cursor-pointer bg-surface-container p-4 rounded-2xl border border-surface-dim hover:border-primary/40 transition-all flex flex-col items-center justify-center text-center gap-2 h-32" data-occasion="10" data-name="Youth" data-hashtags="youth,contemporary,worship,upbeat,praise" onclick="selectOccasion(this)">
                    <span class="text-4xl text-on-surface-variant">&#x1F3B8;</span>
                    <span class="font-bold text-sm text-on-surface">Youth</span>
                </div>
                
                <div class="occasion-card cursor-pointer bg-surface-container p-4 rounded-2xl border border-surface-dim hover:border-primary/40 transition-all flex flex-col items-center justify-center text-center gap-2 h-32" data-occasion="11" data-name="Harvest Festival" data-hashtags="harvest,thanksgiving,abundance,praise,firstfruits,provision" onclick="selectOccasion(this)">
                    <span class="text-4xl text-on-surface-variant">&#x1F33E;</span>
                    <span class="font-bold text-sm text-on-surface">Harvest Festival</span>
                </div>
                <div class="occasion-card cursor-pointer bg-surface-container p-4 rounded-2xl border border-surface-dim hover:border-primary/40 transition-all flex flex-col items-center justify-center text-center gap-2 h-32" data-occasion="12" data-name="New Year" data-hashtags="newyear,hope,renewal,thanksgiving,faith,newbeginning" onclick="selectOccasion(this)">
                    <span class="text-4xl text-on-surface-variant">&#x1F386;</span>
                    <span class="font-bold text-sm text-on-surface">New Year</span>
                </div>
                <div class="occasion-card cursor-pointer bg-surface-container p-4 rounded-2xl border border-surface-dim hover:border-primary/40 transition-all flex flex-col items-center justify-center text-center gap-2 h-32" data-occasion="13" data-name="Watchnight" data-hashtags="watchnight,prayer,intercession,worship,newyear,vigil" onclick="selectOccasion(this)">
                    <span class="text-4xl text-on-surface-variant">&#x1F319;</span>
                    <span class="font-bold text-sm text-on-surface">Watchnight</span>
                </div>
                <div class="occasion-card cursor-pointer bg-surface-container p-4 rounded-2xl border border-surface-dim hover:border-primary/40 transition-all flex flex-col items-center justify-center text-center gap-2 h-32" data-occasion="14" data-name="Convention" data-hashtags="convention,conference,worship,praise,teaching,unity" onclick="selectOccasion(this)">
                    <span class="text-4xl text-on-surface-variant">&#x1F3DB;</span>
                    <span class="font-bold text-sm text-on-surface">Convention</span>
                </div>
                <div class="occasion-card cursor-pointer bg-surface-container p-4 rounded-2xl border border-surface-dim hover:border-primary/40 transition-all flex flex-col items-center justify-center text-center gap-2 h-32" data-occasion="15" data-name="Revival Meeting" data-hashtags="revival,evangelism,healing,worship,salvation,outreach" onclick="selectOccasion(this)">
                    <span class="text-4xl text-on-surface-variant">&#x1F525;</span>
                    <span class="font-bold text-sm text-on-surface">Revival Meeting</span>
                </div>
            </div>
        </div>

        <!-- Step 2: Header Fields (shown after occasion selected) -->
        <div id="step2" class="hidden mb-12">
            <h2 class="text-xl font-headline font-bold text-on-surface mb-6 flex items-center gap-2">
                <span class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">2</span> 
                Event Details <span class="bg-surface-container text-primary text-xs px-2 py-1 rounded ml-2" id="eventBadge"></span>
            </h2>
            <div class="bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-surface-dim" id="headerFields">
                <!-- Dynamic fields injected by JS -->
            </div>
        </div>

        <!-- Step 3: Song Suggestions -->
        <div id="step3" class="hidden mb-12">
            <h2 class="text-xl font-headline font-bold text-on-surface mb-6 flex items-center gap-2">
                <span class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">3</span> 
                Suggested Songs
            </h2>
            <div id="suggestions" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <!-- AJAX populated -->
            </div>
        </div>

        <!-- Step 4: Search and Add -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div id="step4" class="hidden">
                <h2 class="text-xl font-headline font-bold text-on-surface mb-6 flex items-center gap-2">
                    <span class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">4</span> 
                    Search & Add
                </h2>
                <div class="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-surface-dim">
                    <div class="relative w-full mb-4">
                        <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant text-[24px]">search</span>
                        <input type="text" id="leafletSearchInput" placeholder="Search songs..." autocomplete="off"
                               class="w-full pl-12 pr-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-2xl text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none font-medium placeholder:text-outline-variant/70 shadow-sm">
                    </div>
                    <div id="leafletSearchResults" class="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar"></div>
                </div>
            </div>

            <!-- Step 5: Song List -->
            <div id="step5" class="hidden">
                <h2 class="text-xl font-headline font-bold text-on-surface mb-6 flex items-center gap-2">
                    <span class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">5</span> 
                    Leaflet Order
                </h2>
                <div class="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-surface-dim">
                    <div id="emptyMessage" class="text-center py-8 bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/50">
                        <span class="material-symbols-outlined text-4xl text-outline mb-2">library_music</span>
                        <p class="text-on-surface font-semibold text-sm">No songs added yet.</p>
                        <p class="text-outline text-xs mt-1 px-4">Select from suggestions or search to add them to your leaflet.</p>
                    </div>
                    
                    <ul id="leafletSongList" class="space-y-3">
                        <!-- Drag and drop items injected by JS -->
                    </ul>
                </div>
            </div>
        </div>

        <!-- Step 6: Save -->
        <div id="step6" class="hidden pb-12">
            <div class="flex justify-end pt-6 border-t border-surface-dim">
                <button onclick="saveLeaflet()" class="px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary-container transition-all flex items-center gap-2 text-lg">
                    <span class="material-symbols-outlined text-[24px]">print</span>
                    Generate PDF Leaflet
                </button>
            </div>
        </div>
    </main>

    <script>
        var contextPath = '${pageContext.request.contextPath}';
        var selectedOccasion = null;
        var leafletSongs = [];

        function selectOccasion(el) {
            document.querySelectorAll('.occasion-card').forEach(function(c) {
                c.classList.remove('selected-occasion');
            });
            el.classList.add('selected-occasion');

            selectedOccasion = {
                id: el.dataset.occasion,
                name: el.dataset.name,
                hashtags: el.dataset.hashtags
            };

            document.getElementById('eventBadge').innerText = selectedOccasion.name;

            showStep2(selectedOccasion.name);
            showStep3(selectedOccasion.hashtags);
            document.getElementById('step4').classList.remove('hidden');
            document.getElementById('step5').classList.remove('hidden');
            document.getElementById('step6').classList.remove('hidden');
            
            // Highlight step 2
            document.getElementById('step2').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        function showStep2(occasionName) {
            var fields = document.getElementById('headerFields');
            var html = '';
            
            var inputClass = "w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none font-medium";
            var labelClass = "block text-sm font-bold text-on-surface mb-2";

            if (occasionName === 'Wedding') {
                html = '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">' +
                       '<div class="md:col-span-1 lg:col-span-2"><label class="' + labelClass + '">Bride Name</label><input type="text" class="' + inputClass + '" id="h_bride" placeholder="Bride name"></div>' +
                       '<div class="md:col-span-1 lg:col-span-2"><label class="' + labelClass + '">Groom Name</label><input type="text" class="' + inputClass + '" id="h_groom" placeholder="Groom name"></div>' +
                       '<div><label class="' + labelClass + '">Date</label><input type="date" class="' + inputClass + '" id="h_date"></div>' +
                       '<div class="lg:col-span-2"><label class="' + labelClass + '">Venue</label><input type="text" class="' + inputClass + '" id="h_venue"></div>' +
                       '<div><label class="' + labelClass + '">Church Name</label><input type="text" class="' + inputClass + '" id="h_church"></div>' +
                       '</div>';
            } else if (occasionName === 'Funeral') {
                html = '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">' +
                       '<div class="lg:col-span-2"><label class="' + labelClass + '">Departed Name</label><input type="text" class="' + inputClass + '" id="h_departed"></div>' +
                       '<div><label class="' + labelClass + '">D.O.B</label><input type="date" class="' + inputClass + '" id="h_dob" title="Date of Birth"></div>' +
                       '<div><label class="' + labelClass + '">Passed</label><input type="date" class="' + inputClass + '" id="h_dod" title="Date of Passing"></div>' +
                       '<div><label class="' + labelClass + '">Service Date</label><input type="date" class="' + inputClass + '" id="h_date"></div>' +
                       '<div class="lg:col-span-3"><label class="' + labelClass + '">Church Name</label><input type="text" class="' + inputClass + '" id="h_church"></div>' +
                       '</div>';
            } else if (occasionName === 'Baby Dedication') {
                html = '<div class="grid grid-cols-1 md:grid-cols-3 gap-6">' +
                       '<div><label class="' + labelClass + '">Baby Name</label><input type="text" class="' + inputClass + '" id="h_baby"></div>' +
                       '<div><label class="' + labelClass + '">Father Name</label><input type="text" class="' + inputClass + '" id="h_father"></div>' +
                       '<div><label class="' + labelClass + '">Mother Name</label><input type="text" class="' + inputClass + '" id="h_mother"></div>' +
                       '<div><label class="' + labelClass + '">Date of Birth</label><input type="date" class="' + inputClass + '" id="h_dob"></div>' +
                       '<div><label class="' + labelClass + '">Dedication Date</label><input type="date" class="' + inputClass + '" id="h_date"></div>' +
                       '<div><label class="' + labelClass + '">Church Name</label><input type="text" class="' + inputClass + '" id="h_church"></div>' +
                       '</div>';
            } else {
                html = '<div class="grid grid-cols-1 md:grid-cols-3 gap-6">' +
                       '<div><label class="' + labelClass + '">Title/Theme</label><input type="text" class="' + inputClass + '" id="h_title"></div>' +
                       '<div><label class="' + labelClass + '">Date</label><input type="date" class="' + inputClass + '" id="h_date"></div>' +
                       '<div><label class="' + labelClass + '">Church Name</label><input type="text" class="' + inputClass + '" id="h_church"></div>' +
                       '</div>';
            }

            fields.innerHTML = html;
            document.getElementById('step2').classList.remove('hidden');
        }

        function showStep3(hashtags) {
            var url = contextPath + '/leaflet/suggestions';
            fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'hashtags=' + hashtags
            })
            .then(function(r) { return r.json(); })
            .then(function(songs) {
                var container = document.getElementById('suggestions');
                if (songs.length === 0) {
                    container.innerHTML = '<div class="col-span-full p-6 text-center text-outline-variant font-medium bg-surface-container rounded-2xl border border-dashed border-outline-variant/30">No specific song suggestions found for this occasion. You can search below to add songs manually.</div>';
                } else {
                    container.innerHTML = songs.map(function(s) {
                        var safeTitle = (s.title || '').replace(/'/g, "\\'");
                        return '<div class="bg-surface-container p-4 rounded-2xl border border-surface-dim hover:border-primary/30 transition-all flex justify-between items-center group">'
                            + '<div class="overflow-hidden pr-2">'
                            + '<div class="font-headline font-bold text-on-surface truncate cursor-pointer group-hover:text-primary transition-colors" onclick="window.open(\'' + contextPath + '/song?id=' + s.id + '\', \'_blank\')" title="Preview ' + safeTitle + '">' + s.title + '</div>'
                            + '<div class="text-xs text-on-surface-variant truncate">' + (s.artist || 'Traditional') + '</div>'
                            + '</div>'
                            + '<button class="p-2 text-primary hover:bg-primary hover:text-white rounded-lg transition-colors flex items-center justify-center shrink-0 border border-transparent hover:border-primary group-hover:bg-primary-container" onclick="addSongToLeaflet(' + s.id + ', \'' + safeTitle + '\')" title="Add to Leaflet">'
                            + '<span class="material-symbols-outlined text-[18px]">add</span>'
                            + '</button>'
                            + '</div>';
                    }).join('');
                }
                document.getElementById('step3').classList.remove('hidden');
            });
        }

        function addSongToLeaflet(id, title) {
            if (leafletSongs.find(function(s) { return s.id === id; })) return;
            leafletSongs.push({ id: id, title: title });
            renderLeafletSongs();
        }

        function removeSongFromLeaflet(id) {
            leafletSongs = leafletSongs.filter(function(s) { return s.id !== id; });
            renderLeafletSongs();
        }

        function renderLeafletSongs() {
            var list = document.getElementById('leafletSongList');
            var msg = document.getElementById('emptyMessage');

            if (leafletSongs.length === 0) {
                list.innerHTML = '';
                msg.classList.remove('hidden');
                return;
            }

            msg.classList.add('hidden');
            list.innerHTML = leafletSongs.map(function(s, i) {
                return '<li class="bg-surface-container p-3 rounded-xl border border-surface-dim hover:border-primary/40 transition-all flex items-center justify-between gap-3 group leaflet-song-item" draggable="true" data-id="' + s.id + '">'
                    + '<div class="flex items-center gap-3 overflow-hidden">'
                    + '<span class="drag-handle material-symbols-outlined text-outline group-hover:text-primary text-[20px]">drag_indicator</span>'
                    + '<span class="w-6 h-6 rounded bg-surface-container-highest text-on-surface text-[10px] font-bold flex items-center justify-center shrink-0 border border-outline-variant/30">' + (i + 1) + '</span>'
                    + '<span class="font-bold text-on-surface text-sm truncate">' + s.title + '</span>'
                    + '</div>'
                    + '<button class="p-1.5 text-outline hover:text-error hover:bg-error-container rounded transition-colors shrink-0 flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100" onclick="removeSongFromLeaflet(' + s.id + ')" title="Remove">'
                    + '<span class="material-symbols-outlined text-[18px]">close</span>'
                    + '</button>'
                    + '</li>';
            }).join('');

            initDragDrop('leafletSongList');
        }

        /* --- Drag and Drop Logic --- */
        var dragSrcEl = null;

        function initDragDrop(listId) {
            var items = document.querySelectorAll('#' + listId + ' .leaflet-song-item');
            items.forEach(function(item) {
                item.addEventListener('dragstart', handleDragStart, false);
                item.addEventListener('dragenter', handleDragEnter, false);
                item.addEventListener('dragover', handleDragOver, false);
                item.addEventListener('dragleave', handleDragLeave, false);
                item.addEventListener('drop', handleDrop, false);
                item.addEventListener('dragend', handleDragEnd, false);
            });
        }

        function handleDragStart(e) {
            dragSrcEl = this;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', this.dataset.id); // For Firefox
            this.style.opacity = '0.5';
        }

        function handleDragOver(e) {
            if (e.preventDefault) { e.preventDefault(); }
            e.dataTransfer.dropEffect = 'move';
            return false;
        }

        function handleDragEnter(e) {
            this.classList.add('border-primary');
            this.classList.add('bg-primary-container/30');
            this.classList.add('scale-[1.02]');
        }

        function handleDragLeave(e) {
            this.classList.remove('border-primary');
            this.classList.remove('bg-primary-container/30');
            this.classList.remove('scale-[1.02]');
        }

        function handleDrop(e) {
            if (e.stopPropagation) { e.stopPropagation(); }
            if (dragSrcEl != this) {
                var list = document.getElementById('leafletSongList');
                var nodes = Array.prototype.slice.call(list.children);
                var sourceIndex = nodes.indexOf(dragSrcEl);
                var targetIndex = nodes.indexOf(this);
                
                // Reorder the backing array
                var movedItem = leafletSongs.splice(sourceIndex, 1)[0];
                leafletSongs.splice(targetIndex, 0, movedItem);
                
                // Re-render completely applies the new state
                renderLeafletSongs();
            }
            return false;
        }

        function handleDragEnd(e) {
            this.style.opacity = '1';
            var items = document.querySelectorAll('#leafletSongList .leaflet-song-item');
            items.forEach(function(item) {
                item.classList.remove('border-primary');
                item.classList.remove('bg-primary-container/30');
                item.classList.remove('scale-[1.02]');
            });
        }

        function saveLeaflet() {
            if (!selectedOccasion || leafletSongs.length === 0) {
                alert('Please select an occasion and add songs.');
                return;
            }

            // Client side validation for required fields
            if(selectedOccasion.name === 'Wedding') {
                if(!document.getElementById('h_bride').value || !document.getElementById('h_groom').value) {
                    alert('Please enter Bride and Groom names to continue building the leaflet.');
                    return;
                }
            } else {
                var titleEl = document.getElementById('h_title');
                 if(titleEl && !titleEl.value) {
                    alert('Please enter a Title/Theme for the leaflet.');
                    return;
                }
            }

            var form = document.createElement('form');
            form.method = 'POST';
            form.action = contextPath + '/leaflet/save';
            form.target = '_blank'; // Open the leaflet in a new tab

            // Read the dynamic header data directly into JSON
            var headerMap = {};
            var inputs = document.getElementById('headerFields').querySelectorAll('input');
            inputs.forEach(function(inp) {
                var key = inp.id.replace('h_', ''); // clean id
                headerMap[key] = inp.value;
            });
            var jsonHeaderData = JSON.stringify(headerMap);

            var leafletTitle = selectedOccasion.name + ' Leaflet';
            if (headerMap.title) leafletTitle = headerMap.title;
            else if (headerMap.bride && headerMap.groom) leafletTitle = headerMap.bride + " & " + headerMap.groom;
            else if (headerMap.departed) leafletTitle = headerMap.departed;
            else if (headerMap.baby) leafletTitle = headerMap.baby;

            var fieldData = {
                occasionId: selectedOccasion.id,
                title: leafletTitle,
                headerData: jsonHeaderData,
                printType: 'lyrics' // Defaulting to lyrics view print
            };

            for (var k in fieldData) {
                var input = document.createElement('input');
                input.type = 'hidden';
                input.name = k;
                input.value = fieldData[k];
                form.appendChild(input);
            }

            leafletSongs.forEach(function(s) {
                var input = document.createElement('input');
                input.type = 'hidden';
                input.name = 'songIds';
                input.value = s.id;
                form.appendChild(input);
            });

            document.body.appendChild(form);
            form.submit();
        }
    </script>
    <style>
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: var(--color-outline-variant); border-radius: 20px; border: 3px solid transparent; background-clip: content-box; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: var(--color-outline); }
        
        #leafletSearchResults .song-card {
            background-color: transparent !important;
            box-shadow: none !important;
            padding: 8px 12px;
            border-radius: 8px;
            border: 1px solid var(--color-surface-dim);
            margin-bottom: 8px;
            transition: all 0.2s;
        }
        #leafletSearchResults .song-card:hover {
            border-color: var(--color-primary);
            background-color: var(--color-primary-container) !important;
        }
    </style>
    <script src="${pageContext.request.contextPath}/js/app.js"></script>
</body>
</html>
