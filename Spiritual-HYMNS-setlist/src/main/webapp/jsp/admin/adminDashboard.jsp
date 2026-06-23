<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html class="light" lang="en">
<head>
    <title>Admin Dashboard — Worship Song Library</title>
    <jsp:include page="/jsp/includes/head.jsp"/>
</head>
<body class="bg-surface font-body text-on-surface flex flex-col min-h-screen">
    <jsp:include page="/jsp/navbar.jsp"/>

    <main class="flex-grow max-w-[1920px] mx-auto w-full px-6 md:px-24 py-12">
        <h1 class="text-3xl font-headline font-extrabold tracking-tight text-on-surface mb-8">Admin Dashboard</h1>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div class="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-surface-dim flex flex-col items-center justify-center gap-2">
                <span class="text-4xl font-headline font-black text-primary leading-none">${totalSongs}</span>
                <span class="text-sm font-bold text-outline uppercase tracking-widest">Total Songs</span>
            </div>
            <div class="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-surface-dim flex flex-col items-center justify-center gap-2">
                <span class="text-4xl font-headline font-black text-secondary leading-none">${totalUsers}</span>
                <span class="text-sm font-bold text-outline uppercase tracking-widest">Registered Users</span>
            </div>
            <div class="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-surface-dim flex flex-col items-center justify-center gap-2">
                <span class="text-4xl font-headline font-black text-error leading-none">${openReports}</span>
                <span class="text-sm font-bold text-outline uppercase tracking-widest">Open Reports</span>
            </div>
        </div>

        <h2 class="text-xl font-headline font-bold text-on-surface mb-6">Quick Actions</h2>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <a href="${pageContext.request.contextPath}/admin/songs" class="group bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-dim hover:border-primary/40 hover:shadow-md transition-all flex flex-col items-center text-center gap-3 text-decoration-none" style="text-decoration: none;">
                <span class="material-symbols-outlined text-4xl text-outline group-hover:text-primary transition-colors">library_music</span>
                <span class="font-bold text-on-surface">Manage Songs</span>
            </a>
            <a href="${pageContext.request.contextPath}/admin/add" class="group bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-dim hover:border-primary/40 hover:shadow-md transition-all flex flex-col items-center text-center gap-3 text-decoration-none" style="text-decoration: none;">
                <span class="material-symbols-outlined text-4xl text-outline group-hover:text-primary transition-colors">add_circle</span>
                <span class="font-bold text-on-surface">Add New Song</span>
            </a>
            <a href="${pageContext.request.contextPath}/admin/import" class="group bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-dim hover:border-primary/40 hover:shadow-md transition-all flex flex-col items-center text-center gap-3 text-decoration-none" style="text-decoration: none;">
                <span class="material-symbols-outlined text-4xl text-outline group-hover:text-primary transition-colors">upload_file</span>
                <span class="font-bold text-on-surface">Import Songs</span>
            </a>
            <a href="${pageContext.request.contextPath}/admin/reports" class="group bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-dim hover:border-primary/40 hover:shadow-md transition-all flex flex-col items-center text-center gap-3 text-decoration-none" style="text-decoration: none;">
                <span class="material-symbols-outlined text-4xl text-outline group-hover:text-primary transition-colors">report</span>
                <span class="font-bold text-on-surface">Chord Reports</span>
            </a>
            <a href="${pageContext.request.contextPath}/admin/users" class="group bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-dim hover:border-primary/40 hover:shadow-md transition-all flex flex-col items-center text-center gap-3 text-decoration-none" style="text-decoration: none;">
                <span class="material-symbols-outlined text-4xl text-outline group-hover:text-primary transition-colors">group</span>
                <span class="font-bold text-on-surface">Manage Users</span>
            </a>
        </div>
    </main>

    <jsp:include page="/jsp/includes/footer.jsp"/>
</body>
</html>
