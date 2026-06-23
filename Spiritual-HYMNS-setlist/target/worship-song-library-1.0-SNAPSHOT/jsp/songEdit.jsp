<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html class="light" lang="en">
<head>
    <title>Edit <c:out value="${song.title}"/> - The Resonant Archive</title>
    <jsp:include page="/jsp/includes/head.jsp"/>
    <style>
        .edit-shell {
            max-width: 980px;
        }

        .edit-area {
            min-height: 260px;
            resize: vertical;
        }

        @media (max-width: 640px) {
            .edit-area {
                min-height: 220px;
            }
        }
    </style>
</head>
<body class="bg-surface font-body text-on-surface flex min-h-screen flex-col">
    <jsp:include page="/jsp/navbar.jsp"/>

    <main class="edit-shell mx-auto w-full flex-grow px-4 py-6 md:px-8 md:py-8">
        <header class="mb-5 flex flex-col gap-3 border-b border-outline-variant/30 pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <p class="mb-1 text-xs font-black uppercase tracking-[0.18em] text-outline">Edit Mode</p>
                <h1 class="font-headline text-3xl font-extrabold leading-tight text-on-surface md:text-4xl">
                    <c:out value="${song.title}"/>
                </h1>
                <p class="mt-1 text-sm font-semibold text-on-surface-variant">
                    Song <c:out value="${song.songNumber}"/>
                    <c:if test="${not empty editKey}">
                        - Key <c:out value="${editKey}"/>
                    </c:if>
                </p>
            </div>
            <a href="${pageContext.request.contextPath}/song?id=${song.id}"
               class="inline-flex min-h-10 items-center justify-center rounded-xl border border-outline-variant px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-surface-container-low text-decoration-none"
               style="text-decoration: none;">Cancel</a>
        </header>

        <form id="songEditForm" class="flex flex-col gap-5">
            <input type="hidden" name="songId" value="${song.id}"/>

            <label class="flex flex-col gap-2">
                <span class="text-xs font-black uppercase tracking-[0.18em] text-outline">Key</span>
                <input name="customKey"
                       class="w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 text-base font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 sm:max-w-40"
                       value="<c:out value="${editKey}"/>"/>
            </label>

            <label class="flex flex-col gap-2">
                <span class="text-xs font-black uppercase tracking-[0.18em] text-outline">Lyrics</span>
                <textarea name="customLyrics"
                          class="edit-area w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 font-mono text-sm leading-relaxed outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"><c:out value="${editLyrics}"/></textarea>
            </label>

            <label class="flex flex-col gap-2">
                <span class="text-xs font-black uppercase tracking-[0.18em] text-outline">Chords</span>
                <textarea name="customChords"
                          class="edit-area w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 font-mono text-sm leading-relaxed outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"><c:out value="${editChords}"/></textarea>
            </label>

            <label class="flex flex-col gap-2">
                <span class="text-xs font-black uppercase tracking-[0.18em] text-outline">Notes</span>
                <textarea name="customNotes"
                          class="min-h-32 w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 text-sm leading-relaxed outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"><c:out value="${editNotes}"/></textarea>
            </label>

            <div class="sticky bottom-0 -mx-4 flex flex-col gap-3 border-t border-outline-variant/30 bg-surface/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:flex-row sm:justify-end sm:border-t-0 sm:bg-transparent sm:p-0">
                <a href="${pageContext.request.contextPath}/song?id=${song.id}"
                   class="inline-flex min-h-10 items-center justify-center rounded-xl border border-outline-variant px-5 py-2 text-sm font-bold text-on-surface-variant transition-colors hover:bg-surface-container-low text-decoration-none"
                   style="text-decoration: none;">Cancel</a>
                <button id="saveEditButton"
                        type="submit"
                        class="inline-flex min-h-10 items-center justify-center rounded-xl border-none bg-primary px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-primary-container">
                    Save
                </button>
            </div>
        </form>
    </main>

    <jsp:include page="/jsp/includes/footer.jsp"/>

    <script>
        document.getElementById('songEditForm').addEventListener('submit', async function (event) {
            event.preventDefault();
            const button = document.getElementById('saveEditButton');
            button.disabled = true;
            button.textContent = 'Saving...';

            try {
                const response = await fetch('${pageContext.request.contextPath}/song/save', {
                    method: 'POST',
                    body: new FormData(this),
                    headers: { 'Accept': 'application/json' }
                });
                const result = await response.json();

                if (!result.success) {
                    throw new Error(result.error || 'Save failed');
                }

                window.location.href = '${pageContext.request.contextPath}/song?id=${song.id}';
            } catch (error) {
                button.disabled = false;
                button.textContent = 'Save';
                alert(error.message);
            }
        });
    </script>
</body>
</html>
