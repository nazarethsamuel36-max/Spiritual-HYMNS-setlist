<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html class="light" lang="en">
<head>
    <title>Song Library — Worship Song Library</title>
    <jsp:include page="/jsp/includes/head.jsp"/>
    <style>
        /* CHANGE 6: Page background transparent */
        main { background: transparent !important; }

        /* CHANGE 3: Song cards — glass with sharp highlights */
        .song-card {
            background: rgba(255, 255, 255, 0.25) !important;
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border: 0.5px solid rgba(255, 255, 255, 0.5) !important;
            border-radius: 14px !important;
            position: relative;
            overflow: hidden;
            box-shadow: none !important;
            transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .song-card:hover {
            background: rgba(255, 255, 255, 0.38) !important;
            transform: translateY(-3px);
            border-color: rgba(255, 255, 255, 0.7) !important;
        }

        /* SHARP HIGHLIGHT — top edge (light catching) */
        .song-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.95), transparent);
            pointer-events: none;
            z-index: 2;
        }

        /* SHARP HIGHLIGHT — left edge (light catching) */
        .song-card::after {
            content: '';
            position: absolute;
            top: 0; left: 0;
            width: 1px;
            height: 55%;
            background: linear-gradient(180deg, rgba(255,255,255,0.9), transparent);
            pointer-events: none;
            z-index: 2;
        }

        .song-card > * {
            position: relative;
            z-index: 1;
        }

        /* CHANGE 4: Text readability */
        .song-card h2 { color: #1a1a2e !important; font-weight: 600; }
        .song-card p[class*="uppercase"] { color: #4a5080 !important; font-weight: 600; font-size: 11px; letter-spacing: 0.05em; }

        /* Song number badge */
        .song-number-badge {
            display: inline-block;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: #6b7280;
            margin-bottom: 4px;
        }

        /* Header section glass */
        .surface-mist {
            background: rgba(255, 255, 255, 0.14) !important;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 0.5px solid rgba(255, 255, 255, 0.35) !important;
        }

        .search-input {
            background: rgba(255, 255, 255, 0.3);
            border: 0.5px solid rgba(26, 26, 46, 0.15);
        }
    </style>
</head>
<body class="font-body text-on-surface flex min-h-screen flex-col">
    <jsp:include page="/jsp/navbar.jsp"/>

    <main class="relative z-10 mx-auto w-full max-w-[1920px] flex-grow px-4 py-6 md:px-8 md:py-8">
        <!-- Header & Search -->
        <div class="surface-mist relative z-20 mb-5 flex flex-col gap-4 rounded-2xl p-4 lg:flex-row lg:items-end lg:justify-between">
            <div class="flex-grow">
                <h1 class="text-3xl font-headline font-extrabold tracking-tight text-on-surface mb-1 md:text-4xl">Song Library</h1>
                <p class="text-on-surface-variant text-base font-medium md:text-lg">Browse and transpose songs for your worship service.</p>
            </div>
            
            <div class="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-max">
                <c:if test="${not empty sessionScope.username}">
                    <a href="${pageContext.request.contextPath}/song/add" class="flex min-h-10 items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-black uppercase tracking-widest text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary-container text-decoration-none" style="text-decoration: none;">
                        <span class="material-symbols-outlined">add</span>
                        Add New Song
                    </a>
                </c:if>

                <div class="w-full lg:w-96">
                    <!-- Live Search Bar -->
                    <form action="${pageContext.request.contextPath}/search" method="get" class="relative group">
                        <button type="submit" class="absolute left-4 top-1/2 -translate-y-1/2 text-outline/60 text-xl font-bold border-none bg-transparent cursor-pointer p-0 flex items-center justify-center z-10 hover:text-primary transition-colors focus:outline-none">
                            <span class="material-symbols-outlined">search</span>
                        </button>
                        <input name="q" class="search-input ui-input-solid w-full rounded-xl pl-12 pr-4 py-3 text-md font-medium shadow-sm focus:border-primary focus:ring-2 focus:ring-primary" placeholder="Search by title, artist, or lyrics..." type="text" value="${searchQuery}"/>
                    </form>
                </div>
            </div>
        </div>

        <!-- Filter & Sort Header -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
            <!-- Filter Pills & Key Dropdown -->
            <div class="surface-mist flex flex-wrap items-center gap-3 rounded-2xl p-3 text-sm font-semibold tracking-wide">
                <div class="flex flex-wrap gap-2 items-center">
                    <span class="text-outline uppercase text-xs tracking-[0.18em] mr-2">Library:</span>
                    <a href="${pageContext.request.contextPath}/songs" class="px-4 py-2 rounded-full cursor-pointer transition-colors ${empty filter && empty filterHashtag && empty filterLanguage ? 'bg-primary text-white shadow-sm' : 'ui-pill-solid'} text-decoration-none" style="text-decoration: none;">All Master</a>
                    <c:if test="${not empty sessionScope.username}">
                        <a href="${pageContext.request.contextPath}/songs?filter=personal" class="px-4 py-2 rounded-full cursor-pointer transition-colors ${filter == 'personal' ? 'bg-primary text-white shadow-sm' : 'ui-pill-solid'} text-decoration-none" style="text-decoration: none;">My Additions</a>
                    </c:if>
                    <a href="${pageContext.request.contextPath}/songs?language=english" class="px-4 py-2 rounded-full cursor-pointer transition-colors ${param.language == 'english' ? 'bg-primary text-white shadow-sm' : 'ui-pill-solid'} text-decoration-none" style="text-decoration: none;">English</a>
                    <a href="${pageContext.request.contextPath}/songs?language=hindi" class="px-4 py-2 rounded-full cursor-pointer transition-colors ${param.language == 'hindi' ? 'bg-primary text-white shadow-sm' : 'ui-pill-solid'} text-decoration-none" style="text-decoration: none;">Hindi</a>
                    <a href="${pageContext.request.contextPath}/songs?language=marathi" class="px-4 py-2 rounded-full cursor-pointer transition-colors ${param.language == 'marathi' ? 'bg-primary text-white shadow-sm' : 'ui-pill-solid'} text-decoration-none" style="text-decoration: none;">Marathi</a>
                </div>

                <!-- Key Dropdown -->
                <div class="flex items-center gap-2 relative">
                    <span class="text-outline uppercase text-xs tracking-[0.18em]">Key:</span>
                    <details class="group relative">
                        <summary class="surface-mist list-none flex min-w-[116px] items-center justify-between gap-2 rounded-xl px-4 py-2 text-on-surface-variant cursor-pointer transition-colors hover:bg-white">
                            <span class="text-sm font-bold">
                                <c:choose>
                                    <c:when test="${not empty param.key}">${param.key}</c:when>
                                    <c:otherwise>All Keys</c:otherwise>
                                </c:choose>
                            </span>
                            <span class="material-symbols-outlined text-base transition-transform group-open:rotate-180">expand_more</span>
                        </summary>
                        <div class="ui-menu-solid absolute top-full left-0 z-30 mt-2 w-64 rounded-2xl p-3">
                            <a href="${pageContext.request.contextPath}/songs" class="block rounded-xl px-3 py-2 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low text-decoration-none" style="text-decoration: none;">All Keys</a>
                            <div class="px-3 pt-3 pb-2 text-[11px] font-black uppercase tracking-[0.18em] text-outline">Major Keys</div>
                            <div class="grid grid-cols-2 gap-1">
                                <a href="${pageContext.request.contextPath}/songs?key=C" class="px-3 py-2 rounded-xl text-sm ${param.key == 'C' ? 'bg-primary text-white' : 'text-on-surface hover:bg-surface-container-low'} text-decoration-none" style="text-decoration: none;">C Major</a>
                                <a href="${pageContext.request.contextPath}/songs?key=C#" class="px-3 py-2 rounded-xl text-sm ${param.key == 'C#' ? 'bg-primary text-white' : 'text-on-surface hover:bg-surface-container-low'} text-decoration-none" style="text-decoration: none;">C# / Db</a>
                                <a href="${pageContext.request.contextPath}/songs?key=D" class="px-3 py-2 rounded-xl text-sm ${param.key == 'D' ? 'bg-primary text-white' : 'text-on-surface hover:bg-surface-container-low'} text-decoration-none" style="text-decoration: none;">D Major</a>
                                <a href="${pageContext.request.contextPath}/songs?key=Eb" class="px-3 py-2 rounded-xl text-sm ${param.key == 'Eb' ? 'bg-primary text-white' : 'text-on-surface hover:bg-surface-container-low'} text-decoration-none" style="text-decoration: none;">D# / Eb</a>
                                <a href="${pageContext.request.contextPath}/songs?key=E" class="px-3 py-2 rounded-xl text-sm ${param.key == 'E' ? 'bg-primary text-white' : 'text-on-surface hover:bg-surface-container-low'} text-decoration-none" style="text-decoration: none;">E Major</a>
                                <a href="${pageContext.request.contextPath}/songs?key=F" class="px-3 py-2 rounded-xl text-sm ${param.key == 'F' ? 'bg-primary text-white' : 'text-on-surface hover:bg-surface-container-low'} text-decoration-none" style="text-decoration: none;">F Major</a>
                                <a href="${pageContext.request.contextPath}/songs?key=F#" class="px-3 py-2 rounded-xl text-sm ${param.key == 'F#' ? 'bg-primary text-white' : 'text-on-surface hover:bg-surface-container-low'} text-decoration-none" style="text-decoration: none;">F# / Gb</a>
                                <a href="${pageContext.request.contextPath}/songs?key=G" class="px-3 py-2 rounded-xl text-sm ${param.key == 'G' ? 'bg-primary text-white' : 'text-on-surface hover:bg-surface-container-low'} text-decoration-none" style="text-decoration: none;">G Major</a>
                                <a href="${pageContext.request.contextPath}/songs?key=Ab" class="px-3 py-2 rounded-xl text-sm ${param.key == 'Ab' ? 'bg-primary text-white' : 'text-on-surface hover:bg-surface-container-low'} text-decoration-none" style="text-decoration: none;">G# / Ab</a>
                                <a href="${pageContext.request.contextPath}/songs?key=A" class="px-3 py-2 rounded-xl text-sm ${param.key == 'A' ? 'bg-primary text-white' : 'text-on-surface hover:bg-surface-container-low'} text-decoration-none" style="text-decoration: none;">A Major</a>
                                <a href="${pageContext.request.contextPath}/songs?key=Bb" class="px-3 py-2 rounded-xl text-sm ${param.key == 'Bb' ? 'bg-primary text-white' : 'text-on-surface hover:bg-surface-container-low'} text-decoration-none" style="text-decoration: none;">A# / Bb</a>
                                <a href="${pageContext.request.contextPath}/songs?key=B" class="px-3 py-2 rounded-xl text-sm ${param.key == 'B' ? 'bg-primary text-white' : 'text-on-surface hover:bg-surface-container-low'} text-decoration-none" style="text-decoration: none;">B Major</a>
                            </div>
                            <div class="px-3 pt-4 pb-2 text-[11px] font-black uppercase tracking-[0.18em] text-outline">Minor Keys</div>
                            <div class="grid grid-cols-2 gap-1">
                                <a href="${pageContext.request.contextPath}/songs?key=Cm" class="px-3 py-2 rounded-xl text-sm ${param.key == 'Cm' ? 'bg-primary text-white' : 'text-on-surface hover:bg-surface-container-low'} text-decoration-none" style="text-decoration: none;">C minor</a>
                                <a href="${pageContext.request.contextPath}/songs?key=C#m" class="px-3 py-2 rounded-xl text-sm ${param.key == 'C#m' ? 'bg-primary text-white' : 'text-on-surface hover:bg-surface-container-low'} text-decoration-none" style="text-decoration: none;">C# minor</a>
                                <a href="${pageContext.request.contextPath}/songs?key=Dm" class="px-3 py-2 rounded-xl text-sm ${param.key == 'Dm' ? 'bg-primary text-white' : 'text-on-surface hover:bg-surface-container-low'} text-decoration-none" style="text-decoration: none;">D minor</a>
                                <a href="${pageContext.request.contextPath}/songs?key=Ebm" class="px-3 py-2 rounded-xl text-sm ${param.key == 'Ebm' ? 'bg-primary text-white' : 'text-on-surface hover:bg-surface-container-low'} text-decoration-none" style="text-decoration: none;">Eb minor</a>
                                <a href="${pageContext.request.contextPath}/songs?key=Em" class="px-3 py-2 rounded-xl text-sm ${param.key == 'Em' ? 'bg-primary text-white' : 'text-on-surface hover:bg-surface-container-low'} text-decoration-none" style="text-decoration: none;">E minor</a>
                                <a href="${pageContext.request.contextPath}/songs?key=Fm" class="px-3 py-2 rounded-xl text-sm ${param.key == 'Fm' ? 'bg-primary text-white' : 'text-on-surface hover:bg-surface-container-low'} text-decoration-none" style="text-decoration: none;">F minor</a>
                                <a href="${pageContext.request.contextPath}/songs?key=F#m" class="px-3 py-2 rounded-xl text-sm ${param.key == 'F#m' ? 'bg-primary text-white' : 'text-on-surface hover:bg-surface-container-low'} text-decoration-none" style="text-decoration: none;">F# minor</a>
                                <a href="${pageContext.request.contextPath}/songs?key=Gm" class="px-3 py-2 rounded-xl text-sm ${param.key == 'Gm' ? 'bg-primary text-white' : 'text-on-surface hover:bg-surface-container-low'} text-decoration-none" style="text-decoration: none;">G minor</a>
                                <a href="${pageContext.request.contextPath}/songs?key=G#m" class="px-3 py-2 rounded-xl text-sm ${param.key == 'G#m' ? 'bg-primary text-white' : 'text-on-surface hover:bg-surface-container-low'} text-decoration-none" style="text-decoration: none;">G# minor</a>
                                <a href="${pageContext.request.contextPath}/songs?key=Am" class="px-3 py-2 rounded-xl text-sm ${param.key == 'Am' ? 'bg-primary text-white' : 'text-on-surface hover:bg-surface-container-low'} text-decoration-none" style="text-decoration: none;">A minor</a>
                                <a href="${pageContext.request.contextPath}/songs?key=Bbm" class="px-3 py-2 rounded-xl text-sm ${param.key == 'Bbm' ? 'bg-primary text-white' : 'text-on-surface hover:bg-surface-container-low'} text-decoration-none" style="text-decoration: none;">Bb minor</a>
                                <a href="${pageContext.request.contextPath}/songs?key=Bm" class="px-3 py-2 rounded-xl text-sm ${param.key == 'Bm' ? 'bg-primary text-white' : 'text-on-surface hover:bg-surface-container-low'} text-decoration-none" style="text-decoration: none;">B minor</a>
                            </div>
                        </div>
                    </details>
                </div>
            </div>

            <!-- View & Sort Controls -->
            <div class="flex items-center gap-4">
                <!-- View Toggle -->
                <div class="surface-mist no-print flex items-center rounded-xl p-1">
                    <button onclick="setListView(false)" id="gridBtn" class="p-2 rounded-lg transition-all text-on-surface-variant hover:bg-surface-container-high">
                        <span class="material-symbols-outlined text-xl">grid_view</span>
                    </button>
                    <button onclick="setListView(true)" id="listBtn" class="p-2 rounded-lg transition-all text-on-surface-variant hover:bg-surface-container-high">
                        <span class="material-symbols-outlined text-xl">view_list</span>
                    </button>
                </div>

                <div class="surface-mist flex items-center gap-2 rounded-xl p-1">
                    <a href="${pageContext.request.contextPath}/songs" class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${empty sortBy ? 'bg-white text-primary shadow-sm ring-1 ring-black/5' : 'text-on-surface-variant hover:bg-white'} text-decoration-none" style="text-decoration: none;">
                        Default
                    </a>
                    <a href="${pageContext.request.contextPath}/songs?sortBy=popular" class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${sortBy == 'popular' ? 'bg-white text-primary shadow-sm ring-1 ring-black/5' : 'text-on-surface-variant hover:bg-white'} text-decoration-none" style="text-decoration: none;">
                        Most Popular
                    </a>
                </div>
            </div>
        </div>

        <!-- Song Grid -->
        <div id="songsWrapper" class="">
        <div id="songsGrid" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 md:gap-4">
            <c:forEach var="song" items="${songs}">
                <!-- Premium Tailored Song Card — uses <a> for native mobile tap reliability -->
                <a href="${pageContext.request.contextPath}/song?id=${song.id}"
                   class="song-card group flex flex-col justify-between p-4 transition-all duration-300"
                   style="cursor:pointer; text-decoration:none; display:flex;"
                   aria-label="Open song ${song.songNumber}: ${song.title}">

                    <div class="flex-grow">
                        <div class="flex justify-between items-start">
                            <div class="flex-grow">
                                <span class="song-number-badge">#${song.songNumber}</span>
                                <h2 class="text-xl font-headline font-bold text-on-surface leading-tight group-hover:text-primary transition-colors">${song.title}</h2>
                            </div>
                            <!-- Audio Placeholder from Teacher's Request -->
                            <span class="material-symbols-outlined text-outline/40 group-hover:text-primary/70 transition-colors flex-shrink-0 ml-2" data-icon="play_circle">play_circle</span>
                        </div>
                        <p class="text-xs font-semibold text-primary/80 tracking-wide uppercase mt-1 mb-3">${song.artist}</p>
                    </div>

                    <div class="song-card-meta flex flex-wrap items-center gap-2 border-t border-slate-200/80 pt-3">
                        <c:if test="${not empty song.originalKey}">
                            <div class="ui-pill-solid rounded-md px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-on-primary-fixed">
                                Key of ${song.originalKey}
                            </div>
                        </c:if>
                        <c:if test="${song.bpm > 0}">
                            <div class="ui-pill-solid rounded-md px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-on-secondary-fixed">
                                ${song.bpm} BPM
                            </div>
                        </c:if>
                        <c:if test="${not empty song.language}">
                            <div class="ui-pill-solid rounded-md px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-on-surface capitalize">
                                ${song.language}
                            </div>
                        </c:if>
                    </div>
                </a>
            </c:forEach>

            <c:if test="${empty songs}">
                <div class="surface-mist col-span-full rounded-2xl border border-dashed border-outline-variant/40 py-10 text-center">
                    <span class="material-symbols-outlined text-6xl text-outline-variant mb-4">music_off</span>
                    <h3 class="text-2xl font-headline font-bold text-on-surface mb-2">No songs found</h3>
                    <p class="text-on-surface-variant max-w-md mx-auto">Try adjusting your filters or searching for a different title or artist.</p>
                </div>
            </c:if>
        </div>
        </div>
    </main>

    <jsp:include page="/jsp/includes/footer.jsp"/>

    <script>
        function setListView(isList) {
            const wrapper = document.getElementById('songsWrapper');
            const gridBtn = document.getElementById('gridBtn');
            const listBtn = document.getElementById('listBtn');

            if (isList) {
                wrapper.classList.add('song-list-view');
                listBtn.classList.add('bg-white', 'text-primary', 'shadow-sm', 'ring-1', 'ring-black/5');
                gridBtn.classList.remove('bg-white', 'text-primary', 'shadow-sm', 'ring-1', 'ring-black/5');
                localStorage.setItem('ws_pref_view', 'list');
            } else {
                wrapper.classList.remove('song-list-view');
                gridBtn.classList.add('bg-white', 'text-primary', 'shadow-sm', 'ring-1', 'ring-black/5');
                listBtn.classList.remove('bg-white', 'text-primary', 'shadow-sm', 'ring-1', 'ring-black/5');
                localStorage.setItem('ws_pref_view', 'grid');
            }
        }

        // Initialize view based on preference or screen size
        document.addEventListener('DOMContentLoaded', () => {
            const pref = localStorage.getItem('ws_pref_view');
            const isMobile = window.innerWidth < 768;
            
            if (pref === 'list' || (pref === null && isMobile)) {
                setListView(true);
            } else {
                setListView(false);
            }
        });
    </script>
</body>
</html>
