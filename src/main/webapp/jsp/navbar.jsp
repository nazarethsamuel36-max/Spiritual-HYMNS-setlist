<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fn" uri="jakarta.tags.functions" %>
<c:set var="currentUri" value="${pageContext.request.requestURI}" />
<nav class="sticky top-0 z-50 w-full transition-all" style="position:sticky; top:0; z-index:100; background:rgba(255,255,255,0.18); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border-bottom:0.5px solid rgba(255,255,255,0.35);">
<div class="mx-auto flex max-w-[1920px] items-center justify-between px-6 py-4 md:px-24">
<div class="flex items-center gap-8 xl:gap-12">
<a href="${pageContext.request.contextPath}/" class="max-w-[240px] text-2xl font-black uppercase tracking-[0.16em] text-primary decoration-none leading-none font-headline" style="text-decoration: none;">The Resonant Archive</a>
    <div class="hidden lg:flex items-center gap-2 rounded-full px-2 py-2 font-headline text-[15px] font-semibold tracking-tight" style="background:rgba(255,255,255,0.18); border:1px solid rgba(255,255,255,0.46); backdrop-filter:blur(18px) saturate(165%); -webkit-backdrop-filter:blur(18px) saturate(165%); box-shadow:0 10px 24px rgba(39,92,138,0.10);">
        <a class="rounded-full px-4 py-2 transition-colors ${fn:contains(currentUri, '/songs') || fn:contains(currentUri, '/search') || fn:contains(currentUri, '/song') ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:bg-white hover:text-primary'} text-decoration-none" style="text-decoration: none; color:${fn:contains(currentUri, '/songs') || fn:contains(currentUri, '/search') || fn:contains(currentUri, '/song') ? '#ffffff' : '#21345f'};" href="${pageContext.request.contextPath}/songs">Songs</a>
        <a class="rounded-full px-4 py-2 transition-colors ${fn:contains(currentUri, '/leaflet') ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:bg-white hover:text-primary'} text-decoration-none" style="text-decoration: none; color:${fn:contains(currentUri, '/leaflet') ? '#ffffff' : '#21345f'};" href="${pageContext.request.contextPath}/leaflet/new">Leaflet Builder</a>
        <c:choose>
            <c:when test="${not empty sessionScope.username}">
                <a class="rounded-full px-4 py-2 transition-colors ${fn:contains(currentUri, '/setlist') ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:bg-white hover:text-primary'} text-decoration-none" style="text-decoration: none; color:${fn:contains(currentUri, '/setlist') ? '#ffffff' : '#21345f'};" href="${pageContext.request.contextPath}/setlist/my">Setlists</a>
                <a class="rounded-full px-4 py-2 transition-colors ${fn:contains(currentUri, '/account') ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:bg-white hover:text-primary'} text-decoration-none" style="text-decoration: none; color:${fn:contains(currentUri, '/account') ? '#ffffff' : '#21345f'};" href="${pageContext.request.contextPath}/account">Account</a>
            </c:when>
            <c:otherwise>
                <a href="javascript:void(0)" class="rounded-full px-4 py-2 text-outline-variant cursor-not-allowed text-decoration-none" style="text-decoration: none; color:#66748f;" title="Login to create setlists">Setlists</a>
            </c:otherwise>
        </c:choose>
    </div>
</div>

<div class="flex items-center gap-3 font-manrope font-medium">
    <c:if test="${not empty sessionScope.username}">
        <a href="${pageContext.request.contextPath}/song/add" class="hidden lg:inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary-container text-decoration-none" style="text-decoration: none;">
            <span class="material-symbols-outlined text-[18px]">add</span>
            Add Song
        </a>
    </c:if>

    <div class="hidden lg:flex items-center gap-3">
        <c:choose>
            <c:when test="${not empty sessionScope.username}">
                <a href="${pageContext.request.contextPath}/account" class="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-decoration-none" style="text-decoration: none; color:#173164; background:rgba(255,255,255,0.24); border:1px solid rgba(255,255,255,0.48); backdrop-filter:blur(18px) saturate(165%); -webkit-backdrop-filter:blur(18px) saturate(165%);">
                    <span class="material-symbols-outlined text-[18px]">account_circle</span>
                    ${sessionScope.username}
                </a>
                <a href="${pageContext.request.contextPath}/logout" class="text-sm font-semibold transition-colors hover:text-primary text-decoration-none" style="text-decoration: none; color:#21345f;">Logout</a>
            </c:when>
            <c:otherwise>
                <a href="${pageContext.request.contextPath}/login" class="text-sm font-semibold transition-colors hover:text-primary text-decoration-none" style="text-decoration: none; color:#21345f;">Login</a>
                <a href="${pageContext.request.contextPath}/register" class="rounded-full px-5 py-2.5 text-sm font-bold transition-colors hover:bg-primary hover:text-white text-decoration-none" style="text-decoration: none; color:#173164; background:rgba(255,255,255,0.24); border:1px solid rgba(255,255,255,0.48); backdrop-filter:blur(18px) saturate(165%); -webkit-backdrop-filter:blur(18px) saturate(165%);">Sign Up</a>
            </c:otherwise>
        </c:choose>
    </div>

    <button id="mobile-menu-btn" class="rounded-xl p-2 transition-colors hover:bg-white/70 focus:outline-none lg:hidden" style="color:#173164;">
        <span class="material-symbols-outlined pointer-events-none text-2xl">menu</span>
    </button>
</div>
</div>

<!-- Mobile Dropdown Drawer -->
<div id="mobile-menu" class="surface-mist absolute left-0 top-full hidden w-full rounded-b-3xl border-b border-white/60 lg:hidden">
    <div class="flex flex-col gap-4 px-6 py-4 font-manrope font-medium">
        <a class="border-b border-surface-dim py-2 text-[#001264] transition-colors hover:text-primary text-decoration-none" style="text-decoration: none;" href="${pageContext.request.contextPath}/songs" onclick="closeMobileMenu()">Songs</a>
        <c:if test="${not empty sessionScope.username}">
            <a class="border-b border-surface-dim py-2 font-bold text-on-surface-variant transition-colors hover:text-primary text-decoration-none" style="text-decoration: none;" href="${pageContext.request.contextPath}/song/add" onclick="closeMobileMenu()">Add Song</a>
        </c:if>
        <a class="border-b border-surface-dim py-2 text-on-surface-variant transition-colors hover:text-primary text-decoration-none" style="text-decoration: none;" href="${pageContext.request.contextPath}/leaflet/new" onclick="closeMobileMenu()">Leaflet Builder</a>
        <c:choose>
            <c:when test="${not empty sessionScope.username}">
                <a class="border-b border-surface-dim py-2 text-on-surface-variant transition-colors hover:text-primary text-decoration-none" style="text-decoration: none;" href="${pageContext.request.contextPath}/setlist/my" onclick="closeMobileMenu()">Setlists</a>
                <a class="border-b border-surface-dim py-2 text-on-surface-variant transition-colors hover:text-primary text-decoration-none" style="text-decoration: none;" href="${pageContext.request.contextPath}/account" onclick="closeMobileMenu()">My Account (${sessionScope.username})</a>
                <a href="${pageContext.request.contextPath}/logout" class="text-error font-bold py-2 hover:text-error-container transition-colors text-decoration-none" style="text-decoration: none;" onclick="closeMobileMenu()">Logout</a>
            </c:when>
            <c:otherwise>
                <a href="javascript:void(0)" class="border-b border-surface-dim py-2 text-outline-variant cursor-not-allowed text-decoration-none" style="text-decoration: none;" title="Login to create setlists" onclick="closeMobileMenu()">Setlists</a>
                <a href="${pageContext.request.contextPath}/login" class="border-b border-surface-dim py-2 text-on-surface-variant transition-colors hover:text-primary text-decoration-none" style="text-decoration: none;" onclick="closeMobileMenu()">Login</a>
                <a href="${pageContext.request.contextPath}/register" class="text-primary font-bold py-2 hover:text-primary-container transition-colors text-decoration-none" style="text-decoration: none;" onclick="closeMobileMenu()">Sign Up</a>
            </c:otherwise>
        </c:choose>

        <!-- Mobile Search -->
        <form action="${pageContext.request.contextPath}/search" method="get" class="relative mt-2 md:hidden">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
            <input name="q" class="ui-input-solid w-full rounded-xl pl-10 pr-4 py-3 text-sm outline-none" placeholder="Search songs..." type="text"/>
        </form>
    </div>
</div>
</nav>

<script>
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = mobileBtn.querySelector('.material-symbols-outlined');

    mobileBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
        if (mobileMenu.classList.contains('hidden')) {
            menuIcon.textContent = 'menu';
        } else {
            menuIcon.textContent = 'close';
        }
    });

    function closeMobileMenu() {
        mobileMenu.classList.add('hidden');
        menuIcon.textContent = 'menu';
    }
</script>
