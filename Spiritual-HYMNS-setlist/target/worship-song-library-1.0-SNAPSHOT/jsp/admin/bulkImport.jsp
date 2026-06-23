<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fn" uri="jakarta.tags.functions" %>
<!DOCTYPE html>
<html class="light" lang="en">
<head>
    <title>Bulk Import — Admin Dashboard</title>
    <jsp:include page="/jsp/includes/head.jsp"/>
</head>
<body class="mesh-bg font-body text-on-surface flex min-h-screen flex-col">
    <jsp:include page="/jsp/navbar.jsp"/>

    <main class="relative z-10 mx-auto w-full max-w-6xl flex-grow px-6 py-12 md:px-12">
        <div class="mb-10 text-center">
            <h1 class="font-headline text-4xl font-black text-on-surface tracking-tight">Admin Dashboard</h1>
            <p class="text-on-surface-variant font-medium mt-2">Validate and commit JSON batches to the Prime Songbook</p>
        </div>

        <div class="surface-glass rounded-3xl p-6 md:p-10 shadow-lg border border-outline-variant/30">
            
            <c:if test="${not empty successMsg}">
                <div class="mb-6 rounded-xl bg-green-100 p-4 text-green-800 font-bold border border-green-300">
                    <span class="material-symbols-outlined align-middle mr-1">check_circle</span>
                    <c:out value="${successMsg}"/>
                </div>
            </c:if>

            <c:if test="${not empty errorMsg}">
                <div class="mb-6 rounded-xl bg-red-100 p-4 text-red-800 font-bold border border-red-300">
                    <span class="material-symbols-outlined align-middle mr-1">error</span>
                    <c:out value="${errorMsg}"/>
                </div>
            </c:if>

            <c:if test="${not empty validationErrors}">
                <div class="mb-6 rounded-xl bg-red-100 p-4 text-red-800 border border-red-300">
                    <h3 class="font-bold mb-2 flex items-center"><span class="material-symbols-outlined align-middle mr-2 mt-0.5">warning</span> Validation Failed</h3>
                    <ul class="list-disc pl-8 space-y-1 text-sm font-medium">
                        <c:forEach var="err" items="${validationErrors}">
                            <li><c:out value="${err}"/></li>
                        </c:forEach>
                    </ul>
                </div>
            </c:if>

            <form action="${pageContext.request.contextPath}/admin/bulk-import" method="post" class="space-y-6">
                <div>
                    <label class="block text-sm font-bold text-on-surface tracking-wide uppercase mb-2">Paste JSON Payload</label>
                    <textarea name="jsonInput" rows="15" 
                              class="w-full bg-surface-container-low border border-outline-variant/50 rounded-2xl p-4 font-mono text-sm placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-inner resize-y"
                              placeholder="[
  {
    &quot;number&quot;: 1,
    &quot;title&quot;: &quot;Song Title&quot;,
    &quot;language&quot;: &quot;english&quot;,
    &quot;sections&quot;: [ ... ]
  }
]"><c:out value="${jsonInput}"/></textarea>
                </div>

                <div class="flex flex-wrap gap-4 pt-2">
                    <button type="submit" name="action" value="preview" class="ui-btn-primary px-8 py-3 rounded-xl font-bold transition-all shadow-sm">
                        <span class="flex items-center gap-2"><span class="material-symbols-outlined">rule</span> Validate &amp; Preview</span>
                    </button>
                    
                    <c:if test="${previewMode}">
                        <button type="submit" name="action" value="commit" class="bg-tertiary text-on-tertiary px-8 py-3 rounded-xl font-bold transition-all hover:bg-tertiary-container shadow-sm border border-tertiary">
                            <span class="flex items-center gap-2"><span class="material-symbols-outlined">upload</span> Commit to Database</span>
                        </button>
                    </c:if>
                </div>
            </form>

            <!-- Preview Data -->
            <c:if test="${previewMode and not empty parsedSongs}">
                <div class="mt-12">
                    <h2 class="text-2xl font-headline font-black mb-6">Preview (<c:out value="${fn:length(parsedSongs)}"/> Songs Validated)</h2>
                    
                    <div class="space-y-4">
                        <c:forEach var="s" items="${parsedSongs}">
                            <div class="surface-solid rounded-2xl p-5 border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h3 class="font-bold text-lg text-primary">
                                        <c:choose>
                                            <c:when test="${s.songNumber > 0}">[<c:out value="${s.songNumber}"/>] </c:when>
                                        </c:choose>
                                        <c:out value="${s.title}"/>
                                    </h3>
                                    <div class="flex items-center gap-3 mt-2 text-sm text-on-surface-variant font-medium">
                                        <span class="uppercase tracking-widest text-xs border border-outline-variant/40 rounded px-1.5 py-0.5"><c:out value="${s.language}"/></span>
                                        <span><c:out value="${fn:length(s.sections)}"/> Sections</span>
                                        <span>Target: <span class="text-tertiary-fixed font-bold"><c:out value="${s.book}"/></span></span>
                                    </div>
                                </div>
                            </div>
                        </c:forEach>
                    </div>
                </div>
            </c:if>

        </div>
    </main>

    <jsp:include page="/jsp/includes/footer.jsp"/>
</body>
</html>
