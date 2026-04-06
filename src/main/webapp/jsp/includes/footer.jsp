<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<footer class="no-print w-full py-12 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 font-manrope text-xs uppercase tracking-widest opacity-80 hover:opacity-100 transition-all mt-auto z-50 relative">
    <div class="max-w-[1920px] mx-auto px-6 md:px-24 flex flex-col md:flex-row justify-between items-center gap-4">
        <div class="text-slate-400 dark:text-slate-500">© 2026 The Resonant Archive. All rights reserved.</div>
        <div class="flex flex-wrapjustify-center gap-8">
            <a class="text-slate-400 hover:text-indigo-500 underline underline-offset-4" href="#">Privacy Policy</a>
            <a class="text-slate-400 hover:text-indigo-500 underline underline-offset-4" href="#">Terms of Service</a>
            <a class="text-slate-400 hover:text-indigo-500 underline underline-offset-4" href="mailto:support@resonantarchive.com">Contact Support</a>
            <c:if test="${sessionScope.user != null && sessionScope.user.role == 'admin'}">
                <a class="text-indigo-600 underline underline-offset-4" href="${pageContext.request.contextPath}/worship?action=adminDashboard">Admin Console</a>
            </c:if>
        </div>
    </div>
</footer>
