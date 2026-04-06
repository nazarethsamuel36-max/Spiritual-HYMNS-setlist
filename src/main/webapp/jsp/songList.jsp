<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html class="light" lang="en">
<head>
    <title>Song Library — Worship Song Library</title>
    <jsp:include page="/jsp/includes/head.jsp"/>
</head>
<body class="bg-surface font-body text-on-surface flex flex-col min-h-screen">
    <jsp:include page="/jsp/navbar.jsp"/>

    <main class="flex-grow max-w-[1920px] mx-auto w-full px-6 md:px-24 py-12">
        <!-- Header & Search -->
        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-surface-dim pb-8 mb-12">
            <div>
                <h1 class="text-4xl font-headline font-extrabold tracking-tight text-on-surface mb-2">Song Library</h1>
                <p class="text-on-surface-variant text-lg font-medium">Browse and transpose songs for your worship service.</p>
            </div>
            
            <div class="w-full lg:w-96">
                <!-- Live Search Bar -->
                <form action="${pageContext.request.contextPath}/search" method="get" class="relative group">
                    <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline/60 text-xl font-bold">search</span>
                    <input name="q" class="w-full pl-12 pr-4 py-4 bg-surface-container-low border border-outline-variant/30 rounded-xl text-md focus:ring-2 focus:ring-primary focus:border-primary transition-all font-medium placeholder:text-outline shadow-sm" placeholder="Search by title, artist, or lyrics..." type="text" value="${searchQuery}"/>
                </form>
            </div>

        </div>

        <!-- Filter & Sort Header -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <!-- Filter Pills & Key Dropdown -->
            <div class="flex flex-wrap gap-4 items-center text-sm font-semibold tracking-wide">
                <div class="flex flex-wrap gap-2 items-center">
                    <span class="text-outline uppercase text-xs tracking-widest mr-2">Language:</span>
                    <a href="${pageContext.request.contextPath}/songs" class="px-5 py-2 rounded-full cursor-pointer transition-colors ${empty filterHashtag && empty filterLanguage ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-dim'} text-decoration-none" style="text-decoration: none;">All</a>
                    <a href="${pageContext.request.contextPath}/songs?language=english" class="px-5 py-2 rounded-full cursor-pointer transition-colors ${param.language == 'english' ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-dim'} text-decoration-none" style="text-decoration: none;">English</a>
                    <a href="${pageContext.request.contextPath}/songs?language=hindi" class="px-5 py-2 rounded-full cursor-pointer transition-colors ${param.language == 'hindi' ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-dim'} text-decoration-none" style="text-decoration: none;">Hindi</a>
                    <a href="${pageContext.request.contextPath}/songs?language=marathi" class="px-5 py-2 rounded-full cursor-pointer transition-colors ${param.language == 'marathi' ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-dim'} text-decoration-none" style="text-decoration: none;">Marathi</a>
                </div>

                <!-- Key Dropdown -->
                <div class="flex items-center gap-2">
                    <span class="text-outline uppercase text-xs tracking-widest">Key:</span>
                    <select onchange="if(this.value) window.location.href='${pageContext.request.contextPath}/songs?key='+this.value; else window.location.href='${pageContext.request.contextPath}/songs';" class="bg-surface-container-high text-on-surface-variant border-none rounded-lg text-sm font-bold focus:ring-primary py-2 px-4 shadow-sm cursor-pointer hover:bg-surface-dim transition-colors">
                        <option value="">All Keys</option>
                        <optgroup label="Major Keys">
                            <option value="C" ${param.key == 'C' ? 'selected' : ''}>C Major</option>
                            <option value="C#" ${param.key == 'C#' ? 'selected' : ''}>C# / Db</option>
                            <option value="D" ${param.key == 'D' ? 'selected' : ''}>D Major</option>
                            <option value="Eb" ${param.key == 'Eb' ? 'selected' : ''}>D# / Eb</option>
                            <option value="E" ${param.key == 'E' ? 'selected' : ''}>E Major</option>
                            <option value="F" ${param.key == 'F' ? 'selected' : ''}>F Major</option>
                            <option value="F#" ${param.key == 'F#' ? 'selected' : ''}>F# / Gb</option>
                            <option value="G" ${param.key == 'G' ? 'selected' : ''}>G Major</option>
                            <option value="Ab" ${param.key == 'Ab' ? 'selected' : ''}>G# / Ab</option>
                            <option value="A" ${param.key == 'A' ? 'selected' : ''}>A Major</option>
                            <option value="Bb" ${param.key == 'Bb' ? 'selected' : ''}>A# / Bb</option>
                            <option value="B" ${param.key == 'B' ? 'selected' : ''}>B Major</option>
                        </optgroup>
                        <optgroup label="Minor Keys">
                            <option value="Cm" ${param.key == 'Cm' ? 'selected' : ''}>C minor</option>
                            <option value="C#m" ${param.key == 'C#m' ? 'selected' : ''}>C# minor</option>
                            <option value="Dm" ${param.key == 'Dm' ? 'selected' : ''}>D minor</option>
                            <option value="Ebm" ${param.key == 'Ebm' ? 'selected' : ''}>Eb minor</option>
                            <option value="Em" ${param.key == 'Em' ? 'selected' : ''}>E minor</option>
                            <option value="Fm" ${param.key == 'Fm' ? 'selected' : ''}>F minor</option>
                            <option value="F#m" ${param.key == 'F#m' ? 'selected' : ''}>F# minor</option>
                            <option value="Gm" ${param.key == 'Gm' ? 'selected' : ''}>G minor</option>
                            <option value="G#m" ${param.key == 'G#m' ? 'selected' : ''}>G# minor</option>
                            <option value="Am" ${param.key == 'Am' ? 'selected' : ''}>A minor</option>
                            <option value="Bbm" ${param.key == 'Bbm' ? 'selected' : ''}>Bb minor</option>
                            <option value="Bm" ${param.key == 'Bm' ? 'selected' : ''}>B minor</option>
                        </optgroup>
                    </select>
                </div>
            </div>

            <!-- Sort Toggle -->
            <div class="flex items-center gap-2 bg-surface-container-low p-1 rounded-xl shadow-sm border border-outline-variant/20">
                <a href="${pageContext.request.contextPath}/songs" class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${empty sortBy ? 'bg-white text-primary shadow-sm ring-1 ring-black/5' : 'text-on-surface-variant hover:bg-surface-container-high'} text-decoration-none" style="text-decoration: none;">
                    Default
                </a>
                <a href="${pageContext.request.contextPath}/songs?sortBy=popular" class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${sortBy == 'popular' ? 'bg-white text-primary shadow-sm ring-1 ring-black/5' : 'text-on-surface-variant hover:bg-surface-container-high'} text-decoration-none" style="text-decoration: none;">
                    Most Popular
                </a>
            </div>
        </div>

        <!-- Song Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            <c:forEach var="song" items="${songs}">
                <!-- Premium Tailored Song Card -->
                <div class="group bg-surface-container-lowest p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-surface-dim hover:border-primary/20 cursor-pointer flex flex-col justify-between" onclick="window.location='${pageContext.request.contextPath}/song?id=${song.id}'">
                    
                    <div class="space-y-4">
                        <div class="flex justify-between items-start">
                            <h2 class="text-xl font-headline font-bold text-on-surface leading-tight group-hover:text-primary transition-colors">${song.title}</h2>
                            <!-- Audio Placeholder from Teacher's Request -->
                            <span class="material-symbols-outlined text-outline/40 group-hover:text-primary/70 transition-colors" data-icon="play_circle">play_circle</span>
                        </div>
                        <p class="text-sm font-semibold text-primary/80 tracking-wide uppercase">${song.artist}</p>
                        
                        <div class="flex items-center gap-2 flex-wrap pt-2">
                            <c:if test="${not empty song.originalKey}">
                                <div class="px-3 py-1 bg-primary-fixed text-on-primary-fixed text-[10px] font-bold uppercase tracking-widest rounded-md">
                                    Key of ${song.originalKey}
                                </div>
                            </c:if>
                            <c:if test="${song.bpm > 0}">
                                <div class="px-3 py-1 bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold uppercase tracking-widest rounded-md">
                                    ${song.bpm} BPM
                                </div>
                            </c:if>
                            <c:if test="${not empty song.language}">
                                <div class="px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold uppercase tracking-widest rounded-md">
                                    ${song.language}
                                </div>
                            </c:if>
                        </div>
                    </div>
                </div>
            </c:forEach>

            <c:if test="${empty songs}">
                <div class="col-span-full py-24 text-center bg-surface-container-low rounded-3xl border border-dashed border-outline-variant/40">
                    <span class="material-symbols-outlined text-6xl text-outline-variant mb-4">music_off</span>
                    <h3 class="text-2xl font-headline font-bold text-on-surface mb-2">No songs found</h3>
                    <p class="text-on-surface-variant max-w-md mx-auto">Try adjusting your filters or searching for a different title or artist.</p>
                </div>
            </c:if>
        </div>
    </main>

    <jsp:include page="/jsp/includes/footer.jsp"/>
</body>
</html>
