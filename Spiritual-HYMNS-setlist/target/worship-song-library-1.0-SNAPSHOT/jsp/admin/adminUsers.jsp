<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html class="light" lang="en">
<head>
    <title>Manage Users — Admin</title>
    <jsp:include page="/jsp/includes/head.jsp"/>
</head>
<body class="bg-surface font-body text-on-surface flex flex-col min-h-screen">
    <jsp:include page="/jsp/navbar.jsp"/>

    <main class="flex-grow max-w-[1920px] mx-auto w-full px-6 md:px-24 py-12">
        <h1 class="text-3xl font-headline font-extrabold tracking-tight text-on-surface mb-8">Manage Users</h1>

        <div class="bg-surface-container-lowest rounded-3xl shadow-sm border border-surface-dim overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-surface-container-low border-b border-surface-dim">
                            <th class="py-4 px-6 text-xs font-bold text-outline uppercase tracking-wider">Username</th>
                            <th class="py-4 px-6 text-xs font-bold text-outline uppercase tracking-wider">Email</th>
                            <th class="py-4 px-6 text-xs font-bold text-outline uppercase tracking-wider">Role</th>
                            <th class="py-4 px-6 text-xs font-bold text-outline uppercase tracking-wider">Church</th>
                            <th class="py-4 px-6 text-xs font-bold text-outline uppercase tracking-wider">Joined</th>
                            <th class="py-4 px-6 text-xs font-bold text-outline uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-surface-dim">
                        <c:forEach var="user" items="${users}">
                            <tr class="hover:bg-surface-container-low/50 transition-colors">
                                <td class="py-4 px-6 text-sm font-bold text-on-surface">
                                    ${user.username}
                                </td>
                                <td class="py-4 px-6 text-sm font-medium text-on-surface-variant">
                                    ${user.email}
                                </td>
                                <td class="py-4 px-6 text-sm">
                                    <span class="px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md ${user.role == 'admin' ? 'bg-error-container text-on-error-container' : 'bg-secondary-container text-on-secondary-container'}">
                                        ${user.role}
                                    </span>
                                </td>
                                <td class="py-4 px-6 text-sm font-medium text-on-surface-variant">
                                    ${user.churchName}
                                </td>
                                <td class="py-4 px-6 text-xs font-medium text-outline-variant">
                                    ${user.createdAt}
                                </td>
                                <td class="py-4 px-6 text-sm text-right">
                                    <form method="post" action="${pageContext.request.contextPath}/admin/role" class="inline-block">
                                        <input type="hidden" name="userId" value="${user.id}">
                                        <select name="role" onchange="this.form.submit()" class="px-3 py-1.5 bg-surface-container border border-outline-variant/30 rounded-lg text-sm font-semibold text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors cursor-pointer">
                                            <option value="user" ${user.role == 'user' ? 'selected' : ''}>User</option>
                                            <option value="admin" ${user.role == 'admin' ? 'selected' : ''}>Admin</option>
                                        </select>
                                    </form>
                                </td>
                            </tr>
                        </c:forEach>
                    </tbody>
                </table>
            </div>
        </div>
    </main>

    <jsp:include page="/jsp/includes/footer.jsp"/>
</body>
</html>
