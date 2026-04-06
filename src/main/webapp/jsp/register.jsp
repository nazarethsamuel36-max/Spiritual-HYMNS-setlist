<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html class="light" lang="en">
<head>
    <title>Register — Worship Song Library</title>
    <jsp:include page="/jsp/includes/head.jsp"/>
</head>
<body class="bg-surface font-body text-on-surface flex flex-col min-h-screen">
    <jsp:include page="/jsp/navbar.jsp"/>

    <main class="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full bg-surface-container-lowest p-8 rounded-3xl shadow-lg border border-surface-dim">
            <div class="text-center mb-8">
                <h2 class="text-3xl font-headline font-extrabold text-on-surface mb-2 tracking-tight">Create an account</h2>
                <p class="text-on-surface-variant font-medium">Save your personal chord edits and build leaflets</p>
            </div>

            <c:if test="${not empty error}">
                <div class="mb-6 p-4 bg-error-container text-on-error-container rounded-xl text-sm font-semibold border border-error/20 flex items-start gap-3">
                    <span class="material-symbols-outlined text-[20px]">error</span>
                    <span>${error}</span>
                </div>
            </c:if>

            <div class="mb-8 p-4 bg-secondary-container text-on-secondary-container rounded-xl text-sm font-semibold border border-secondary/20 flex items-start gap-3 shadow-sm">
                <span class="text-xl leading-none">&#x1F4DD;</span>
                <span>If you've been editing songs as a guest, your edits will be saved to your account.</span>
            </div>

            <form method="post" action="${pageContext.request.contextPath}/register" class="space-y-5">
                <div>
                    <label for="username" class="block text-sm font-bold text-on-surface mb-2">Username</label>
                    <input type="text" id="username" name="username" required autofocus placeholder="Choose a username"
                           class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none placeholder:text-outline/70 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                </div>

                <div>
                    <label for="email" class="block text-sm font-bold text-on-surface mb-2">Email</label>
                    <input type="email" id="email" name="email" required placeholder="your@email.com"
                           class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none placeholder:text-outline/70 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                </div>

                <div>
                    <label for="password" class="block text-sm font-bold text-on-surface mb-2">Password</label>
                    <input type="password" id="password" name="password" required minlength="6" placeholder="At least 6 characters"
                           class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none placeholder:text-outline/70 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                </div>

                <div>
                    <label for="churchName" class="block text-sm font-bold text-on-surface mb-2">Church Name <span class="text-outline-variant text-xs font-normal">(optional)</span></label>
                    <input type="text" id="churchName" name="churchName" placeholder="Your church name"
                           class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none placeholder:text-outline/70 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                </div>

                <div class="pt-4">
                    <button type="submit" class="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary-container transition-all flex justify-center items-center gap-2">
                        Create Account <span class="material-symbols-outlined text-[20px]">person_add</span>
                    </button>
                </div>
            </form>

            <div class="mt-8 pt-6 border-t border-surface-dim text-center">
                <span class="text-on-surface-variant font-medium">Already have an account?</span>
                <a href="${pageContext.request.contextPath}/login" class="text-primary font-bold hover:text-primary-container transition-colors ml-1">Sign in</a>
            </div>
        </div>
    </main>

    <jsp:include page="/jsp/includes/footer.jsp"/>
</body>
</html>
