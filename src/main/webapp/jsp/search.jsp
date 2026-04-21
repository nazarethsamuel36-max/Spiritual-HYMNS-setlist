<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html class="light" lang="en">
<head>
    <title>Search: <c:out value="${searchQuery}"/> — Worship Song Library</title>
    <jsp:include page="/jsp/includes/head.jsp"/>
</head>
<body class="bg-surface font-body text-on-surface flex flex-col min-h-screen">
    <jsp:include page="/jsp/navbar.jsp"/>

    <main class="flex-grow max-w-[1920px] mx-auto w-full px-6 md:px-24 py-12">
        <h1 class="text-3xl font-headline font-extrabold tracking-tight text-on-surface mb-8">Search Results</h1>

        <!-- Search Bar -->
        <div class="w-full max-w-3xl mb-12">
            <form action="${pageContext.request.contextPath}/search" method="get" class="relative group">
                <button type="submit" class="absolute left-4 top-1/2 -translate-y-1/2 text-outline/60 text-xl font-bold border-none bg-transparent cursor-pointer p-0 flex items-center justify-center z-10 hover:text-primary transition-colors focus:outline-none">
                    <span class="material-symbols-outlined">search</span>
                </button>
                <input name="q" class="w-full pl-12 pr-4 py-4 bg-surface-container-low border border-outline-variant/30 rounded-xl text-md focus:ring-2 focus:ring-primary focus:border-primary transition-all font-medium placeholder:text-outline shadow-sm" placeholder="Search by title, artist, or lyrics..." type="text" value="<c:out value="${searchQuery}"/>" autocomplete="off"/>
            </form>
        </div>

        <c:if test="${not empty searchQuery}">
            <c:choose>
                <c:when test="${not empty searchResults}">
                    <p class="text-on-surface-variant font-medium mb-6"><c:out value="${searchResults.size()}"/> result${searchResults.size() != 1 ? 's' : ''} for "<strong class="text-primary"><c:out value="${searchQuery}"/></strong>"</p>

                    <!-- Song Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                        <c:forEach var="songResult" items="${searchResults}">
                            <a href="${pageContext.request.contextPath}/song?id=${songResult['id']}" 
                               class="song-card group bg-surface-container-lowest p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-surface-dim hover:border-primary/20 flex flex-col justify-between text-decoration-none" 
                               style="text-decoration: none;"
                               aria-label="View <c:out value="${songResult['title']}"/> by <c:out value="${songResult['artist']}"/>">
                                <div class="space-y-4">
                                    <div class="flex justify-between items-start">
                                        <div class="flex-grow">
                                            <span style="font-size:10px;font-weight:800;letter-spacing:0.12em;color:#9ca3af;text-transform:uppercase;display:block;margin-bottom:4px">#<c:out value="${songResult['songNumber']}"/></span>
                                            <h2 class="text-xl font-headline font-bold text-on-surface leading-tight group-hover:text-primary transition-colors"><c:out value="${songResult['title']}"/></h2>
                                        </div>
                                        <span class="material-symbols-outlined text-outline/40 group-hover:text-primary/70 transition-colors flex-shrink-0 ml-2">play_circle</span>
                                    </div>
                                    <p class="text-sm font-semibold text-primary/80 tracking-wide uppercase"><c:out value="${songResult['artist']}"/></p>
                                    
                                    <div class="flex items-center gap-2 flex-wrap pt-2">
                                        <c:if test="${not empty songResult['originalKey']}">
                                            <div class="px-3 py-1 bg-primary-fixed text-on-primary-fixed text-[10px] font-bold uppercase tracking-widest rounded-md">
                                                Key of <c:out value="${songResult['originalKey']}"/>
                                            </div>
                                        </c:if>
                                        <c:if test="${not empty songResult['language']}">
                                            <div class="px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold uppercase tracking-widest rounded-md">
                                                <c:out value="${songResult['language']}"/>
                                            </div>
                                        </c:if>
                                    </div>

                                    <c:if test="${not empty songResult['matchedLine']}">
                                        <div class="mt-4 p-3 bg-surface-container text-xs font-mono text-on-surface-variant rounded-lg border border-outline-variant/30 leading-relaxed max-h-24 overflow-hidden relative">
                                            ...<c:out value="${songResult['matchedLine']}"/>...
                                            <div class="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-surface-container to-transparent"></div>
                                        </div>
                                    </c:if>
                                </div>
                            </a>
                        </c:forEach>
                    </div>
                </c:when>
                <c:otherwise>
                    <div class="col-span-full py-24 text-center bg-surface-container-low rounded-3xl border border-dashed border-outline-variant/40 max-w-3xl mx-auto">
                        <span class="material-symbols-outlined text-6xl text-outline-variant mb-4">search_off</span>
                        <h3 class="text-2xl font-headline font-bold text-on-surface mb-2">No songs found for "<strong class="text-primary"><c:out value="${searchQuery}"/></strong>"</h3>
                        <p class="text-on-surface-variant max-w-md mx-auto mb-6">Try searching by the first line of the song or a different keyword.</p>
                        <a href="${pageContext.request.contextPath}/songs" class="px-6 py-3 bg-surface-container-high text-on-surface font-bold rounded-lg hover:bg-surface-dim transition-colors text-decoration-none" style="text-decoration: none;">Browse All Songs</a>
                    </div>
                </c:otherwise>
            </c:choose>
        </c:if>

        <c:if test="${empty searchQuery}">
            <div class="col-span-full py-24 text-center bg-surface-container-low rounded-3xl border border-dashed border-outline-variant/40 max-w-3xl mx-auto">
                <span class="material-symbols-outlined text-6xl text-outline-variant mb-4">music_note</span>
                <p class="text-on-surface-variant max-w-md mx-auto text-lg">Type a song title, artist name, or lyric to search.</p>
            </div>
        </c:if>
    </main>

    <jsp:include page="/jsp/includes/footer.jsp"/>
    <script src="${pageContext.request.contextPath}/js/app.js"></script>
</body>
</html>
