<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html class="light" lang="en">
<head>
    <title>Login — Worship Song Library</title>
    <jsp:include page="/jsp/includes/head.jsp"/>
</head>
<body class="bg-surface font-body text-on-surface flex flex-col min-h-screen">
    <jsp:include page="/jsp/navbar.jsp"/>

    <main class="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full bg-surface-container-lowest p-8 rounded-3xl shadow-lg border border-surface-dim">
            <div class="text-center mb-8">
                <h2 class="text-3xl font-headline font-extrabold text-on-surface mb-2 tracking-tight">Welcome back</h2>
                <p class="text-on-surface-variant font-medium">Sign in to access your personal song edits</p>
            </div>

            <c:if test="${not empty error}">
                <div class="mb-6 p-4 bg-error-container text-on-error-container rounded-xl text-sm font-semibold border border-error/20 flex items-start gap-3">
                    <span class="material-symbols-outlined text-[20px]">error</span>
                    <span>${error}</span>
                </div>
            </c:if>

            <form method="post" action="${pageContext.request.contextPath}/login" class="space-y-6">
                <div>
                    <label for="username" class="block text-sm font-bold text-on-surface mb-2">Username</label>
                    <input type="text" id="username" name="username" required autofocus placeholder="Enter your username"
                           class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none placeholder:text-outline/70 font-medium">
                </div>
                
                <div>
                    <label for="password" class="block text-sm font-bold text-on-surface mb-2">Password</label>
                    <input type="password" id="password" name="password" required placeholder="Enter your password"
                           class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none placeholder:text-outline/70 font-medium">
                </div>

                <div class="pt-2">
                    <button type="submit" class="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary-container transition-all flex justify-center items-center gap-2">
                        Sign In <span class="material-symbols-outlined text-[20px]">login</span>
                    </button>
                </div>
            </form>

            <div class="mt-8 pt-6 border-t border-surface-dim text-center">
                <span class="text-on-surface-variant font-medium">Don't have an account?</span>
                <a href="${pageContext.request.contextPath}/register" class="text-primary font-bold hover:text-primary-container transition-colors ml-1">Sign up</a>
            </div>
        </div>
    </main>

    <jsp:include page="/jsp/includes/footer.jsp"/>
</body>
</html>
