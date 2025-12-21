# Check Printing & Management System

A modern, enterprise-grade UI for check printing and management built with Next.js 15.

## 🎯 Project Overview

This is a **UI-only implementation** designed as a visual foundation for an enterprise check printing system. It demonstrates:

- Clean, professional enterprise interface design
- RTL/LTR language support
- Drag-and-drop template editor
- Batch check processing interface
- Comprehensive data tables with search and filters

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
check-printing-system/
├── src/
│   ├── app/                      # Next.js 15 App Router
│   │   ├── page.tsx             # Dashboard
│   │   ├── print-check/         # Single check printing
│   │   ├── template-editor/     # Check template designer
│   │   ├── batch-printing/      # Batch operations
│   │   ├── printed-checks/      # Check history
│   │   ├── layout.tsx           # Root layout
│   │   └── globals.css          # Global styles
│   ├── components/              # Reusable UI components
│   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   ├── Header.tsx          # Page header
│   │   └── AppLayout.tsx       # Main layout wrapper
│   └── lib/
│       └── mock-data.ts        # Mock data constants
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## 🎨 Features & Screens

### 1. Dashboard (`/`)
- System overview with key metrics
- Recent activity feed
- Quick action buttons
- Stats visualization

### 2. Print Check (`/print-check`)
- Country and bank selection
- Template chooser
- Check details form (date, beneficiary, amount, etc.)
- Live check preview with RTL/LTR support
- Visual representation of check layout

### 3. Template Editor (`/template-editor`)
- Drag-and-drop field positioning using DND Kit
- Field property editor (font, size, alignment, rotation)
- Canvas-based design interface
- Visual field library
- Template upload placeholder

### 4. Batch Printing (`/batch-printing`)
- Batch configuration panel
- CSV/Excel import UI
- Manual check entry
- Batch summary with totals
- Editable check table
- Export functionality

### 5. Printed Checks (`/printed-checks`)
- Comprehensive search and filters
- Data table with pagination
- Status indicators
- Bulk actions support
- Export and reprint options
- Statistics dashboard

## 🛠 Technical Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS
- **Drag & Drop:** DND Kit
- **Icons:** Lucide React
- **Language:** TypeScript

## 🎨 Design Philosophy

This UI follows enterprise financial software best practices:

- **Clarity:** Clear hierarchy and visual structure
- **Precision:** Suitable for financial data entry
- **Predictability:** Consistent patterns throughout
- **Accessibility:** Semantic HTML and proper contrast
- **Responsiveness:** Mobile-first design approach

## 📝 Mock Data

All screens use mock data from `src/lib/mock-data.ts`:

- Countries with RTL/LTR settings
- Banks by country
- Check templates
- Currency options
- Sample printed checks
- Batch check data

## 🌍 RTL/LTR Support

The system supports both RTL (Arabic) and LTR (English) layouts:

- Dynamic direction switching based on country selection
- Proper text alignment and spacing
- Mirrored layouts for RTL languages
- Check preview adapts to selected direction

## 🎯 UI Components

### Reusable Components

- `Sidebar` - Navigation with active states
- `Header` - Page header with user menu
- `AppLayout` - Consistent page wrapper
- Form controls styled with Tailwind utilities

### Utility Classes

Custom Tailwind utilities defined in `globals.css`:

- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-outline`
- `.input`, `.select`, `.label`
- `.card`, `.table`, `.table-container`

## 🔄 Next Steps for Implementation

This is a **visual skeleton**. To make it functional:

1. **Backend Integration:**
   - Connect to API endpoints
   - Replace mock data with real data fetching

2. **State Management:**
   - Add Zustand/Redux for global state
   - Implement form validation

3. **Business Logic:**
   - Check number generation
   - Amount to words conversion
   - PDF generation for printing
   - Template persistence

4. **Authentication:**
   - User login system
   - Role-based access control
   - Audit logging

5. **Database:**
   - Store templates
   - Check history
   - User preferences

## 📦 Build for Production

```bash
npm run build
npm start
```

## 🎨 Customization

### Colors

Edit `tailwind.config.ts` to change the color scheme:

```typescript
colors: {
  primary: { /* your brand colors */ },
  neutral: { /* your grays */ }
}
```

### Fonts

Update `src/app/layout.tsx` to use custom fonts.

## 📄 License

This is a UI demonstration project. Use freely for your projects.

## 🤝 Contributing

This is a design template. Feel free to:

- Customize the design
- Add new features
- Improve accessibility
- Enhance responsiveness

---

**Note:** This is a UI-only implementation with no backend logic, authentication, or data persistence. All data is mock data for demonstration purposes.


