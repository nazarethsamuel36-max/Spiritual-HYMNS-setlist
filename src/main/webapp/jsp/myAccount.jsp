<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html class="light" lang="en">
<head>
    <title>My Account — Worship Song Library</title>
    <jsp:include page="/jsp/includes/head.jsp"/>
</head>
<body class="bg-surface font-body text-on-surface flex flex-col min-h-screen">
    <jsp:include page="/jsp/navbar.jsp"/>

    <main class="flex-grow max-w-[1920px] mx-auto w-full px-6 md:px-24 py-12">
        <h1 class="text-3xl font-headline font-extrabold tracking-tight text-on-surface mb-8">My Account</h1>

        <c:if test="${not empty success}">
            <div class="mb-8 p-4 bg-primary-container text-on-primary-container rounded-xl text-sm font-semibold border border-primary/20 flex items-start gap-3 shadow-sm max-w-3xl">
                <span class="material-symbols-outlined text-[20px]">check_circle</span>
                <span>${success}</span>
            </div>
        </c:if>
        
        <c:if test="${not empty error}">
            <div class="mb-8 p-4 bg-error-container text-on-error-container rounded-xl text-sm font-semibold border border-error/20 flex items-start gap-3 shadow-sm max-w-3xl">
                <span class="material-symbols-outlined text-[20px]">error</span>
                <span>${error}</span>
            </div>
        </c:if>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl">
            <!-- Left Column: Profile form -->
            <div class="lg:col-span-2 space-y-8">
                <div class="bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-surface-dim">
                    <div class="flex items-center gap-4 mb-8 pb-6 border-b border-surface-dim">
                        <div class="w-16 h-16 rounded-full bg-primary-container text-primary flex items-center justify-center text-2xl font-bold uppercase ring-4 ring-white shadow-md">
                            ${user.username.substring(0, 1)}
                        </div>
                        <div>
                            <h2 class="text-2xl font-headline font-bold text-on-surface">Profile Settings</h2>
                            <p class="text-on-surface-variant font-medium text-sm">Update your personal information and preferences.</p>
                        </div>
                    </div>

                    <form method="post" action="${pageContext.request.contextPath}/account" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label for="username" class="block text-sm font-bold text-on-surface mb-2">Username</label>
                                <input type="text" id="username" value="${user.username}" disabled
                                       class="w-full px-4 py-3 bg-surface-container border border-outline-variant/50 rounded-xl text-outline font-medium cursor-not-allowed">
                            </div>
                            
                            <div>
                                <label for="email" class="block text-sm font-bold text-on-surface mb-2">Email</label>
                                <input type="email" id="email" name="email" value="${user.email}"
                                       class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none font-medium">
                            </div>
                            
                            <div class="md:col-span-2">
                                <label for="churchName" class="block text-sm font-bold text-on-surface mb-2">Church Name</label>
                                <input type="text" id="churchName" name="churchName" value="${user.churchName}"
                                       class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none font-medium">
                            </div>
                            
                            <div>
                                <label for="instrument" class="block text-sm font-bold text-on-surface mb-2">Primary Instrument</label>
                                <input type="text" id="instrument" name="instrument" value="${user.instrument}" placeholder="e.g., Guitar, Piano"
                                       class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none placeholder:text-outline/50 font-medium">
                            </div>
                            
                            <div>
                                <label for="defaultKey" class="block text-sm font-bold text-on-surface mb-2">Preferred Key</label>
                                <input type="text" id="defaultKey" name="defaultKey" value="${user.defaultKey}" placeholder="e.g., G"
                                       class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none placeholder:text-outline/50 font-medium uppercase">
                            </div>
                        </div>

                        <div class="pt-6 border-t border-surface-dim flex justify-end">
                            <button type="submit" class="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary-container transition-all flex items-center gap-2">
                                Save Changes <span class="material-symbols-outlined text-[18px]">save</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Right Column: Sidebar -->
            <div class="space-y-8">
                <!-- Account Info Widget -->
                <div class="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-surface-dim">
                    <h3 class="text-lg font-headline font-bold text-on-surface mb-4 flex items-center gap-2">
                        <span class="material-symbols-outlined text-outline">info</span> Account Info
                    </h3>
                    
                    <div class="space-y-3">
                        <div class="flex justify-between items-center py-2 border-b border-surface-dim">
                            <span class="text-on-surface-variant font-medium text-sm">Role</span>
                            <span class="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md ${user.role == 'admin' ? 'bg-error-container text-on-error-container' : 'bg-secondary-container text-on-secondary-container'}">${user.role}</span>
                        </div>
                        <div class="flex justify-between items-center py-2 border-b border-surface-dim">
                            <span class="text-on-surface-variant font-medium text-sm">Joined</span>
                            <span class="text-on-surface font-semibold text-sm">${user.createdAt}</span>
                        </div>
                        <div class="flex justify-between items-center py-2 relative group cursor-pointer overflow-hidden rounded">
                            <span class="text-on-surface-variant font-medium text-sm">Trend Metric</span>
                            <span class="text-primary font-bold text-sm">+12% this month</span>
                        </div>
                    </div>
                </div>

                <!-- Personal Versions Widget -->
                <div class="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-surface-dim">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-lg font-headline font-bold text-on-surface flex items-center gap-2">
                            <span class="material-symbols-outlined text-outline">library_music</span> My Edits
                        </h3>
                        <span class="bg-surface-container-high text-on-surface text-xs font-bold px-2 py-1 rounded-md">${empty userSongs ? '0' : userSongs.size()}</span>
                    </div>

                    <c:choose>
                        <c:when test="${empty userSongs}">
                            <div class="text-center py-8 bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/50">
                                <span class="material-symbols-outlined text-4xl text-outline mb-2">music_off</span>
                                <p class="text-on-surface font-semibold text-sm">No personal edits yet.</p>
                                <p class="text-outline text-xs mt-1 px-4">Edit a song and save your personal version to see it here.</p>
                            </div>
                        </c:when>
                        <c:otherwise>
                            <div class="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                <c:forEach var="us" items="${userSongs}">
                                    <div class="group bg-surface-container p-4 rounded-2xl border border-surface-dim hover:border-primary/30 transition-all flex flex-col gap-3">
                                        <div class="flex justify-between items-start">
                                            <a href="${pageContext.request.contextPath}/song?id=${us.songId}" class="font-headline font-bold text-on-surface group-hover:text-primary transition-colors leading-tight text-decoration-none" style="text-decoration: none;">
                                                ${us.songTitle}
                                            </a>
                                        </div>
                                        
                                        <div class="flex justify-between items-end">
                                            <div class="flex flex-col gap-1">
                                                <c:if test="${not empty us.customKey}">
                                                    <span class="w-fit px-2 py-0.5 bg-primary-fixed text-on-primary-fixed text-[10px] font-bold uppercase tracking-widest rounded">Key: ${us.customKey}</span>
                                                </c:if>
                                                <span class="text-[10px] text-outline-variant font-medium">Edited: ${us.updatedAt}</span>
                                            </div>
                                            
                                            <form method="post" action="${pageContext.request.contextPath}/song/reset" onsubmit="return confirm('Reset this song to master version? All your changes will be lost permanently.')">
                                                <input type="hidden" name="songId" value="${us.songId}">
                                                <button type="submit" class="p-2 text-outline hover:text-error hover:bg-error-container rounded-lg transition-colors" title="Delete personal version">
                                                    <span class="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </c:forEach>
                            </div>
                        </c:otherwise>
                    </c:choose>
                </div>
            </div>
        </div>
    </main>

    <jsp:include page="/jsp/includes/footer.jsp"/>

    <style>
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: var(--color-outline-variant); border-radius: 20px; border: 3px solid transparent; background-clip: content-box; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: var(--color-outline); }
    </style>
</body>
</html>
