<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html class="light" lang="en">
<head>
    <title>Manage Songs — Admin</title>
    <jsp:include page="/jsp/includes/head.jsp"/>
</head>
<body class="bg-surface font-body text-on-surface flex flex-col min-h-screen">
    <jsp:include page="/jsp/navbar.jsp"/>

    <main class="flex-grow max-w-[1920px] mx-auto w-full px-6 md:px-24 py-12">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h1 class="text-3xl font-headline font-extrabold tracking-tight text-on-surface">Manage Songs</h1>
            <a href="${pageContext.request.contextPath}/admin/add" class="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary-container transition-all flex items-center gap-2 text-decoration-none" style="text-decoration: none;">
                <span class="material-symbols-outlined text-[20px]">add_circle</span> Add Song
            </a>
        </div>

        <div class="bg-surface-container-lowest rounded-3xl shadow-sm border border-surface-dim overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-surface-container-low border-b border-surface-dim">
                            <th class="py-4 px-6 text-xs font-bold text-outline uppercase tracking-wider">#</th>
                            <th class="py-4 px-6 text-xs font-bold text-outline uppercase tracking-wider">Title</th>
                            <th class="py-4 px-6 text-xs font-bold text-outline uppercase tracking-wider">Artist</th>
                            <th class="py-4 px-6 text-xs font-bold text-outline uppercase tracking-wider">Key</th>
                            <th class="py-4 px-6 text-xs font-bold text-outline uppercase tracking-wider">Language</th>
                            <th class="py-4 px-6 text-xs font-bold text-outline uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-surface-dim">
                        <c:forEach var="song" items="${songs}" varStatus="loop">
                            <tr class="hover:bg-surface-container-low/50 transition-colors">
                                <td class="py-4 px-6 text-sm font-semibold text-outline-variant">
                                    ${song.songNumber > 0 ? song.songNumber : loop.index + 1}
                                </td>
                                <td class="py-4 px-6 text-sm font-bold text-on-surface">
                                    ${song.title}
                                </td>
                                <td class="py-4 px-6 text-sm font-medium text-on-surface-variant max-w-[200px] truncate">
                                    ${song.artist}
                                </td>
                                <td class="py-4 px-6 text-sm">
                                    <span class="px-2 py-1 bg-primary-fixed text-on-primary-fixed text-[10px] font-bold uppercase tracking-widest rounded-md">${song.originalKey}</span>
                                </td>
                                <td class="py-4 px-6 text-sm">
                                    <span class="px-2 py-1 bg-surface-container-high text-on-surface text-[10px] font-bold uppercase tracking-widest rounded-md capitalize">${song.language}</span>
                                </td>
                                <td class="py-4 px-6 text-sm text-right whitespace-nowrap">
                                    <div class="flex items-center justify-end gap-2">
                                        <a href="${pageContext.request.contextPath}/admin/edit?id=${song.id}" class="p-2 text-outline hover:text-primary hover:bg-primary-container rounded-lg transition-colors flex items-center justify-center text-decoration-none" title="Edit" style="text-decoration: none;">
                                            <span class="material-symbols-outlined text-[18px]">edit</span>
                                        </a>
                                        <form method="post" action="${pageContext.request.contextPath}/admin/delete" class="inline" onsubmit="return confirm('Delete this song permanently?')">
                                            <input type="hidden" name="id" value="${song.id}">
                                            <button type="submit" class="p-2 text-outline hover:text-error hover:bg-error-container rounded-lg transition-colors flex items-center justify-center" title="Delete">
                                                <span class="material-symbols-outlined text-[18px]">delete</span>
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        </c:forEach>
                        
                        <c:if test="${empty songs}">
                            <tr>
                                <td colspan="6" class="py-12 text-center text-on-surface-variant">
                                    <span class="material-symbols-outlined text-4xl text-outline mb-2">music_off</span>
                                    <p class="font-semibold">No songs found.</p>
                                </td>
                            </tr>
                        </c:if>
                    </tbody>
                </table>
            </div>
        </div>
    </main>

    <jsp:include page="/jsp/includes/footer.jsp"/>
</body>
</html>
