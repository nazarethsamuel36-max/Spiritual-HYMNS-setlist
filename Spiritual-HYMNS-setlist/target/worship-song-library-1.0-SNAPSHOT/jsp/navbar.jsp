<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fn" uri="jakarta.tags.functions" %>
<c:set var="currentUri" value="${pageContext.request.requestURI}" />
<nav class="sticky top-0 w-full transition-all" style="position:sticky; top:0; z-index:9999 !important; background:rgba(255,255,255,0.18); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border-bottom:0.5px solid rgba(255,255,255,0.35);">
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
    <c:if test="${not empty song && fn:contains(currentUri, '/song') && not fn:contains(currentUri, '/song/edit')}">
        <a href="${pageContext.request.contextPath}/song/edit?songId=${song.id}" class="hidden lg:inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors hover:bg-white text-decoration-none" style="text-decoration: none; color:#173164; background:rgba(255,255,255,0.24); border:1px solid rgba(255,255,255,0.48);">
            <span class="material-symbols-outlined text-[18px]">edit</span>
            Edit Song
        </a>
    </c:if>

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
                <c:if test="${sessionScope.role == 'admin'}">
                    <a href="${pageContext.request.contextPath}/admin/bulk-import" class="text-sm font-bold text-primary transition-colors hover:text-primary-container text-decoration-none" style="text-decoration: none;">Bulk Import</a>
                </c:if>
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

<!-- Mobile Blur Overlay -->
<div id="mobile-overlay" class="mobile-overlay" onclick="closeMobileMenu()"></div>

<!-- Mobile Dropdown Drawer -->
<div id="mobile-menu" class="hidden absolute lg:hidden">
    <div class="flex flex-col px-4 py-4 font-manrope">
        <a class="mobile-nav-item" href="${pageContext.request.contextPath}/songs" onclick="closeMobileMenu()">
            <span class="material-symbols-outlined">library_music</span>
            Songs
        </a>
        <c:if test="${not empty song && fn:contains(currentUri, '/song') && not fn:contains(currentUri, '/song/edit')}">
            <a class="mobile-nav-item" href="${pageContext.request.contextPath}/song/edit?songId=${song.id}" onclick="closeMobileMenu()">
                <span class="material-symbols-outlined">edit</span>
                Edit Song
            </a>
        </c:if>
        <c:if test="${not empty sessionScope.username}">
            <a class="mobile-nav-item" href="${pageContext.request.contextPath}/song/add" onclick="closeMobileMenu()">
                <span class="material-symbols-outlined">add_circle</span>
                Add Song
            </a>
        </c:if>
        <a class="mobile-nav-item" href="${pageContext.request.contextPath}/leaflet/new" onclick="closeMobileMenu()">
            <span class="material-symbols-outlined">auto_stories</span>
            Leaflet Builder
        </a>
        <c:choose>
            <c:when test="${not empty sessionScope.username}">
                <a class="mobile-nav-item" href="${pageContext.request.contextPath}/setlist/my" onclick="closeMobileMenu()">
                    <span class="material-symbols-outlined">format_list_bulleted</span>
                    Setlists
                </a>
                <a class="mobile-nav-item" href="${pageContext.request.contextPath}/account" onclick="closeMobileMenu()">
                    <span class="material-symbols-outlined">account_circle</span>
                    My Account (${sessionScope.username})
                </a>
                <c:if test="${sessionScope.role == 'admin'}">
                    <a class="mobile-nav-item" href="${pageContext.request.contextPath}/admin/bulk-import" onclick="closeMobileMenu()">
                        <span class="material-symbols-outlined">upload_file</span>
                        Bulk Import
                    </a>
                </c:if>
                <a href="${pageContext.request.contextPath}/logout" class="mobile-nav-item text-error" onclick="closeMobileMenu()">
                    <span class="material-symbols-outlined">logout</span>
                    Logout
                </a>
            </c:when>
            <c:otherwise>
                <a class="mobile-nav-item opacity-50 cursor-not-allowed" href="javascript:void(0)" title="Login to create setlists" onclick="closeMobileMenu()">
                    <span class="material-symbols-outlined">lock</span>
                    Setlists
                </a>
                <a class="mobile-nav-item" href="${pageContext.request.contextPath}/login" onclick="closeMobileMenu()">
                    <span class="material-symbols-outlined">login</span>
                    Login
                </a>
                <a class="mobile-nav-item" href="${pageContext.request.contextPath}/register" onclick="closeMobileMenu()" style="color: var(--color-brand) !important;">
                    <span class="material-symbols-outlined">person_add</span>
                    Sign Up
                </a>
            </c:otherwise>
        </c:choose>

        <!-- Mobile Search -->
        <div class="px-3 mt-4">
            <form action="${pageContext.request.contextPath}/search" method="get" class="relative">
                <button type="submit" class="absolute left-4 top-1/2 -translate-y-1/2 text-outline border-none bg-transparent cursor-pointer p-0 flex items-center justify-center z-10" style="color: #173164; opacity: 0.5;">
                    <span class="material-symbols-outlined text-[20px]">search</span>
                </button>
                <input name="q" class="w-full rounded-xl pl-12 pr-4 py-3.5 text-sm outline-none border-none" 
                       style="background: rgba(0, 0, 0, 0.05); color: #173164; font-weight: 600;" 
                       placeholder="Search songs..." type="text"/>
            </form>
        </div>
    </div>
</div>
</nav>

<script>
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileOverlay = document.getElementById('mobile-overlay');
    const menuIcon = mobileBtn.querySelector('.material-symbols-outlined');

    mobileBtn.addEventListener('click', () => {
        const isHidden = mobileMenu.classList.toggle('hidden');
        if (isHidden) {
            menuIcon.textContent = 'menu';
            mobileOverlay.classList.remove('visible');
        } else {
            menuIcon.textContent = 'close';
            mobileOverlay.classList.add('visible');
        }
    });

    function closeMobileMenu() {
        mobileMenu.classList.add('hidden');
        mobileOverlay.classList.remove('visible');
        menuIcon.textContent = 'menu';
    }
</script>
