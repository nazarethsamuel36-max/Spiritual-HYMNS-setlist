<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html class="light" lang="en">
<head>
    <title>Chord Reports — Admin</title>
    <jsp:include page="/jsp/includes/head.jsp"/>
</head>
<body class="bg-surface font-body text-on-surface flex flex-col min-h-screen">
    <jsp:include page="/jsp/navbar.jsp"/>

    <main class="flex-grow max-w-[1920px] mx-auto w-full px-6 md:px-24 py-12">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <h1 class="text-3xl font-headline font-extrabold tracking-tight text-on-surface">Chord Reports</h1>
            <div class="flex items-center gap-2 bg-surface-container-low p-1 rounded-xl shadow-sm border border-outline-variant/20">
                <a href="${pageContext.request.contextPath}/admin/reports" class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${empty param.filter || param.filter == 'all' ? 'bg-white text-primary shadow-sm ring-1 ring-black/5' : 'text-on-surface-variant hover:bg-surface-container-high'} text-decoration-none" style="text-decoration: none;">All</a>
                <a href="${pageContext.request.contextPath}/admin/reports?filter=pending" class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${param.filter == 'pending' ? 'bg-white text-primary shadow-sm ring-1 ring-black/5' : 'text-on-surface-variant hover:bg-surface-container-high'} text-decoration-none" style="text-decoration: none;">Pending</a>
                <a href="${pageContext.request.contextPath}/admin/reports?filter=resolved" class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${param.filter == 'resolved' ? 'bg-white text-primary shadow-sm ring-1 ring-black/5' : 'text-on-surface-variant hover:bg-surface-container-high'} text-decoration-none" style="text-decoration: none;">Resolved</a>
            </div>
        </div>

        <c:if test="${empty reports}">
            <div class="bg-surface-container-lowest p-12 rounded-3xl shadow-sm border border-surface-dim text-center">
                <span class="material-symbols-outlined text-5xl text-success mb-4 block">check_circle</span>
                <h2 class="text-xl font-headline font-bold text-on-surface mb-2">No Reports Found</h2>
                <p class="text-on-surface-variant text-sm">No chord reports match your filter criteria.</p>
            </div>
        </c:if>

        <c:if test="${not empty reports}">
            <div class="bg-surface-container-lowest rounded-3xl shadow-sm border border-surface-dim overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-surface-container-low border-b border-surface-dim">
                                <th class="py-4 px-6 text-xs font-bold text-outline uppercase tracking-wider">Song</th>
                                <th class="py-4 px-6 text-xs font-bold text-outline uppercase tracking-wider">Reporter</th>
                                <th class="py-4 px-6 text-xs font-bold text-outline uppercase tracking-wider">Reason</th>
                                <th class="py-4 px-6 text-xs font-bold text-outline uppercase tracking-wider">Status</th>
                                <th class="py-4 px-6 text-xs font-bold text-outline uppercase tracking-wider min-w-[300px]">Suggestion</th>
                                <th class="py-4 px-6 text-xs font-bold text-outline uppercase tracking-wider">Date</th>
                                <th class="py-4 px-6 text-xs font-bold text-outline uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-surface-dim">
                            <c:forEach var="report" items="${reports}">
                                <tr class="hover:bg-surface-container-low/50 transition-colors group">
                                    <td class="py-4 px-6 text-sm font-bold text-on-surface">
                                        <a href="${pageContext.request.contextPath}/song?id=${report.songId}" class="hover:text-primary transition-colors text-decoration-none" style="text-decoration: none;">
                                            ${report.songTitle}
                                        </a>
                                    </td>
                                    <td class="py-4 px-6 text-sm font-medium text-on-surface-variant">
                                        ${not empty report.reporterUsername ? report.reporterUsername : 'Guest'}
                                    </td>
                                    <td class="py-4 px-6 text-sm">
                                        <span class="px-3 py-1 bg-tertiary-container text-on-tertiary-container text-[10px] font-bold uppercase tracking-widest rounded-md">
                                            ${report.reason}
                                        </span>
                                    </td>
                                    <td class="py-4 px-6 text-sm">
                                        <c:choose>
                                            <c:when test="${report.status == 'fixed'}">
                                                <span class="px-3 py-1 bg-success-container/20 text-success text-[10px] font-bold uppercase tracking-widest rounded-md border border-success/30">
                                                    Resolved
                                                </span>
                                            </c:when>
                                            <c:otherwise>
                                                <span class="px-3 py-1 bg-error-container/20 text-error text-[10px] font-bold uppercase tracking-widest rounded-md border border-error/30">
                                                    Pending
                                                </span>
                                            </c:otherwise>
                                        </c:choose>
                                    </td>
                                    <td class="py-4 px-6 text-sm text-on-surface-variant leading-relaxed">
                                        ${report.suggestion}
                                    </td>
                                    <td class="py-4 px-6 text-xs font-medium text-outline-variant whitespace-nowrap">
                                        ${report.createdAt}
                                    </td>
                                    <td class="py-4 px-6 text-sm text-right whitespace-nowrap">
                                        <form method="post" action="${pageContext.request.contextPath}/admin/report/resolve" class="flex justify-end gap-2">
                                            <input type="hidden" name="id" value="${report.id}">
                                            <button type="submit" name="status" value="fixed" class="px-3 py-1.5 bg-success-container/30 text-success hover:bg-success hover:text-white font-bold text-xs rounded-lg transition-all border border-success/30 flex items-center gap-1">
                                                <span class="material-symbols-outlined text-[16px]">check</span> Fixed
                                            </button>
                                            <button type="submit" name="status" value="rejected" class="px-3 py-1.5 bg-error-container/30 text-error hover:bg-error hover:text-white font-bold text-xs rounded-lg transition-all border border-error/30 flex items-center gap-1">
                                                <span class="material-symbols-outlined text-[16px]">close</span> Reject
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            </c:forEach>
                        </tbody>
                    </table>
                </div>
            </div>
        </c:if>
    </main>

    <jsp:include page="/jsp/includes/footer.jsp"/>
</body>
</html>
