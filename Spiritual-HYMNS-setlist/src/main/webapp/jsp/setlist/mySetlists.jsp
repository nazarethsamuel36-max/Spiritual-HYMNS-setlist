<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>

<!DOCTYPE html>
<html lang="en" class="light">
<head>
    <jsp:include page="/jsp/includes/head.jsp" />
    <title>My Setlists - Worship Song Library</title>
</head>
<body class="bg-surface text-on-surface font-manrope min-h-screen flex flex-col transition-colors duration-300">

<jsp:include page="/jsp/navbar.jsp" />

<div class="flex-grow max-w-[1920px] mx-auto w-full px-4 md:px-8 py-8 md:py-12">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 class="text-4xl md:text-5xl font-black tracking-tight text-on-surface uppercase font-headline">My Setlists</h1>
            <p class="text-on-surface-variant font-medium mt-2">Manage and share your custom song collections.</p>
        </div>
        <a href="${pageContext.request.contextPath}/setlist/new" class="inline-flex items-center gap-2 bg-gradient-to-br from-primary to-primary-container text-white px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all text-decoration-none" style="text-decoration: none;">
            <span class="material-symbols-outlined text-sm">add_circle</span> Create New Setlist
        </a>
    </div>

    <!-- Setlist Grid -->
    <c:choose>
        <c:when test="${empty setlists}">
            <div class="bg-surface-container-low rounded-3xl p-12 text-center border border-surface-dim">
                <span class="material-symbols-outlined text-6xl text-primary opacity-50 mb-4 block">queue_music</span>
                <h3 class="text-2xl font-black mb-2 text-on-surface uppercase font-headline">No Setlists Yet</h3>
                <p class="text-on-surface-variant max-w-md mx-auto">Get started by creating your first setlist to organize songs for your next service or event.</p>
            </div>
        </c:when>
        <c:otherwise>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <c:forEach var="s" items="${setlists}">
                    <div class="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col hover:shadow-md transition-shadow">
                        <div class="flex-grow">
                            <div class="flex justify-between items-start mb-4">
                                <span class="bg-surface-container text-on-surface-variant text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">${s.occasion}</span>
                                <c:if test="${s.shared}">
                                    <span class="text-success material-symbols-outlined text-sm" title="Shared link generated">link</span>
                                </c:if>
                            </div>
                            <h3 class="text-2xl font-black text-on-surface mb-2 font-headline uppercase leading-tight">${s.title}</h3>
                            <p class="text-on-surface-variant font-medium flex items-center gap-2 mb-1">
                                <span class="material-symbols-outlined text-sm">music_note</span> ${s.songCount} Songs
                            </p>
                            <p class="text-slate-400 text-sm flex items-center gap-2">
                                <span class="material-symbols-outlined text-sm">calendar_month</span> 
                                ${s.createdAt}
                            </p>
                        </div>
                        
                        <!-- Actions -->
                        <div class="mt-6 pt-4 border-t border-surface-dim flex justify-between items-center gap-3">
                            <a href="${pageContext.request.contextPath}/setlist/${s.id}" class="flex-grow text-center py-2 bg-surface-container text-on-surface font-bold rounded-xl hover:bg-surface-dim transition-colors text-decoration-none" style="text-decoration: none;">View / Edit</a>
                            <button onclick="confirmDelete(${s.id}, this.getAttribute('data-title'))" data-title="${s.title}" class="p-2 text-error hover:bg-error-container rounded-xl transition-colors">
                                <span class="material-symbols-outlined">delete</span>
                            </button>
                        </div>
                    </div>
                </c:forEach>
            </div>
        </c:otherwise>
    </c:choose>
</div>

<!-- Delete Form -->
<form id="deleteForm" method="POST" class="hidden">
</form>

<script>
function confirmDelete(id, title) {
    if (confirm('Are you sure you want to delete "' + title + '"? This cannot be undone.')) {
        const form = document.getElementById('deleteForm');
        form.action = '${pageContext.request.contextPath}/setlist/' + id + '/delete';
        form.submit();
    }
}
</script>

</body>
</html>
