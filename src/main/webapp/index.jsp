<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html class="light" lang="en">
<head>
    <title>Worship Song Library &mdash; Every lyric. Every chord. One archive.</title>
    <meta name="description" content="Access a premium digital library of worship songs curated for the modern sanctuary.">
    <jsp:include page="/jsp/includes/head.jsp"/>
</head>
<body class="font-body text-on-surface flex min-h-screen flex-col">
    <jsp:include page="/jsp/navbar.jsp"/>

    <main class="relative z-10 flex flex-grow flex-col items-center px-4 py-6 md:px-8 md:py-10">
        <!-- Central Search Bar -->
        <div class="relative z-10 w-full max-w-3xl group mb-5">
            <div class="absolute -inset-2 rounded-[2rem] bg-gradient-to-r from-white/30 via-primary/10 to-white/20 blur-2xl opacity-60 transition duration-1000 group-hover:opacity-80"></div>
            <form action="${pageContext.request.contextPath}/search" method="get" class="surface-glass relative flex items-center overflow-hidden rounded-[2rem] px-2 py-2">
                <button type="submit" class="ml-4 flex min-h-10 min-w-10 items-center justify-center border-none bg-transparent cursor-pointer p-0 text-3xl text-on-surface-variant hover:text-primary transition-colors focus:outline-none z-10">
                    <span class="material-symbols-outlined">search</span>
                </button>
                <input name="q"
                       class="w-full border-none bg-transparent px-4 py-5 text-lg font-light outline-none placeholder:text-outline/50 focus:ring-0 md:px-6 md:py-6 md:text-2xl"
                       placeholder="Search songs, artists, or lyrics..."
                       type="text"
                       aria-label="Search the song archive"
                       title="Search input"/>
                <div class="hidden md:flex items-center pr-6 space-x-2">
                    <button type="submit" class="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-container">Search Archive</button>
                </div>
            </form>
        </div>

        <!-- Hero Content -->
        <div class="relative z-10 mb-5 w-full max-w-5xl text-center">
            <div class="surface-glass mx-auto max-w-3xl rounded-[2rem] px-5 py-5 md:px-10 md:py-7">
            <h1 class="font-headline text-3xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-3 leading-tight">
                Every lyric. <span class="text-primary">Every chord.</span><br/>One archive.
            </h1>
            <p class="text-on-surface-variant text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                Access a premium digital library of worship songs curated for the modern sanctuary. Search by title, theme, or artist.
            </p>
            </div>
        </div>

        <!-- Bug #4: Popular Tags (Accessibility + Semantic Links) -->
        <div class="relative z-10 flex flex-wrap justify-center gap-3 max-w-2xl text-center">
            <span class="text-on-surface-variant text-xs uppercase tracking-widest font-bold self-center mr-2 w-full md:w-auto mb-2 md:mb-0">Popular Themes:</span>
            <a href="${pageContext.request.contextPath}/search?q=worship" class="ui-pill-solid rounded-full px-5 py-2 text-sm font-semibold tracking-wide text-decoration-none" style="text-decoration: none;" aria-label="Search for worship songs">#worship</a>
            <a href="${pageContext.request.contextPath}/search?q=praise" class="ui-pill-solid rounded-full px-5 py-2 text-sm font-semibold tracking-wide text-decoration-none" style="text-decoration: none;" aria-label="Search for praise songs">#praise</a>
            <a href="${pageContext.request.contextPath}/search?q=communion" class="ui-pill-solid rounded-full px-5 py-2 text-sm font-semibold tracking-wide text-decoration-none" style="text-decoration: none;" aria-label="Search for communion songs">#communion</a>
        </div>
    </main>

    <jsp:include page="/jsp/includes/footer.jsp"/>
    <script src="${pageContext.request.contextPath}/js/app.js"></script>
</body>
</html>
