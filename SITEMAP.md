# Site Map & Navigation Flow

Visual guide to the application structure and user flows.

```
┌─────────────────────────────────────────────────────────────────┐
│                         Application Shell                        │
│  ┌───────────────┐  ┌────────────────────────────────────────┐ │
│  │   Sidebar     │  │            Main Content Area           │ │
│  │  Navigation   │  │              (Header)                  │ │
│  │               │  │          (Page Content)                │ │
│  └───────────────┘  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🗺️ Page Structure

```
Check Printing & Management System
│
├── 🏠 Dashboard (/)
│   ├── Statistics Overview (4 cards)
│   ├── Recent Activity Feed
│   └── Quick Actions Sidebar
│
├── 🖨️ Print Check (/print-check)
│   ├── Configuration Panel
│   │   ├── Country Selector
│   │   ├── Bank Selector
│   │   └── Template Selector
│   ├── Check Details Form
│   │   ├── Check Number
│   │   ├── Date
│   │   ├── Beneficiary
│   │   ├── Amount & Currency
│   │   └── Memo
│   └── Check Preview Canvas
│       └── Live RTL/LTR Preview
│
├── ✏️ Template Editor (/template-editor)
│   ├── Template Settings Sidebar
│   │   ├── Template Name
│   │   ├── Bank Selection
│   │   └── Image Upload
│   ├── Field Library
│   │   └── Draggable Fields (7 types)
│   ├── Design Canvas
│   │   └── Drop Zone with Positioned Fields
│   └── Properties Panel
│       ├── Font Settings
│       ├── Alignment Controls
│       ├── Rotation Slider
│       └── Position Inputs
│
├── 📋 Batch Printing (/batch-printing)
│   ├── Batch Settings
│   │   ├── Batch Name
│   │   ├── Starting Check Number
│   │   ├── Default Date
│   │   └── Currency
│   ├── Import Panel
│   │   ├── File Upload Zone
│   │   ├── Manual Add Button
│   │   └── Template Download
│   ├── Batch Summary
│   │   ├── Total Checks Count
│   │   ├── Total Amount
│   │   └── Status Badge
│   ├── Checks Data Table
│   │   └── Editable Rows
│   └── Add Check Modal
│       └── Check Entry Form
│
└── 🗄️ Printed Checks (/printed-checks)
    ├── Statistics Bar (4 metrics)
    ├── Search & Filter Panel
    │   ├── Global Search
    │   ├── Date Range Filter
    │   ├── Status Filter
    │   ├── Amount Filter
    │   └── User Filter
    ├── Checks History Table
    │   ├── Sortable Columns
    │   ├── Status Badges
    │   └── Action Buttons
    ├── Pagination Controls
    └── Bulk Actions Bar (on selection)
```

---

## 🔄 User Flows

### Flow 1: Print Single Check

```
Dashboard
    ↓
Print Check Page
    ↓
Select Country → Triggers RTL/LTR
    ↓
Select Bank → Filters Templates
    ↓
Select Template → Shows Preview
    ↓
Fill Check Details
    ↓
Review Preview
    ↓
[Print Check Button]
    ↓
Success → Redirects to Printed Checks
```

### Flow 2: Create Custom Template

```
Dashboard
    ↓
Template Editor
    ↓
Enter Template Name
    ↓
Select Bank
    ↓
Upload Check Image (optional)
    ↓
Drag Fields to Canvas
    ↓
Click Field → Edit Properties
    ↓
Adjust Position/Style
    ↓
[Save Template Button]
    ↓
Template Saved
```

### Flow 3: Batch Print Checks

```
Dashboard
    ↓
Batch Printing Page
    ↓
Configure Batch Settings
    ↓
Option A: Upload CSV/Excel
    ↓
Review Imported Checks
    ↓
OR
    ↓
Option B: Add Manually
    ↓
Fill Check Details
    ↓
Add to Batch
    ↓
Review Batch Summary
    ↓
[Print All Button]
    ↓
Batch Processed
```

### Flow 4: View Check History

```
Dashboard or Any Page
    ↓
Printed Checks Page
    ↓
Search by Keyword
    ↓
Apply Filters
    ↓
View Results
    ↓
Actions:
    ├── View Check Details
    ├── Reprint Check
    ├── Export Records
    └── Void Check
```

---

## 🎯 Navigation Patterns

### Primary Navigation (Sidebar)

```
┌─────────────────┐
│   CheckPro      │ ← Logo/Brand
├─────────────────┤
│ 🏠 Dashboard    │
│ 🖨️ Print Check  │
│ ✏️ Template Ed. │
│ 📋 Batch Print  │
│ 🗄️ Printed Chks │
├─────────────────┤
│  Version 1.0.0  │ ← Footer
└─────────────────┘
```

**Behavior:**
- Always visible (fixed position)
- Active state highlighting
- Hover effects
- Icon + label pattern

### Secondary Navigation (Header)

```
┌────────────────────────────────────────────────────────────┐
│  Page Title                    🌐 🔔 ⚙️ 👤 John Doe       │
│  Subtitle                      Language Notifications ...  │
└────────────────────────────────────────────────────────────┘
```

**Actions:**
- Language toggle (for RTL/LTR)
- Notifications (with badge)
- Settings
- User profile

### Breadcrumbs (Future Enhancement)

```
Home > Batch Printing > Edit Batch
```

---

## 📱 Screen Hierarchy

### Information Architecture

```
Level 1: Main Sections
├── Dashboard (Overview)
├── Single Operations
│   ├── Print Check
│   └── Template Editor
└── Bulk Operations
    ├── Batch Printing
    └── Printed Checks (History)

Level 2: Sub-sections
└── Each page has:
    ├── Configuration/Settings
    ├── Main Content Area
    └── Action Controls

Level 3: Components
└── Reusable elements:
    ├── Forms
    ├── Tables
    ├── Cards
    ├── Modals
    └── Panels
```

---

## 🔀 Data Flow (Mock)

```
User Input
    ↓
Form Components
    ↓
Mock Data (src/lib/mock-data.ts)
    ↓
State Management (useState)
    ↓
UI Update
    ↓
Visual Feedback
```

### For Production Implementation:

```
User Input
    ↓
Form Validation
    ↓
API Request
    ↓
Backend Processing
    ↓
Database Update
    ↓
Response
    ↓
UI Update + Notification
```

---

## 🎨 Component Hierarchy

```
App
└── RootLayout
    └── AppLayout
        ├── Sidebar (fixed)
        ├── Header (sticky)
        └── MainContent
            └── Page Components
                ├── Cards
                ├── Forms
                ├── Tables
                ├── Modals
                └── Buttons
```

### Shared Components

```
components/
├── AppLayout.tsx        → Wrapper for all pages
├── Sidebar.tsx         → Left navigation
└── Header.tsx          → Top bar with actions
```

### Page-Specific Components

```
app/
├── page.tsx                    → Dashboard widgets
├── print-check/page.tsx       → Form + Preview
├── template-editor/page.tsx   → DND Canvas + Properties
├── batch-printing/page.tsx    → Table + Modal
└── printed-checks/page.tsx    → Table + Filters
```

---

## 🔗 Cross-Page Links

### From Dashboard:

- Quick Action: "Print Single Check" → `/print-check`
- Quick Action: "Batch Print" → `/batch-printing`
- Quick Action: "Create Template" → `/template-editor`
- Activity Item Click → Relevant page

### From Print Check:

- After Print → `/printed-checks`
- "Use Different Template" → `/template-editor`

### From Template Editor:

- "Preview Template" → Modal or `/print-check`
- After Save → Stay or return

### From Batch Printing:

- After Process → `/printed-checks`
- Import Template → Downloads

### From Printed Checks:

- Reprint → `/print-check` (pre-filled)
- View Details → Modal or detail page

---

## 📊 State Management

### Current (UI-Only):

```
Component Level State (useState)
├── Form values
├── Modal visibility
├── Selected items
├── Filter values
└── Pagination state
```

### Production Recommendation:

```
Global State (Zustand/Redux)
├── User authentication
├── Current bank/country
├── Templates list
├── Check history cache
└── User preferences

Server State (React Query)
├── API data fetching
├── Caching
├── Background updates
└── Optimistic updates
```

---

## 🎯 Key Interactions

### 1. Country → Bank → Template Cascade

```
Select Country
    ↓ (filters)
Available Banks Update
    ↓ (select bank)
Available Templates Update
    ↓ (select template)
Preview Updates
```

### 2. Drag & Drop Field Placement

```
Grab Field from Library
    ↓ (drag)
Move Over Canvas
    ↓ (drop)
Field Placed
    ↓ (click)
Properties Panel Opens
    ↓ (edit)
Field Updates Live
```

### 3. Table Filtering

```
Enter Search Term
    ↓ (live filter)
Results Update
    ↓ (toggle filters)
Filter Panel Opens
    ↓ (apply filters)
Table Updates
    ↓ (pagination)
Navigate Pages
```

---

## 📱 Responsive Breakpoints

```
Mobile          Tablet          Desktop         Wide
0-640px         641-1024px      1025-1280px     1281px+
│               │               │               │
Single Column   2 Columns       3 Columns       Full Layout
Stacked         Sidebar Hide    All Visible     Expanded
```

---

## 🎨 Layout Variations

### Dashboard: Grid Layout

```
┌────────┬────────┬────────┬────────┐
│ Stat 1 │ Stat 2 │ Stat 3 │ Stat 4 │
├────────┴────────┴────────┴────────┤
│                                    │
│          Recent Activity           │
│                                    │
└────────────────────────────────────┘
```

### Print Check: Split Layout

```
┌─────────┬──────────────────────────┐
│         │                          │
│ Config  │    Check Preview         │
│ Panel   │                          │
│         │                          │
└─────────┴──────────────────────────┘
```

### Template Editor: Three-Column

```
┌────┬────────────────┬──────────┐
│    │                │          │
│ F  │    Canvas      │   Props  │
│ i  │                │          │
│ e  │                │          │
│ l  │                │          │
│ d  │                │          │
│ s  │                │          │
└────┴────────────────┴──────────┘
```

---

This sitemap provides a complete overview of how the application is structured and how users navigate through different features.


