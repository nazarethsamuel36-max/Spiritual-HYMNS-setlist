# Surface & Text Theme Foundation

We have completed the semantic audit and theme engine. Before refining Dark Mode further, we establish a single visual language built around **two primary color families**.

## Primary Colors

**Surface Colors**
```
Primary Background / Surface    #A18671
Dark Surface                   #6A5240
```

**Typography Colors**
```
Primary Text                   #000080
Secondary / Muted Text         #0D0D60
```

These become the foundation of the application.

The only exceptions are semantic status colors:

* Success (Green)
* Warning (Amber)
* Danger (Red)

No other neutral families (Slate, Gray, Zinc, Indigo, Blue-Gray, etc.) should remain in the design system.

## Color Palette Definition

### Surface Family (Tan/Brown)
- **Surface Primary**: `#A18671` (Primary background and surfaces)
- **Surface Dark**: `#6A5240` (Dark surfaces and elevated elements)

### Text Family (Navy)
- **Text Primary**: `#000080` (Primary text and interactive elements)
- **Text Secondary**: `#0D0D60` (Secondary text, muted text, and placeholders)

### Status Colors (unchanged)
- **Success**: `#10b981` (Green)
- **Warning**: `#f59e0b` (Amber)
- **Danger**: `#ef4444` (Red)

---

## Theme Philosophy

The objective is **not** to manually recolor every component.

The objective is to make every semantic role belong to one of two families:

**Surface Family**
- Light Mode → Surface Primary `#A18671`
- Dark Mode → Surface Dark `#6A5240`

**Text Family**
- Light Mode → Text Primary `#000080`
- Dark Mode → Text Primary `#000080`

Status colors remain unchanged.

Once every semantic role belongs to one of these families, the Light and Dark themes become simple contrast inversions of the same visual language. This keeps the application visually consistent and makes future theme maintenance much simpler.

---

## Theme Mapping Audit

### Surfaces

| Semantic Role | Light Theme | Dark Theme | Current Implementation | Needs Change |
| ------------- | ----------- | ---------- | ---------------------- | ------------ |
| Primary Background | Surface Primary `#A18671` | Surface Dark `#6A5240` | `#A18671` → `#6A5240` | **NO** - Updated to new palette |
| Secondary Background | Surface Dark `#6A5240` | Surface Primary `#A18671` | `#6A5240` → `#A18671` | **NO** - Updated to new palette |
| Sidebar Surface | Surface Primary `#A18671` | Surface Dark `#6A5240` | `#A18671` → `#6A5240` | **NO** - Updated to new palette |
| Reader Surface | Surface Primary `#A18671` | Surface Dark `#6A5240` | `#A18671` → `#6A5240` | **NO** - Updated to new palette |
| Card Surface | Surface Primary `#A18671` | Surface Dark `#6A5240` | `#A18671` → `#6A5240` | **NO** - Updated to new palette |
| Modal Surface | Surface Primary `#A18671` | Surface Dark `#6A5240` | `#A18671` → `#6A5240` | **NO** - Updated to new palette |
| Elevated Surface | Surface Primary `#A18671` | Surface Dark `#6A5240` | `#A18671` → `#6A5240` | **NO** - Updated to new palette |
| Input Surface | Surface Primary `#A18671` | Surface Dark `#6A5240` | `#A18671` → `#6A5240` | **NO** - Updated to new palette |

### Typography

| Semantic Role | Light Theme | Dark Theme | Current Implementation | Needs Change |
| ------------- | ----------- | ---------- | ---------------------- | ------------ |
| Primary Text | Text Primary `#000080` | Text Primary `#000080` | `#000080` → `#000080` | **NO** - Updated to new palette |
| Secondary Text | Text Secondary `#0D0D60` | Text Secondary `#0D0D60` | `#0D0D60` → `#0D0D60` | **NO** - Updated to new palette |
| Muted Text | Text Secondary `#0D0D60` | Text Secondary `#0D0D60` | `#0D0D60` → `#0D0D60` | **NO** - Updated to new palette |
| Accent Text | Text Primary `#000080` | Text Primary `#000080` | `#000080` → `#000080` | **NO** - Updated to new palette |
| Inverse Text | Surface Primary `#A18671` | Surface Primary `#A18671` | `#A18671` → `#A18671` | **NO** - Updated to new palette |

### Interactive

| Semantic Role | Light Theme | Dark Theme | Current Implementation | Needs Change |
| ------------- | ----------- | ---------- | ---------------------- | ------------ |
| Primary Button | Text Primary `#000080` | Text Primary `#000080` | `#000080` → `#000080` | **NO** - Updated to new palette |
| Secondary Button | Surface Dark `#6A5240` | Surface Primary `#A18671` | `#6A5240` → `#A18671` | **NO** - Updated to new palette |
| Ghost Button | Transparent (Text Primary) | Transparent (Text Primary) | Transparent → Transparent | **NO** - Updated to new palette |
| Icon Button | Text Primary `#000080` | Text Primary `#000080` | `#000080` → `#000080` | **NO** - Updated to new palette |

### Inputs

| Semantic Role | Light Theme | Dark Theme | Current Implementation | Needs Change |
| ------------- | ----------- | ---------- | ---------------------- | ------------ |
| Search Surface | Surface Primary `#A18671` | Surface Dark `#6A5240` | `#A18671` → `#6A5240` | **NO** - Updated to new palette |
| Search Text | Text Primary `#000080` | Text Primary `#000080` | `#000080` → `#000080` | **NO** - Updated to new palette |
| Placeholder | Text Secondary `#0D0D60` | Text Secondary `#0D0D60` | `#0D0D60` → `#0D0D60` | **NO** - Updated to new palette |
| Input Border | Surface Dark `#6A5240` | Surface Primary `#A18671` | `#6A5240` → `#A18671` | **NO** - Updated to new palette |
| Focus State | Text Primary `#000080` | Text Primary `#000080` | `#000080` → `#000080` | **NO** - Updated to new palette |

### Pills

| Semantic Role | Light Theme | Dark Theme | Current Implementation | Needs Change |
| ------------- | ----------- | ---------- | ---------------------- | ------------ |
| Active Pill | Text Primary `#000080` | Text Primary `#000080` | `#000080` → `#000080` | **NO** - Updated to new palette |
| Inactive Pill | Surface Dark `#6A5240` | Surface Primary `#A18671` | `#6A5240` → `#A18671` | **NO** - Updated to new palette |
| Status Pills | Status colors (success/warning/danger) | Status colors (success/warning/danger) | `#10b981` / `#f59e0b` / `#ef4444` | **NO** - Status colors are correct |

### Reader

| Semantic Role | Light Theme | Dark Theme | Current Implementation | Needs Change |
| ------------- | ----------- | ---------- | ---------------------- | ------------ |
| Reader Background | Surface Primary `#A18671` | Surface Dark `#6A5240` | `#A18671` → `#6A5240` | **NO** - Updated to new palette |
| Lyrics | Text Primary `#000080` | Text Primary `#000080` | `#000080` → `#000080` | **NO** - Updated to new palette |
| Chords | Text Secondary `#0D0D60` | Text Secondary `#0D0D60` | `#0D0D60` → `#0D0D60` | **NO** - Updated to new palette |
| Reader Toolbar | Surface Primary `#A18671` | Surface Dark `#6A5240` | `#A18671` → `#6A5240` | **NO** - Updated to new palette |
| Section Divider | Surface Dark (lower opacity) | Surface Primary (lower opacity) | `#6A5240` → `#A18671` | **NO** - Updated to new palette |

### Cards

| Semantic Role | Light Theme | Dark Theme | Current Implementation | Needs Change |
| ------------- | ----------- | ---------- | ---------------------- | ------------ |
| Song Cards | Surface Primary `#A18671` | Surface Dark `#6A5240` | `#A18671` → `#6A5240` | **NO** - Updated to new palette |
| Selected Song Card | Text Primary `#000080` | Text Primary `#000080` | `#000080` → `#000080` | **NO** - Updated to new palette |
| Hover State | Surface Dark `#6A5240` | Surface Primary `#A18671` | `#6A5240` → `#A18671` | **NO** - Updated to new palette |
| Empty State | Surface Primary `#A18671` | Surface Dark `#6A5240` | `#A18671` → `#6A5240` | **NO** - Updated to new palette |

### Navigation

| Semantic Role | Light Theme | Dark Theme | Current Implementation | Needs Change |
| ------------- | ----------- | ---------- | ---------------------- | ------------ |
| Header | Surface Primary `#A18671` | Surface Dark `#6A5240` | `#A18671` → `#6A5240` | **NO** - Updated to new palette |
| Sidebar | Surface Primary `#A18671` | Surface Dark `#6A5240` | `#A18671` → `#6A5240` | **NO** - Updated to new palette |
| Context Rail | Surface Dark `#6A5240` | Surface Primary `#A18671` | `#6A5240` → `#A18671` | **NO** - Updated to new palette |
| Dialogs | Surface Primary `#A18671` | Surface Dark `#6A5240` | `#A18671` → `#6A5240` | **NO** - Updated to new palette |
| Settings | Surface Primary `#A18671` | Surface Dark `#6A5240` | `#A18671` → `#6A5240` | **NO** - Updated to new palette |

---

## Summary of Required Changes

### Changes Completed

1. **✅ Replace Indigo/Slate with Surface & Text families**
   - Implemented: Surface Family (`#A18671`, `#6A5240`) + Text Family (`#000080`, `#0D0D60`)
   - All Slate, Gray, Zinc, Indigo colors removed from theme system

2. **✅ Define all semantic roles**
   - All 39 semantic roles now mapped to Surface or Text families
   - Missing roles defined: Ghost Button, Icon Button, Search Text, Placeholder, Focus State, Reader Toolbar, Selected Song Card, Hover State, Empty State, Header, Context Rail

3. **✅ Update CSS implementation**
   - Phase 1-6 completed: All CSS variables updated to new palette
   - Both Light and Dark themes now use consistent Surface & Text families

### Implementation Status

- **Phase 1**: ✅ Define Surface & Text CSS variables
- **Phase 2**: ✅ Update all surface tokens
- **Phase 3**: ✅ Update all typography tokens
- **Phase 4**: ✅ Update all interactive tokens
- **Phase 5**: ✅ Define and implement missing semantic roles
- **Phase 6**: ✅ Verify all components consume semantic tokens

---

## Design Principles Verification

### Limited Palette
- ✅ Only Surface colors (`#A18671`, `#6A5240`) + Text colors (`#000080`, `#0D0D60`) + status colors used
- ✅ No Slate, Gray, Zinc, Indigo, or other neutral families remain

### Consistent Visual Language
- ✅ Light theme: Surface Primary (`#A18671`) surfaces with Text Primary (`#000080`) text
- ✅ Dark theme: Surface Dark (`#6A5240`) surfaces with Text Primary (`#000080`) text
- ✅ Same visual language across themes with surface contrast inversion

### Theme Coherence
- ✅ Dark theme is same visual language, not inverted Light theme
- ✅ Every semantic role belongs to Surface or Text family
- ✅ Simple contrast inversion between themes

---

## Implementation Complete

All 39 semantic roles have been mapped to the Surface & Text color families. The CSS implementation has been updated to use the new palette in both Light and Dark themes. The application now uses a consistent visual language built around only 4 foundation colors plus status colors.
