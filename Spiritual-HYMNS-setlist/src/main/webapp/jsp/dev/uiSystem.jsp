<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html class="light" lang="en">
<head>
    <title>UI System Reference</title>
    <jsp:include page="/jsp/includes/head.jsp"/>
</head>
<body class="app-bg-browse bg-surface font-body text-on-surface flex min-h-screen flex-col">
    <jsp:include page="/jsp/navbar.jsp"/>

    <main class="relative z-10 mx-auto w-full max-w-6xl flex-grow px-6 py-12 md:px-12">
        <div class="mb-10 max-w-3xl">
            <p class="mb-3 text-xs font-black uppercase tracking-[0.22em] text-outline">Internal Reference</p>
            <h1 class="mb-4 font-headline text-4xl font-extrabold tracking-tight">Quiet premium surface system</h1>
            <p class="text-lg text-on-surface-variant">This page documents the shared glass, mist, and solid surfaces plus the standard control treatments used across the app.</p>
        </div>

        <div class="grid gap-6 lg:grid-cols-3">
            <section class="surface-glass rounded-[2rem] p-6">
                <p class="mb-3 text-xs font-black uppercase tracking-[0.18em] text-outline">Glass Surface</p>
                <h2 class="mb-2 font-headline text-2xl font-bold">Shell overlay</h2>
                <p class="text-on-surface-variant">Use for navbar and floating utility bars only.</p>
            </section>
            <section class="surface-mist rounded-[2rem] p-6">
                <p class="mb-3 text-xs font-black uppercase tracking-[0.18em] text-outline">Mist Surface</p>
                <h2 class="mb-2 font-headline text-2xl font-bold">Browse grouping</h2>
                <p class="text-on-surface-variant">Use for cards, filter rows, side metadata, and empty states.</p>
            </section>
            <section class="surface-solid rounded-[2rem] p-6">
                <p class="mb-3 text-xs font-black uppercase tracking-[0.18em] text-outline">Solid Surface</p>
                <h2 class="mb-2 font-headline text-2xl font-bold">Reading and forms</h2>
                <p class="text-on-surface-variant">Use for song sheets, menus, textareas, and dense controls.</p>
            </section>
        </div>

        <div class="mt-8 grid gap-6 lg:grid-cols-2">
            <section class="surface-mist rounded-[2rem] p-6">
                <p class="mb-4 text-xs font-black uppercase tracking-[0.18em] text-outline">Pills and Buttons</p>
                <div class="flex flex-wrap gap-3">
                    <span class="ui-pill-solid rounded-full px-4 py-2 text-sm font-semibold">Solid pill</span>
                    <span class="ui-pill-muted rounded-full px-4 py-2 text-sm font-semibold">Muted pill</span>
                    <button class="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white">Primary button</button>
                    <button class="surface-mist rounded-xl px-5 py-3 text-sm font-bold text-on-surface">Secondary button</button>
                </div>
            </section>
            <section class="surface-mist rounded-[2rem] p-6">
                <p class="mb-4 text-xs font-black uppercase tracking-[0.18em] text-outline">Inputs and Menu</p>
                <div class="space-y-4">
                    <input class="ui-input-solid w-full rounded-xl px-4 py-3 outline-none" placeholder="Solid input" type="text">
                    <input class="ui-input-mist w-full rounded-xl px-4 py-3 outline-none" placeholder="Mist input" type="text">
                    <div class="ui-menu-solid rounded-2xl p-3">
                        <div class="rounded-xl px-3 py-2 text-sm font-semibold text-on-surface hover:bg-surface-container-low">Menu item</div>
                        <div class="rounded-xl px-3 py-2 text-sm font-semibold text-primary bg-surface-container-low">Active item</div>
                    </div>
                </div>
            </section>
        </div>
    </main>

    <jsp:include page="/jsp/includes/footer.jsp"/>
</body>
</html>
