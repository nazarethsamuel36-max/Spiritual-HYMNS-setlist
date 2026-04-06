<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<nav class="sticky top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100/20 dark:border-slate-800/20 shadow-sm dark:shadow-none transition-all">
<div class="flex justify-between items-center px-6 md:px-24 py-4 max-w-[1920px] mx-auto">
<div class="flex items-center gap-12">
<a href="${pageContext.request.contextPath}/" class="text-2xl font-black text-[#001264] dark:text-blue-100 uppercase tracking-widest font-headline decoration-none" style="text-decoration: none;">The Resonant Archive</a>
    <div class="hidden lg:flex items-center gap-8 font-manrope tracking-tight font-medium">
          <a class="text-[#001264] dark:text-blue-400 pb-1 hover:text-[#001264] transition-colors text-decoration-none" style="text-decoration: none;" href="${pageContext.request.contextPath}/songs">Songs</a>
        <c:if test="${not empty sessionScope.username}">
            <a class="text-slate-500 dark:text-slate-400 hover:text-[#001264] transition-colors text-decoration-none font-bold" style="text-decoration: none;" href="${pageContext.request.contextPath}/song/add">Add Song</a>
        </c:if>
        <a class="text-slate-500 dark:text-slate-400 hover:text-[#001264] transition-colors text-decoration-none" style="text-decoration: none;" href="${pageContext.request.contextPath}/leaflet/new">Leaflet Builder</a>
        <c:choose>
            <c:when test="${not empty sessionScope.username}">
                <a class="text-slate-500 dark:text-slate-400 hover:text-[#001264] transition-colors text-decoration-none" style="text-decoration: none;" href="${pageContext.request.contextPath}/setlist/my">Setlists</a>
                <a class="text-slate-500 dark:text-slate-400 hover:text-[#001264] transition-colors text-decoration-none" style="text-decoration: none;" href="${pageContext.request.contextPath}/account">My Account</a>
            </c:when>
            <c:otherwise>
                <a href="javascript:void(0)" class="text-slate-300 dark:text-slate-600 cursor-not-allowed text-decoration-none" style="text-decoration: none;" title="Login to create setlists">Setlists</a>
            </c:otherwise>
        </c:choose>
    </div>
</div>
        
<div class="flex items-center gap-4 font-manrope font-medium">
    <div class="relative hidden md:block mr-2">
        <form action="${pageContext.request.contextPath}/search" method="get">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
            <input name="q" class="pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-lg text-sm focus:ring-1 focus:ring-primary w-48 transition-all duration-300 focus:w-64 outline-none" placeholder="Quick search..." type="text"/>
        </form>
    </div>
    
    <!-- Desktop Auth Links -->
    <div class="hidden lg:flex items-center gap-4">
        <c:choose>
            <c:when test="${not empty sessionScope.username}">
                <span class="text-sm font-bold text-primary">${sessionScope.username}</span>
                <a href="${pageContext.request.contextPath}/logout" class="text-slate-500 dark:text-slate-400 hover:text-[#001264] transition-colors text-sm text-decoration-none" style="text-decoration: none;">Logout</a>
            </c:when>
            <c:otherwise>
                <a href="${pageContext.request.contextPath}/login" class="text-slate-500 dark:text-slate-400 hover:text-[#001264] transition-colors text-sm text-decoration-none" style="text-decoration: none;">Login</a>
                <a href="${pageContext.request.contextPath}/register" class="bg-gradient-to-br from-primary to-primary-container text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow-md hover:opacity-90 transition-opacity text-decoration-none" style="text-decoration: none;">Sign Up</a>
            </c:otherwise>
        </c:choose>
    </div>

    <!-- Mobile Hamburger Button -->
    <button id="mobile-menu-btn" class="lg:hidden p-2 text-primary focus:outline-none rounded-lg hover:bg-surface-container-low transition-colors">
        <span class="material-symbols-outlined text-2xl pointer-events-none">menu</span>
    </button>
</div>
</div>

<!-- Mobile Dropdown Drawer -->
<div id="mobile-menu" class="hidden lg:hidden bg-white dark:bg-slate-900 border-b border-slate-100/20 absolute w-full left-0 top-full shadow-lg">
    <div class="flex flex-col px-6 py-4 gap-4 font-manrope font-medium">
        <a class="text-[#001264] dark:text-blue-400 py-2 border-b border-surface-dim hover:text-primary transition-colors text-decoration-none" style="text-decoration: none;" href="${pageContext.request.contextPath}/songs" onclick="closeMobileMenu()">Songs</a>
        <a class="text-slate-600 dark:text-slate-400 py-2 border-b border-surface-dim hover:text-[#001264] transition-colors text-decoration-none" style="text-decoration: none;" href="${pageContext.request.contextPath}/leaflet/new" onclick="closeMobileMenu()">Leaflet Builder</a>
        <c:choose>
            <c:when test="${not empty sessionScope.username}">
                <a class="text-slate-600 dark:text-slate-400 py-2 border-b border-surface-dim hover:text-[#001264] transition-colors text-decoration-none" style="text-decoration: none;" href="${pageContext.request.contextPath}/setlist/my" onclick="closeMobileMenu()">Setlists</a>
                <a class="text-slate-600 dark:text-slate-400 py-2 border-b border-surface-dim hover:text-[#001264] transition-colors text-decoration-none" style="text-decoration: none;" href="${pageContext.request.contextPath}/account" onclick="closeMobileMenu()">My Account (${sessionScope.username})</a>
                <a href="${pageContext.request.contextPath}/logout" class="text-error font-bold py-2 hover:text-error-container transition-colors text-decoration-none" style="text-decoration: none;" onclick="closeMobileMenu()">Logout</a>
            </c:when>
            <c:otherwise>
                <a href="javascript:void(0)" class="text-slate-400 dark:text-slate-600 py-2 border-b border-surface-dim cursor-not-allowed text-decoration-none" style="text-decoration: none;" title="Login to create setlists" onclick="closeMobileMenu()">Setlists</a>
                <a href="${pageContext.request.contextPath}/login" class="text-slate-600 dark:text-slate-400 py-2 border-b border-surface-dim hover:text-[#001264] transition-colors text-decoration-none" style="text-decoration: none;" onclick="closeMobileMenu()">Login</a>
                <a href="${pageContext.request.contextPath}/register" class="text-primary font-bold py-2 hover:text-primary-container transition-colors text-decoration-none" style="text-decoration: none;" onclick="closeMobileMenu()">Sign Up</a>
            </c:otherwise>
        </c:choose>
        
        <!-- Mobile Search -->
        <form action="${pageContext.request.contextPath}/search" method="get" class="relative mt-2 md:hidden">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
            <input name="q" class="w-full pl-10 pr-4 py-3 bg-surface-container-low border-none rounded-lg text-sm outline-none" placeholder="Search songs..." type="text"/>
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
