<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="en" class="light">
<head>
    <jsp:include page="/jsp/includes/head.jsp" />
    <title>Create Setlist - Worship Song Library</title>
</head>
<body class="bg-surface text-on-surface font-manrope min-h-screen flex flex-col">

<jsp:include page="/jsp/navbar.jsp" />

<div class="flex-grow max-w-2xl mx-auto w-full px-4 py-12">
    <a href="${pageContext.request.contextPath}/setlist/my" class="inline-flex items-center gap-1 text-primary font-bold mb-6 hover:underline text-decoration-none" style="text-decoration: none;">
        <span class="material-symbols-outlined text-sm">arrow_back</span> Back to Setlists
    </a>
    
    <div class="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100 dark:border-slate-700">
        <h1 class="text-3xl font-black mb-8 text-on-surface uppercase font-headline">Create New Setlist</h1>
        
        <form action="${pageContext.request.contextPath}/setlist/new" method="POST" class="space-y-6">
            <div>
                <label for="title" class="block text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Setlist Title</label>
                <input type="text" id="title" name="title" required placeholder="e.g. Sunday Morning Service" 
                       class="w-full bg-surface-container-low border-2 border-surface-dim rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-medium">
            </div>
            
            <div>
                <label for="occasion" class="block text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Occasion Type</label>
                <select id="occasion" name="occasion"
                        class="w-full bg-surface-container-low border-2 border-surface-dim rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-medium appearance-none cursor-pointer">
                    <option value="Sunday Service">Sunday Service</option>
                    <option value="Christmas">Christmas</option>
                    <option value="Easter">Easter</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Funeral">Funeral</option>
                    <option value="Youth">Youth</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            
            <div class="pt-4">
                <button type="submit" class="w-full bg-gradient-to-br from-primary to-primary-container text-white py-4 rounded-xl font-bold shadow-md hover:shadow-lg transition-all text-lg">
                    Create & Continue
                </button>
            </div>
        </form>
    </div>
</div>

</body>
</html>
