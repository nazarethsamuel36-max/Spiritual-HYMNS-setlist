<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html class="light" lang="en">
<head>
    <title>${not empty song ? 'Edit Song' : 'Add New Song'} — Admin</title>
    <jsp:include page="/jsp/includes/head.jsp"/>
</head>
<body class="bg-surface font-body text-on-surface flex flex-col min-h-screen">
    <jsp:include page="/jsp/navbar.jsp"/>

    <main class="flex-grow max-w-[1920px] mx-auto w-full px-6 md:px-24 py-12 max-w-5xl">
        <div class="flex justify-between items-center mb-8 pb-6 border-b border-surface-dim">
            <h1 class="text-3xl font-headline font-extrabold tracking-tight text-on-surface">
                ${not empty song ? 'Edit Song' : 'Add New Song'}
            </h1>
            <a href="${pageContext.request.contextPath}/admin/songs" class="flex items-center gap-2 px-4 py-2 bg-surface-container-low text-on-surface hover:bg-surface-dim transition-colors rounded-xl font-bold text-sm text-decoration-none" style="text-decoration: none;">
                <span class="material-symbols-outlined text-[18px]">arrow_back</span> Cancel & Return
            </a>
        </div>

        <form method="post" action="${pageContext.request.contextPath}/admin/${not empty song ? 'edit' : 'add'}" class="space-y-8">
            <c:if test="${not empty song}">
                <input type="hidden" name="id" value="${song.id}">
            </c:if>

            <div class="bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-surface-dim space-y-6">
                <!-- Basic Info -->
                <h2 class="text-xl font-headline font-bold text-on-surface flex items-center gap-2 mb-4">
                    <span class="material-symbols-outlined text-primary">info</span> Basic Information
                </h2>
                
                <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div class="md:col-span-2">
                        <label for="songNumber" class="block text-sm font-bold text-on-surface mb-2">Song #</label>
                        <input type="number" id="songNumber" name="songNumber" value="${song.songNumber}"
                               class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none font-medium">
                    </div>
                    <div class="md:col-span-7">
                        <label for="title" class="block text-sm font-bold text-on-surface mb-2">Title <span class="text-error">*</span></label>
                        <input type="text" id="title" name="title" value="${song.title}" required
                               class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none font-medium">
                    </div>
                    <div class="md:col-span-3">
                        <label for="language" class="block text-sm font-bold text-on-surface mb-2">Language</label>
                        <select id="language" name="language" class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none font-medium cursor-pointer">
                            <option value="english" ${song.language == 'english' ? 'selected' : ''}>English</option>
                            <option value="hindi" ${song.language == 'hindi' ? 'selected' : ''}>Hindi</option>
                            <option value="marathi" ${song.language == 'marathi' ? 'selected' : ''}>Marathi</option>
                            <option value="bengali" ${song.language == 'bengali' ? 'selected' : ''}>Bengali</option>
                            <option value="other" ${song.language == 'other' ? 'selected' : ''}>Other</option>
                        </select>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label for="artist" class="block text-sm font-bold text-on-surface mb-2">Artist</label>
                        <input type="text" id="artist" name="artist" value="${song.artist}"
                               class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none font-medium">
                    </div>
                    <div>
                        <label for="composer" class="block text-sm font-bold text-on-surface mb-2">Composer</label>
                        <input type="text" id="composer" name="composer" value="${song.composer}"
                               class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none font-medium">
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                        <label for="originalKey" class="block text-sm font-bold text-on-surface mb-2">Key</label>
                        <input type="text" id="originalKey" name="originalKey" value="${song.originalKey}" placeholder="e.g., G"
                               class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none font-medium uppercase">
                    </div>
                    <div>
                        <label for="bpm" class="block text-sm font-bold text-on-surface mb-2">BPM</label>
                        <input type="number" id="bpm" name="bpm" value="${song.bpm}"
                               class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none font-medium">
                    </div>
                    <div>
                        <label for="capo" class="block text-sm font-bold text-on-surface mb-2">Capo</label>
                        <input type="number" id="capo" name="capo" value="${song.capo}" min="0" max="12"
                               class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none font-medium">
                    </div>
                    <div>
                        <label for="timeSignature" class="block text-sm font-bold text-on-surface mb-2">Time Signature</label>
                        <input type="text" id="timeSignature" name="timeSignature" value="${not empty song.timeSignature ? song.timeSignature : '4/4'}"
                               class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none font-medium">
                    </div>
                </div>
            </div>

            <!-- Content -->
            <div class="bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-surface-dim space-y-6">
                <h2 class="text-xl font-headline font-bold text-on-surface flex items-center gap-2 mb-4">
                    <span class="material-symbols-outlined text-primary">text_snippet</span> Lyrics & Chords
                </h2>

                <div>
                    <div class="flex justify-between items-end mb-2">
                        <label for="chords" class="block text-sm font-bold text-on-surface">Chords <span class="text-xs text-outline font-normal">(bracket format)</span></label>
                        <span class="bg-primary-container text-primary text-xs font-bold px-2 py-0.5 rounded">Format: [G]word [Em]word</span>
                    </div>
                    <textarea id="chords" name="chords" rows="10" placeholder="[G]Amazing [Em]grace how [C]sweet the [G]sound"
                              class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-y"
                              style="font-family: var(--font-mono, monospace); font-size: 14px;">${song.chords}</textarea>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label for="lyricsOriginal" class="block text-sm font-bold text-on-surface mb-2">Lyrics <span class="text-xs text-outline font-normal">(Original Script)</span></label>
                        <textarea id="lyricsOriginal" name="lyricsOriginal" rows="8"
                                  class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-y"
                                  style="font-family: var(--font-mono, monospace); font-size: 14px;">${song.lyricsOriginal}</textarea>
                    </div>

                    <div>
                        <label for="lyricsRoman" class="block text-sm font-bold text-on-surface mb-2">Lyrics <span class="text-xs text-outline font-normal">(Romanized)</span></label>
                        <textarea id="lyricsRoman" name="lyricsRoman" rows="8"
                                  class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-y"
                                  style="font-family: var(--font-mono, monospace); font-size: 14px;">${song.lyricsRoman}</textarea>
                    </div>
                </div>

                <div>
                    <label for="notes" class="block text-sm font-bold text-on-surface mb-2">Notes <span class="text-xs text-outline font-normal">(Sa Re Ga format)</span></label>
                    <textarea id="notes" name="notes" rows="6"
                              class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-y"
                              style="font-family: var(--font-mono, monospace); font-size: 14px;">${song.notes}</textarea>
                </div>
            </div>

            <!-- Meta Data -->
            <div class="bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-surface-dim space-y-6">
                <h2 class="text-xl font-headline font-bold text-on-surface flex items-center gap-2 mb-4">
                    <span class="material-symbols-outlined text-primary">label</span> Metadata & Links
                </h2>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label for="structure" class="block text-sm font-bold text-on-surface mb-2">Song Structure</label>
                        <input type="text" id="structure" name="structure" value="${song.structure}" placeholder="e.g., Verse1, Chorus, Verse2"
                               class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none font-medium">
                    </div>
                    
                    <div>
                        <label for="copyright" class="block text-sm font-bold text-on-surface mb-2">Copyright</label>
                        <input type="text" id="copyright" name="copyright" value="${song.copyright}"
                               class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none font-medium">
                    </div>

                    <div>
                        <label for="audioUrl" class="block text-sm font-bold text-on-surface mb-2">Audio URL</label>
                        <input type="url" id="audioUrl" name="audioUrl" value="${song.audioUrl}" placeholder="https://"
                               class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none font-medium">
                    </div>
                </div>
            </div>

            <!-- Submit -->
            <div class="flex justify-end pt-4">
                <button type="submit" class="px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary-container transition-all flex items-center gap-2 text-lg">
                    <span class="material-symbols-outlined text-[24px]">save</span> 
                    ${not empty song ? 'Update Song' : 'Create Song'}
                </button>
            </div>
        </form>
    </main>

    <jsp:include page="/jsp/includes/footer.jsp"/>
</body>
</html>
