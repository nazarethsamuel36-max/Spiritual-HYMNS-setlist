<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html class="light" lang="en">
<head>
    <title>Import Songs — Admin</title>
    <jsp:include page="/jsp/includes/head.jsp"/>
</head>
<body class="bg-surface font-body text-on-surface flex flex-col min-h-screen">
    <jsp:include page="/jsp/navbar.jsp"/>

    <main class="flex-grow max-w-[1920px] mx-auto w-full px-6 md:px-24 py-12 max-w-4xl">
        <div class="flex justify-between items-center mb-8">
            <h1 class="text-3xl font-headline font-extrabold tracking-tight text-on-surface">Import Songs</h1>
            <a href="${pageContext.request.contextPath}/admin" class="flex items-center gap-2 px-4 py-2 bg-surface-container-low text-on-surface hover:bg-surface-dim transition-colors rounded-xl font-bold text-sm text-decoration-none" style="text-decoration: none;">
                <span class="material-symbols-outlined text-[18px]">arrow_back</span> Dashboard
            </a>
        </div>

        <!-- Import Results -->
        <c:if test="${not empty successCount}">
            <div class="mb-6 p-4 bg-primary-container text-on-primary-container rounded-xl font-semibold border border-primary/20 flex flex-col gap-2 shadow-sm">
                <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-[20px]">check_circle</span>
                    <span><strong>${successCount}</strong> songs imported successfully.</span>
                    <c:if test="${skipCount > 0}"><span class="ml-2"><strong>${skipCount}</strong> duplicates skipped.</span></c:if>
                    <c:if test="${errorCount > 0}"><span class="ml-2 text-error"><strong>${errorCount}</strong> errors.</span></c:if>
                </div>
            </div>
            <c:if test="${not empty importErrors}">
                <div class="mb-8 p-4 bg-error-container text-on-error-container rounded-xl text-sm font-semibold border border-error/20 flex flex-col gap-2 shadow-sm">
                    <div class="flex items-center gap-2 mb-2 font-bold">
                        <span class="material-symbols-outlined text-[20px]">warning</span> Details:
                    </div>
                    <ul class="list-disc list-inside space-y-1 ml-2">
                        <c:forEach var="err" items="${importErrors}">
                            <li>${err}</li>
                        </c:forEach>
                    </ul>
                </div>
            </c:if>
        </c:if>

        <c:if test="${not empty error}">
            <div class="mb-8 p-4 bg-error-container text-on-error-container rounded-xl text-sm font-semibold border border-error/20 flex items-start gap-3 shadow-sm">
                <span class="material-symbols-outlined text-[20px]">error</span>
                <span>${error}</span>
            </div>
        </c:if>

        <!-- Tabs -->
        <div class="mb-6 border-b border-surface-dim flex gap-6">
            <button onclick="switchTab('csvTab')" id="btn-csvTab" class="pb-3 border-b-2 border-primary text-primary font-bold text-lg flex items-center gap-2 transition-colors">
                <span class="material-symbols-outlined">upload_file</span> CSV Upload
            </button>
            <button onclick="switchTab('pasteTab')" id="btn-pasteTab" class="pb-3 border-b-2 border-transparent text-outline hover:text-on-surface font-bold text-lg flex items-center gap-2 transition-colors">
                <span class="material-symbols-outlined">content_paste</span> Paste Import
            </button>
        </div>

        <div>
            <!-- CSV Upload Tab -->
            <div id="csvTab" class="block">
                <div class="bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-surface-dim mb-6">
                    <h2 class="text-xl font-headline font-bold text-on-surface mb-2">CSV File Upload</h2>
                    <p class="text-on-surface-variant text-sm mb-6">
                        Upload a CSV file with columns: <code class="bg-surface-container px-2 py-1 rounded text-primary font-mono text-xs">title, artist, language, lyrics_original, lyrics_roman, chords, notes, original_key, bpm, capo, hashtags</code>
                    </p>

                    <form method="post" action="${pageContext.request.contextPath}/admin/import/csv" enctype="multipart/form-data" class="space-y-6">
                        <div>
                            <label for="csvFile" class="block text-sm font-bold text-on-surface mb-2">Select CSV File</label>
                            <input type="file" id="csvFile" name="csvFile" accept=".csv" required
                                   class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-container file:text-primary hover:file:bg-primary hover:file:text-white cursor-pointer">
                            <p class="text-outline text-xs mt-2">Maximum file size: 5MB. Must properly encode as UTF-8.</p>
                        </div>
                        <div class="flex flex-wrap gap-4 pt-2">
                            <button type="submit" class="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary-container transition-all flex items-center gap-2">
                                <span class="material-symbols-outlined text-[20px]">cloud_upload</span> Upload & Import
                            </button>
                            <a href="${pageContext.request.contextPath}/song_import_template.csv" class="px-6 py-3 bg-surface-container-high text-on-surface font-bold rounded-xl hover:bg-surface-dim transition-all flex items-center gap-2 text-decoration-none" style="text-decoration: none;">
                                <span class="material-symbols-outlined text-[20px]">download</span> Download Template
                            </a>
                        </div>
                    </form>
                </div>

                <!-- CSV Format Guide -->
                <div class="bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-surface-dim">
                    <h3 class="text-lg font-headline font-bold text-on-surface mb-4">CSV Format Guide</h3>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr class="bg-surface-container-low border-b border-surface-dim">
                                    <th class="py-3 px-4 font-bold text-outline uppercase tracking-wider text-xs">Column Name</th>
                                    <th class="py-3 px-4 font-bold text-outline uppercase tracking-wider text-xs">Required</th>
                                    <th class="py-3 px-4 font-bold text-outline uppercase tracking-wider text-xs">Example</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-surface-dim text-on-surface-variant font-medium">
                                <tr><td class="py-3 px-4"><code class="text-primary bg-primary-fixed/20 px-1 rounded">title</code></td><td class="py-3 px-4 text-success">✅ Yes</td><td class="py-3 px-4">Amazing Grace</td></tr>
                                <tr><td class="py-3 px-4">artist</td><td class="py-3 px-4">No</td><td class="py-3 px-4">John Newton</td></tr>
                                <tr><td class="py-3 px-4">language</td><td class="py-3 px-4">No</td><td class="py-3 px-4">english</td></tr>
                                <tr><td class="py-3 px-4">lyrics_original</td><td class="py-3 px-4">No</td><td class="py-3 px-4">Amazing grace how sweet the sound</td></tr>
                                <tr><td class="py-3 px-4">lyrics_roman</td><td class="py-3 px-4">No</td><td class="py-3 px-4">Romanized version</td></tr>
                                <tr><td class="py-3 px-4">chords</td><td class="py-3 px-4">No</td><td class="py-3 px-4" style="font-family: var(--font-mono); font-size: 13px;">[G]Amazing [Em]grace</td></tr>
                                <tr><td class="py-3 px-4">notes</td><td class="py-3 px-4">No</td><td class="py-3 px-4">Sa Re Ga Ma</td></tr>
                                <tr><td class="py-3 px-4">original_key</td><td class="py-3 px-4">No</td><td class="py-3 px-4">G</td></tr>
                                <tr><td class="py-3 px-4">bpm</td><td class="py-3 px-4">No</td><td class="py-3 px-4">72</td></tr>
                                <tr><td class="py-3 px-4">capo</td><td class="py-3 px-4">No</td><td class="py-3 px-4">0</td></tr>
                                <tr><td class="py-3 px-4">hashtags</td><td class="py-3 px-4">No</td><td class="py-3 px-4">praise,worship,classic</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Paste Import Tab -->
            <div id="pasteTab" class="hidden">
                <div class="bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-surface-dim">
                    <h2 class="text-xl font-headline font-bold text-on-surface mb-2">Paste Raw Song Text</h2>
                    <p class="text-on-surface-variant text-sm mb-6">
                        Paste a song's raw text below. The system will parse chords in bracket format <code class="bg-surface-container px-1 py-0.5 text-xs text-primary font-mono rounded">[G]Amazing [Em]grace</code>.
                    </p>

                    <form method="post" action="${pageContext.request.contextPath}/admin/import/paste" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div class="lg:col-span-2">
                                <label for="pasteTitle" class="block text-sm font-bold text-on-surface mb-2">Song Title <span class="text-error">*</span></label>
                                <input type="text" id="pasteTitle" name="title" required
                                       class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none font-medium">
                            </div>
                            <div>
                                <label for="pasteKey" class="block text-sm font-bold text-on-surface mb-2">Key</label>
                                <input type="text" id="pasteKey" name="originalKey" placeholder="e.g. G"
                                       class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none font-medium uppercase">
                            </div>
                            <div>
                                <label for="pasteLanguage" class="block text-sm font-bold text-on-surface mb-2">Language</label>
                                <select id="pasteLanguage" name="language"
                                        class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none font-medium cursor-pointer">
                                    <option value="english">English</option>
                                    <option value="hindi">Hindi</option>
                                    <option value="marathi">Marathi</option>
                                    <option value="bengali">Bengali</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label for="pasteArtist" class="block text-sm font-bold text-on-surface mb-2">Artist</label>
                            <input type="text" id="pasteArtist" name="artist"
                                   class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none font-medium">
                        </div>

                        <div>
                            <label for="pasteChords" class="block text-sm font-bold text-on-surface mb-2">Chords (bracket format)</label>
                            <textarea id="pasteChords" name="chords" rows="10" placeholder="[G]Amazing [Em]grace how [C]sweet the [G]sound&#10;[G]That saved a [D]wretch like [G]me"
                                      class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-y"
                                      style="font-family: var(--font-mono, monospace); font-size: 14px;"></textarea>
                        </div>

                        <div>
                            <label for="pasteLyrics" class="block text-sm font-bold text-on-surface mb-2">Lyrics (plain, no chords)</label>
                            <textarea id="pasteLyrics" name="lyricsOriginal" rows="6"
                                      class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-y"
                                      style="font-family: var(--font-mono, monospace); font-size: 14px;"></textarea>
                        </div>

                        <div>
                            <label for="pasteHashtags" class="block text-sm font-bold text-on-surface mb-2">Hashtags <span class="text-xs text-outline font-normal">(comma separated)</span></label>
                            <input type="text" id="pasteHashtags" name="hashtags" placeholder="praise,worship,hymn"
                                   class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none font-medium">
                        </div>

                        <div class="pt-4 border-t border-surface-dim">
                            <button type="submit" class="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary-container transition-all flex items-center gap-2">
                                <span class="material-symbols-outlined text-[20px]">save</span> Save Imported Song
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </main>

    <script>
        function switchTab(tabId) {
            document.getElementById('csvTab').classList.add('hidden');
            document.getElementById('csvTab').classList.remove('block');
            document.getElementById('pasteTab').classList.add('hidden');
            document.getElementById('pasteTab').classList.remove('block');

            document.getElementById('btn-csvTab').classList.remove('border-primary', 'text-primary');
            document.getElementById('btn-csvTab').classList.add('border-transparent', 'text-outline');
            document.getElementById('btn-pasteTab').classList.remove('border-primary', 'text-primary');
            document.getElementById('btn-pasteTab').classList.add('border-transparent', 'text-outline');

            document.getElementById(tabId).classList.add('block');
            document.getElementById(tabId).classList.remove('hidden');
            document.getElementById('btn-' + tabId).classList.remove('border-transparent', 'text-outline');
            document.getElementById('btn-' + tabId).classList.add('border-primary', 'text-primary');
        }
    </script>

    <jsp:include page="/jsp/includes/footer.jsp"/>
</body>
</html>
