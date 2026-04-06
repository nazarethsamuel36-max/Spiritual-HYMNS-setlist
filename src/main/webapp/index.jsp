<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html class="light" lang="en">
<head>
    <title>Worship Song Library &mdash; Every lyric. Every chord. One archive.</title>
    <meta name="description" content="Access a premium digital library of worship songs curated for the modern sanctuary.">
    <jsp:include page="/jsp/includes/head.jsp"/>
</head>
<body class="bg-surface font-body text-on-surface flex flex-col min-h-screen">
    <jsp:include page="/jsp/navbar.jsp"/>

    <main class="flex-grow z-10 relative flex flex-col items-center justify-center px-6 py-24">
        <!-- Background Mesh -->
        <div class="absolute inset-0 z-0 mesh-bg opacity-70 border-b border-surface-dim"></div>
        
        <!-- Hero Content -->
        <div class="relative z-10 max-w-4xl w-full text-center mb-12 mt-12">
            <h1 class="font-headline text-5xl md:text-7xl font-extrabold tracking-tight text-on-surface mb-6 leading-tight">
                Every lyric. <span class="text-primary">Every chord.</span><br/>One archive.
            </h1>
            <p class="text-on-surface-variant text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                Access a premium digital library of worship songs curated for the modern sanctuary. Search by title, theme, or artist.
            </p>
        </div>

        <!-- Central Search Bar -->
        <div class="relative z-10 w-full max-w-3xl group mb-8">
            <div class="absolute -inset-1 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <form action="${pageContext.request.contextPath}/search" method="get" class="relative flex items-center bg-white rounded-2xl shadow-xl border border-surface-dim overflow-hidden">
                <span class="material-symbols-outlined ml-6 text-on-surface-variant text-3xl">search</span>
                <input name="q" 
                       class="w-full py-7 px-6 text-xl md:text-2xl bg-transparent border-none focus:ring-0 placeholder:text-outline/40 font-light outline-none" 
                       placeholder="Search songs, artists, or lyrics..." 
                       type="text"
                       aria-label="Search the song archive"
                       title="Search input"/>
                <div class="hidden md:flex items-center pr-6 space-x-2">
                    <button type="submit" class="px-6 py-3 bg-primary text-white text-sm font-bold rounded-lg hover:opacity-90 transition-all">Search Archive</button>
                </div>
            </form>
        </div>

        <!-- Bug #4: Popular Tags (Accessibility + Semantic Links) -->
        <div class="relative z-10 flex flex-wrap justify-center gap-3 max-w-2xl text-center">
            <span class="text-on-surface-variant text-xs uppercase tracking-widest font-bold self-center mr-2 w-full md:w-auto mb-2 md:mb-0">Popular Themes:</span>
            <a href="${pageContext.request.contextPath}/search?q=worship" class="px-5 py-2 bg-primary-fixed text-on-primary-fixed hover:bg-primary transition-all rounded-full text-sm font-medium tracking-wide text-decoration-none" style="text-decoration: none;" aria-label="Search for worship songs">#worship</a>
            <a href="${pageContext.request.contextPath}/search?q=praise" class="px-5 py-2 bg-secondary-fixed text-on-secondary-fixed hover:bg-secondary transition-all rounded-full text-sm font-medium tracking-wide text-decoration-none" style="text-decoration: none;" aria-label="Search for praise songs">#praise</a>
            <a href="${pageContext.request.contextPath}/search?q=communion" class="px-5 py-2 bg-tertiary-fixed text-on-tertiary-fixed hover:bg-tertiary transition-all rounded-full text-sm font-medium tracking-wide text-decoration-none" style="text-decoration: none;" aria-label="Search for communion songs">#communion</a>
        </div>
    </main>

    <jsp:include page="/jsp/includes/footer.jsp"/>
    <script src="${pageContext.request.contextPath}/js/app.js"></script>
</body>
</html>
