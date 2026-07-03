# Complete Admin Workflow Testing Guide

## ✅ Prerequisites
- [ ] Supabase SQL schema updated: `ALTER TABLE songs ADD COLUMN is_published BOOLEAN DEFAULT false;`
- [ ] Dev server running: `http://localhost:5173/`
- [ ] Admin authenticated (check browser console for `isAdminAuthenticated: true`)

---

## 🧪 Test 1: Add New Song (Draft Creation)

**Steps:**
1. Navigate to song library (main list view)
2. Look for **green "+ Add New Song"** button at the top (admin-only)
3. Click the button
4. Observe:
   - ✅ Button shows "Creating..." spinner while processing
   - ✅ New draft song appears in the library list with **DRAFT** badge
   - ✅ Editor opens automatically with the new song
   - ✅ Song number auto-incremented correctly
   - ✅ Default values: Title="Untitled Draft", Language="English", Key="C"

**Console Logs to Verify:**
```
✅ New draft song created: {id, song_number, ...}
```

---

## 🧪 Test 2: Auto-Save Functionality

**Steps:**
1. With a song open in Editor:
2. Change the **Title** field
3. Observe:
   - ✅ After 1.5 seconds: status changes from "Auto-save enabled" → "Saving..." → "Saved"
   - ✅ Checkmark ✓ icon appears in green (emerald-600)
4. Change the **Language** dropdown
5. Observe:
   - ✅ Same auto-save sequence triggers
6. Edit the **Chords** textarea
7. Observe:
   - ✅ Auto-save triggers and updates
   - ✅ Live preview renders chords correctly on the right panel
8. Refresh the page and reopen the song
9. Verify:
   - ✅ All changes persisted in database

**Console Logs to Verify:**
```
💾 Auto-saving: {title, language, key, chords}
✅ Auto-save successful
```

---

## 🧪 Test 3: Publish Toggle (Admin Only)

**Steps:**
1. With a song open in Editor, look at the header
2. Find the **publish toggle button** (next to auto-save status)
3. Initial state should show: **"⊘ Hidden"** (amber background) since new drafts start unpublished
4. Click the toggle
5. Observe:
   - ✅ Button shows spinner briefly
   - ✅ Button text changes to **"✓ Published"** (emerald background)
6. Verify in Supabase: `is_published` column updated to `true`
7. Click toggle again
8. Observe:
   - ✅ Button reverts to **"⊘ Hidden"** (amber)
9. Verify in Supabase: `is_published` back to `false`

**Console Logs to Verify:**
```
📢 Publishing toggle: true/false
✅ Song PUBLISHED/HIDDEN
```

---

## 🧪 Test 4: User-Side Song Protection (Unpublished Songs Hidden)

**Steps:**
1. As **Admin**: Create a new draft song and DO NOT publish it
2. Note the song's ID (from editor URL or console)
3. **Logout or switch to non-admin user** (or open in incognito window)
4. Try to access the song directly via library:
   - ✅ The song should NOT appear in the song list (filtered out)
5. Try to access the song by URL (if you know the ID):
   - Example: `http://localhost:5173/song/123`
   - ✅ Should show error: "This song is not yet published"
6. **Publish the song** (as admin)
7. **Refresh as non-admin user**
8. Verify:
   - ✅ Song now appears in the library list
   - ✅ Song can be opened and viewed
   - ✅ NO "DRAFT" badge visible (only admins see draft badge)

**Console Logs to Verify:**
```
🚫 User attempted to access unpublished song
```

---

## 🧪 Test 5: Draft Badge Display (Admin Only)

**Steps:**
1. As **Admin**: View the library with published and unpublished songs
2. Observe:
   - ✅ Published songs have NO badge
   - ✅ Unpublished songs show **"DRAFT"** badge (amber/yellow background)
3. As **Non-admin**: View the same library
4. Observe:
   - ✅ Unpublished songs are completely hidden (not visible at all)
   - ✅ No DRAFT badges shown

---

## 🧪 Test 6: Complete End-to-End Workflow

**Steps:**
1. **As Admin:**
   - [ ] Click "+ Add New Song"
   - [ ] Enter title: "Test Song"
   - [ ] Select language: "Hindi"
   - [ ] Select key: "G"
   - [ ] Add chords: `[G]Amazing grace [D]how sweet`
   - [ ] Verify auto-save shows "Saved" ✓
   - [ ] Click "⊘ Hidden" toggle → Changes to "✓ Published"
   - [ ] Close editor
   
2. **As Non-admin (or incognito):**
   - [ ] Refresh page
   - [ ] Song list shows "Test Song"
   - [ ] NO "DRAFT" badge visible
   - [ ] Click to open song
   - [ ] Chords display correctly
   - [ ] Verify no edit controls visible (read-only mode)

3. **Back as Admin:**
   - [ ] Reopen "Test Song"
   - [ ] Click "✓ Published" toggle → Changes to "⊘ Hidden"
   - [ ] Close editor

4. **As Non-admin:**
   - [ ] Refresh page
   - [ ] "Test Song" disappears from list
   - [ ] Try direct URL access: error shown

---

## ✅ Success Criteria

All tests pass when:
- ✅ Drafts created with auto-incremented song numbers
- ✅ Auto-save triggers after 1.5s delay with visual feedback
- ✅ Publish toggle works and updates database
- ✅ Non-admins cannot see unpublished songs
- ✅ DRAFT badges only visible to admins
- ✅ Chords auto-save and render in preview
- ✅ No TypeScript errors in build
- ✅ No console errors during workflow

---

## 📋 Troubleshooting

| Issue | Solution |
|-------|----------|
| "+ Add New Song" button not visible | Check `isAdminAuthenticated` in browser DevTools → Zustand store |
| Auto-save not triggering | Check browser console for errors; verify Supabase permissions |
| Publish toggle disabled | Ensure song is loaded; check Supabase connection |
| Unpublished songs still visible to users | Clear browser cache; verify `is_published` column exists in Supabase |
| DRAFT badge not showing | Check admin status; reload page |

---

## 🔧 Required Supabase Schema

```sql
ALTER TABLE songs ADD COLUMN is_published BOOLEAN DEFAULT false;
CREATE INDEX idx_songs_is_published ON songs(is_published);
UPDATE songs SET is_published = true WHERE is_published IS NULL;
```

Verify in Supabase console:
```sql
SELECT COUNT(*) FROM songs WHERE is_published = true;
SELECT COUNT(*) FROM songs WHERE is_published = false;
```
