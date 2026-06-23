<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html class="light" lang="en">
<head>
    <title>My Leaflets — Worship Song Library</title>
    <jsp:include page="/jsp/includes/head.jsp"/>
</head>
<body class="bg-surface font-body text-on-surface flex flex-col min-h-screen">
    <jsp:include page="/jsp/navbar.jsp"/>

    <main class="flex-grow max-w-[1920px] mx-auto w-full px-6 md:px-24 py-12 max-w-5xl">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h1 class="text-3xl font-headline font-extrabold tracking-tight text-on-surface">My Leaflets</h1>
            <a href="${pageContext.request.contextPath}/leaflet/new" class="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary-container transition-all flex items-center gap-2 text-decoration-none" style="text-decoration: none;">
                <span class="material-symbols-outlined text-[20px]">add_circle</span> New Leaflet
            </a>
        </div>

        <c:if test="${empty leaflets}">
            <div class="bg-surface-container-lowest p-12 rounded-3xl shadow-sm border border-surface-dim text-center">
                <span class="material-symbols-outlined text-6xl text-outline mb-4 block">sticky_note_2</span>
                <p class="text-xl font-headline font-bold text-on-surface mb-2">No leaflets yet</p>
                <p class="text-on-surface-variant text-sm mb-6">Create your first custom leaflet for a church service or worship event.</p>
                <a href="${pageContext.request.contextPath}/leaflet/new" class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary-container transition-all text-decoration-none" style="text-decoration: none;">
                    Build a Leaflet
                </a>
            </div>
        </c:if>

        <c:if test="${not empty leaflets}">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <c:forEach var="leaflet" items="${leaflets}">
                    <div class="bg-surface-container p-6 rounded-2xl shadow-sm border border-surface-dim hover:border-primary/40 transition-all flex flex-col h-full group">
                        <div class="flex-grow">
                            <h2 class="text-lg font-headline font-bold text-on-surface group-hover:text-primary transition-colors leading-tight mb-1">
                                ${leaflet.title}
                            </h2>
                            <p class="text-sm font-medium text-on-surface-variant mb-4">
                                ${leaflet.occasionName}
                            </p>
                        </div>
                        
                        <div class="flex justify-between items-end pt-4 border-t border-surface-dim mt-4">
                            <div class="flex flex-col">
                                <span class="text-[10px] font-bold text-outline uppercase tracking-wider">Created</span>
                                <span class="text-xs text-outline-variant">${leaflet.createdAt}</span>
                            </div>
                            
                            <a href="${pageContext.request.contextPath}/leaflet/print?id=${leaflet.id}" target="_blank" class="px-4 py-2 bg-primary-container text-on-primary-container hover:bg-primary hover:text-white font-bold rounded-lg transition-colors flex items-center gap-1 text-sm text-decoration-none" style="text-decoration: none;">
                                <span class="material-symbols-outlined text-[18px]">print</span> Print
                            </a>
                        </div>
                    </div>
                </c:forEach>
            </div>
        </c:if>
    </main>

    <jsp:include page="/jsp/includes/footer.jsp"/>
</body>
</html>
