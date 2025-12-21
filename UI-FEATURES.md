# UI Features Documentation

## Overview

This document describes the visual features and components of the Check Printing & Management System UI.

---

## 🎨 Design System

### Color Palette

**Primary Colors (Blue)**
- Primary-50 to Primary-900: Main brand colors
- Used for: Buttons, links, active states, highlights

**Neutral Colors (Gray)**
- Neutral-50 to Neutral-900: Text and backgrounds
- Used for: Text, borders, backgrounds, cards

**Semantic Colors**
- Green: Success states, printed checks
- Red: Errors, voided checks
- Yellow: Warnings, pending states
- Blue: Information, tips

### Typography

- **Headings:** Bold, various sizes (xl, 2xl)
- **Body:** Regular weight, readable size
- **Labels:** Small, medium weight, uppercase for section headers
- **Monospace:** Check numbers for distinction

### Spacing & Layout

- Consistent padding: 4, 6, 8 units
- Card spacing: p-6 standard
- Grid gaps: 4, 6 units
- Section separation: Clear visual hierarchy

---

## 📱 Screens Breakdown

### 1. Dashboard (`/`)

**Purpose:** System overview and quick access

**Components:**
- **Statistics Cards (4):**
  - Total Checks Printed
  - Checks This Month
  - Voided Checks
  - Active Templates
  - Each with icon, value, and trend indicator

- **Recent Activity Panel:**
  - Chronological list of recent actions
  - User attribution
  - Timestamps
  - Visual bullet points

- **Quick Actions Sidebar:**
  - Primary action buttons
  - Print Single Check (highlighted)
  - Batch Print
  - Create Template
  - View Reports

**Visual Elements:**
- Color-coded icons
- Trend indicators (up/down arrows)
- Timeline-style activity feed
- Card-based layout

---

### 2. Print Check (`/print-check`)

**Purpose:** Create and print individual checks

**Layout:** 2-column (1/3 left panel, 2/3 preview)

**Left Panel:**

1. **Location & Bank Section:**
   - Country dropdown (triggers RTL/LTR)
   - Bank dropdown (filtered by country)
   - Template selector (filtered by bank)
   - Cascade selection pattern

2. **Check Details Form:**
   - Check Number (auto or manual)
   - Date picker
   - Beneficiary text input
   - Amount numeric input
   - Currency dropdown
   - Amount in words (auto-filled, disabled)
   - Memo (optional)
   - Clear form sections with labels

3. **Action Buttons:**
   - Print Check (primary, with icon)
   - Save as Draft (outline)
   - Clear Form (secondary)

**Right Panel - Check Preview:**

- Large canvas area with dashed border
- Realistic check layout mockup
- Responsive to RTL/LTR selection
- Shows:
  - Company header
  - Check number
  - Date line
  - "Pay to order of" line
  - Amount box (numeric)
  - Amount in words line
  - Memo line
  - Signature line
- Empty state when no template selected

**Interactions:**
- Cascading dropdowns
- Live preview updates
- Direction toggle feedback

---

### 3. Template Editor (`/template-editor`)

**Purpose:** Design custom check templates with drag-and-drop

**Layout:** 3-column (left sidebar, center canvas, right properties)

**Left Sidebar:**

1. **Template Settings:**
   - Template name input
   - Bank selector
   - Image upload area (dashed border, hover state)
   - Upload icon and instructions

2. **Available Fields Library:**
   - Draggable field items
   - Icons for each field type
   - Visual feedback (green) when placed
   - Fields include:
     - Date
     - Pay to Order of
     - Amount (Numeric)
     - Amount (Words)
     - Memo
     - Signature
     - Check Number

**Center Canvas:**

- Fixed-size design area (800x350px)
- Represents check dimensions
- Background watermark (company info)
- Drop zone for fields
- Placed fields show:
  - Border highlight
  - Label text
  - Hover effects
  - Selection state (ring)
- DND Kit integration
- Drag overlay preview

**Right Sidebar - Properties Panel:**

- Context-sensitive (shows when field selected)
- **Properties:**
  - Field ID and label
  - Font family dropdown
  - Font size selector
  - Alignment buttons (left/center/right with icons)
  - Rotation slider (0-360°)
  - X/Y position inputs
  - Remove button (red)

- **Empty State:**
  - Icon placeholder
  - Instructional text

**Action Bar:**
- Preview button
- Save Template button (primary)

**Tips Panel:**
- Blue info box at bottom
- Usage instructions

---

### 4. Batch Printing (`/batch-printing`)

**Purpose:** Process multiple checks at once

**Layout:** 3-column top section + full-width table

**Top Section:**

1. **Batch Settings:**
   - Batch name input
   - Starting check number
   - Default date
   - Currency selector

2. **Import Data:**
   - Large upload dropzone
   - CSV/Excel support
   - "or" divider
   - Manual add button
   - Template download button

3. **Batch Summary:**
   - Total checks count (large)
   - Total amount (large, formatted)
   - Status badge
   - Print All button (primary)
   - Export button (outline)

**Checks Table:**

- Full-width data table
- Columns:
  - Checkbox (for bulk selection)
  - Check #
  - Beneficiary
  - Amount (formatted, bold)
  - Date
  - Status badge
  - Actions (edit, delete icons)
- Hover states on rows
- Empty state with icon and text

**Add Check Modal:**
- Centered overlay
- White card on dark backdrop
- Form fields:
  - Check number
  - Date
  - Beneficiary
  - Amount and currency
  - Memo
- Cancel/Add buttons

**Best Practices Panel:**
- Blue info card at bottom
- Checklist of tips
- Icon with content

---

### 5. Printed Checks (`/printed-checks`)

**Purpose:** View and manage check history

**Layout:** Full-width with top filters and table

**Statistics Bar:**
- 4 stat cards in row
- Color-coded icons:
  - Total Printed (blue)
  - Total Amount (green)
  - This Month (yellow)
  - Voided (red)
- Large numbers with small labels

**Search & Filter Panel:**

- **Search Bar:**
  - Full-width input
  - Search icon on left
  - Placeholder text
  - Live search capability

- **Filter Toggle Button:**
  - Outline style
  - Filter icon
  - Badge count when active

- **Export Button:**
  - Download icon
  - Aligned right

- **Filter Expansion:**
  - 4-column grid when expanded
  - Dropdowns:
    - Date range
    - Status
    - Amount range
    - User filter
  - Clear/Apply buttons

**Checks Table:**

- Full-width responsive table
- Columns:
  - Checkbox (select)
  - Check # (monospace)
  - Date
  - Beneficiary (bold)
  - Amount (formatted, bold)
  - Currency
  - Status (colored badge)
  - Printed By
  - Printed At (timestamp)
  - Actions (icons)

- **Status Badges:**
  - Green: Printed
  - Red: Voided
  - Yellow: Pending

- **Action Icons:**
  - Eye (view)
  - Printer (reprint)
  - More options (menu)

**Pagination:**

- Bottom bar with 3 sections:
  - Left: "Page X of Y"
  - Center: Page number buttons
  - Right: Items per page selector

- Navigation buttons:
  - Previous/Next with chevron icons
  - Disabled states when at limits
  - Current page highlighted (primary color)

**Bulk Actions Bar:**
- Fixed bottom bar (appears on selection)
- Shows count of selected items
- Action buttons:
  - Export Selected
  - Reprint Selected
  - Void Selected (red)

---

## 🎯 Common UI Patterns

### Navigation

**Sidebar:**
- Fixed left sidebar (64 units wide)
- Logo/brand at top
- Icon + text navigation items
- Active state (primary background)
- Hover states (subtle)
- Version info at bottom

**Header:**
- Sticky top bar
- Page title and subtitle
- Right-aligned utilities:
  - Language toggle (globe icon)
  - Notifications (bell with badge)
  - Settings
  - User profile with dropdown

### Buttons

**Primary:** Blue background, white text, hover state
**Secondary:** Gray background, dark text
**Outline:** White background, border, hover state
**Sizes:** Standard padding, icon + text combinations

### Forms

**Inputs:**
- Border style with focus ring
- Consistent padding
- Placeholder text
- Full width in containers
- Label above input pattern

**Dropdowns:**
- Chevron icon on right
- Disabled states (opacity)
- Consistent styling

**Validation:**
- Error states (red)
- Success states (green)
- Helper text below inputs

### Cards

- White background
- Subtle border
- Shadow on hover
- Consistent padding (p-6)
- Clear content sections

### Tables

- Striped or hover rows
- Header with background
- Uppercase small headers
- Proper spacing
- Action columns right-aligned
- Responsive overflow scroll

### Status Badges

- Rounded pills
- Color-coded by state
- Icon + text combinations
- Consistent sizing

### Empty States

- Centered content
- Large icon (neutral color)
- Primary message (bold)
- Secondary description
- Optional action button

### Loading States

*(For future implementation)*
- Skeleton screens
- Spinners
- Progress bars

---

## 🌍 RTL/LTR Support

### Implementation

- `dir` attribute on container
- CSS direction property
- Flex direction reversal
- Text alignment switching

### Affected Elements

- Navigation layout
- Form label positions
- Table alignment
- Check preview layout
- Icon positions

### Countries

- LTR: US, UK
- RTL: UAE, Saudi Arabia, Egypt

---

## ♿ Accessibility Features

- Semantic HTML elements
- Proper heading hierarchy
- Button type attributes
- Input labels
- ARIA attributes (for future enhancement)
- Keyboard navigation support
- Focus visible styles
- Sufficient color contrast

---

## 📱 Responsive Design

### Breakpoints (Tailwind)

- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px

### Adaptations

- Grid columns collapse on mobile
- Sidebar becomes hamburger menu (future)
- Table horizontal scroll on small screens
- Form inputs stack vertically
- Card grids reflow

---

## 🎨 Visual Polish

### Transitions

- Color transitions on hover (200ms)
- Smooth page transitions
- Button state animations
- Dropdown animations

### Shadows

- Card shadows (sm)
- Hover elevation
- Modal/overlay shadows (xl)
- Focus rings

### Icons

- Lucide React library
- Consistent 16-20px size
- Aligned with text
- Color matches context

### Spacing

- Consistent grid system
- Clear visual hierarchy
- Breathing room in forms
- Proper touch targets

---

## 🔧 Customization Points

### Easy to Change

1. **Colors:** `tailwind.config.ts`
2. **Branding:** Logo in `Sidebar.tsx`
3. **Navigation:** Items in `Sidebar.tsx`
4. **Mock Data:** `src/lib/mock-data.ts`
5. **Form Fields:** Component modifications

### Moderate Effort

1. Adding new pages
2. Custom form validation UI
3. Additional table columns
4. New filter types

### Requires Planning

1. Authentication UI
2. Multi-step wizards
3. Advanced data visualization
4. Print preview rendering

---

## 📚 Component Reusability

All major components are modular and reusable:

- `AppLayout` - Wraps all pages
- `Sidebar` - Navigation
- `Header` - Page headers
- Form controls via utility classes
- Consistent button patterns
- Card containers

**Usage Pattern:**

```typescript
import AppLayout from '@/components/AppLayout';

export default function YourPage() {
  return (
    <AppLayout title="Your Title" subtitle="Your subtitle">
      {/* Your content using utility classes */}
    </AppLayout>
  );
}
```

---

## 🎯 Design Principles Applied

1. **Clarity** - Clear visual hierarchy
2. **Consistency** - Repeated patterns
3. **Efficiency** - Minimal clicks
4. **Feedback** - Visual state changes
5. **Forgiveness** - Clear actions, confirmations (future)
6. **Precision** - Suitable for financial data
7. **Professional** - Enterprise-grade appearance

---

This UI provides a solid foundation for building a complete check printing system. All components are designed to be extended with real functionality when backend integration is added.


