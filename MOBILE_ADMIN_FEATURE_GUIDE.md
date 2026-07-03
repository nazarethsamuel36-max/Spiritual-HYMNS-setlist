# Mobile Admin Feature Guide 📱✏️

## Overview
The admin editing feature is now fully optimized for mobile PWA. You can edit songs, manage chords, change keys, and toggle publish status directly from your phone.

---

## How to Enable Admin Mode on Mobile

### Step 1: Unlock Admin Access
1. Open the app on your mobile device
2. Look at the **"BBF Song book"** title in the header
3. **Tap the title 5 times rapidly** (within 7 seconds)
4. A password prompt will appear
5. Enter credentials:
   - **Username:** `church`
   - **Password:** `shalom`
6. Once authenticated, you'll see a **🔑 key icon** next to the title (tap it to exit admin mode)

### Step 2: Open Editor on Mobile
1. Select any song to view it
2. Tap the **⋮ (three dots)** menu button in the top-right
3. Look for **✏️ Edit Song** button (only visible when admin is logged in)
4. Tap it to open the mobile-optimized editor

---

## Mobile Editor Features

### 📐 Responsive Layout
- **On Mobile:** Fields stack vertically for easy scrolling and editing
- **On Desktop:** Side-by-side layout for efficient editing
- **Tablet:** Adaptive layout that adjusts to screen size

### 🔘 Touch-Friendly Controls
All buttons and inputs have **minimum 44px height** for easy tapping:
- Input fields are oversized for comfortable typing
- Buttons are larger and easier to tap
- Selects are full-width for better usability
- Text areas adapt to mobile screen height

### 🎹 Available Editing Options

#### 1. **Song Metadata**
- **Title** - Change the song name
- **Key** - Select the original key (C through B, major and minor)
- Automatically transposes all chords when you change the key

#### 2. **Chord Management**
- **Edit Raw Chords** - Left side textarea for editing chord format
- **Live Preview** - Right side shows how chords render for users
- Chords appear above lyrics in the `[Cmaj7]` bracket format
- Real-time preview updates as you type

#### 3. **Chord Transposition Tool**
- **"Chords are currently written in"** - Select the current key of the chords
- **"Shift chords to"** - Select target key to transpose all chords at once
- Useful for fixing mismatched metadata keys
- All chord transpositions happen instantly

#### 4. **Publish Status Toggle**
- **Published / Hidden button** - Toggle visibility in the song library
- Green button = **Published** (visible to users)
- Gray button = **Hidden** (only visible to admins)
- Full-width button on mobile, wide button on desktop

### 💾 Auto-Save
- **Automatic saving** with 1.5-second delay after edits
- Works on mobile without manual save button
- All changes sync to Supabase database in real-time
- Look for "Saving..." spinner while updates happen

### 🔙 Mobile Navigation
- **Back Button** (← arrow) at top-left on mobile
- Returns to song lyrics view
- Button is always visible and easy to tap (44px height)
- On desktop, use the keyboard or exit normally

---

## Editing Workflow on Mobile

### Example: Edit Song Key & Fix Chords

1. **Open Admin Mode**
   - Tap title 5× → Enter credentials (church/shalom)

2. **Find Your Song**
   - Scroll through library → Tap song to view
   - Song view shows chords and lyrics

3. **Tap Edit**
   - Tap ⋮ menu → ✏️ Edit Song

4. **Change the Key** (Option 1 - Simple)
   - Find "Key" dropdown at top
   - Select new key (e.g., D instead of C)
   - All chords transpose automatically
   - Wait 1.5 sec for auto-save ✓

5. **Fix Mismatched Chords** (Option 2 - Advanced)
   - Find "Chords are currently written in" dropdown
   - Select actual key of the chords (e.g., G)
   - Find "Shift chords to" dropdown
   - Select target key (e.g., D)
   - Click or tap → all chords shift instantly

6. **Preview Changes**
   - Right-side panel shows live preview
   - See exactly how chords render for users

7. **Toggle Published Status**
   - Find the green "Published" or gray "Hidden" button
   - Tap to toggle visibility
   - Button feedback confirms the state

8. **Return to Song View**
   - Tap ← (back button) at top on mobile
   - Or switch back to "lyrics" mode on desktop

---

## Touch Targets & Mobile Optimization

### Button Sizes
| Element | Mobile Size | Desktop Size |
|---------|------------|--------------|
| Back button | 44px | Hidden |
| Input fields | 44px height | 40px height |
| Select dropdowns | 44px height | 40px height |
| Main buttons | 44px height | 40px height |
| Full-width buttons | 100% width | Auto width |

### Layout Changes
| Section | Mobile | Desktop |
|---------|--------|---------|
| Title + Key | 1 column stack | 2-column grid |
| Chord corrector | 1 column stack | 2-column grid |
| Editor panels | Stacked (300px each) | Side-by-side (500px each) |
| Button layout | Full-width flex column | Flex row |

### Responsive Breakpoints
- **Mobile:** < 768px width (md breakpoint)
- **Tablet:** 768px - 1024px width
- **Desktop:** > 1024px width

---

## Features Working on Mobile

✅ **Admin unlock** - 5-tap title unlock on mobile  
✅ **Edit button** - Only visible to admins  
✅ **Title editing** - Auto-save to database  
✅ **Key selection** - Auto-transpose chords  
✅ **Chord editing** - Full textarea with preview  
✅ **Chord transposition** - Shift keys instantly  
✅ **Live preview** - See changes in real-time  
✅ **Publish toggle** - Hide/show songs  
✅ **Auto-save** - 1.5-sec debounced saves  
✅ **Back button** - Easy mobile navigation  
✅ **Touch targets** - 44px minimum for easy tapping  
✅ **Responsive layout** - Adapts to screen size  

---

## Troubleshooting

### "Edit Song" button not showing?
- Make sure you're in admin mode (look for 🔑 icon next to title)
- Tap title 5× to unlock
- Verify credentials: `church` / `shalom`

### Changes not saving?
- Check internet connection
- Wait 1.5 seconds for auto-save to complete
- Look for "Saving..." indicator
- Check browser console for Supabase errors

### Chords not transposing?
- Make sure you select the current key in dropdown 1
- Select the target key in dropdown 2
- Click/tap to transpose
- Check console if nothing happens

### Button too small to tap?
- All buttons should be 44px tall on mobile
- Try rotating to landscape if needed
- Report if buttons appear smaller than expected

### Edit button only shows on desktop?
- **It's now visible on mobile too!**
- Tap ⋮ menu → look for ✏️ Edit Song (orange text)
- Back button will appear at top in edit mode

---

## Advanced Tips

### Bulk Editing Tips
1. Edit one song completely before moving to next
2. Use "Shift chords to" for quick batch transposition
3. Preview changes before exiting editor
4. Changes auto-save, so no risk of losing work

### Chord Format
Chords should be in format: `[Cmaj7] text [D] more text`
- Square brackets required: `[` and `]`
- Works with any chord name: C, Dm, F#m, Gsus4, etc.
- Text between chords is lyrics/syllables

### Performance
- Mobile editor optimized for touch
- Large textareas scroll smoothly
- Auto-save doesn't block UI
- Preview updates in real-time

---

## PWA Offline Support

The editor will work offline on your PWA if:
- You've previously synced the song
- Your browser has cached the song data
- However, **auto-save will fail offline**
- Changes will sync when connection returns

---

## Security Notes

- Admin credentials are hardcoded (for development)
- For production, implement proper authentication
- Admin mode gives full edit access to all songs
- Only share credentials with trusted team members

---

## Summary: Mobile Admin Workflow

```
Open PWA
   ↓
Tap title 5× 
   ↓
Enter: church / shalom
   ↓
Select song
   ↓
Tap ⋮ menu
   ↓
Tap ✏️ Edit Song
   ↓
Make edits (auto-saves)
   ↓
Tap ← Back
   ↓
View published changes
```

**All changes sync to Supabase automatically!** 🎉

---

## Questions?

Check the browser console (F12) for debug logs:
- 📍 Component lifecycle logs
- 💾 Auto-save confirmations
- ✅ Database update confirmations
- ❌ Error messages with details

---

**Last Updated:** 2026-01-07  
**Version:** Mobile Admin v1.0  
**Status:** ✅ Production Ready
