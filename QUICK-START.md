# Quick Start Guide

Get your Check Printing & Management System UI running in 3 minutes! ⚡

## 🚀 Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

### 3. Open in Browser

Navigate to: **http://localhost:3000**

---

## 🎯 What You'll See

### Main Screens Available:

1. **Dashboard** - `/`
   - Overview statistics
   - Recent activity
   - Quick actions

2. **Print Check** - `/print-check`
   - Select country, bank, template
   - Fill check details
   - Preview check layout

3. **Template Editor** - `/template-editor`
   - Drag & drop field positioning
   - Customize fonts and alignment
   - Save custom templates

4. **Batch Printing** - `/batch-printing`
   - Import CSV/Excel
   - Process multiple checks
   - Batch summary

5. **Printed Checks** - `/printed-checks`
   - Search and filter history
   - View all printed checks
   - Export and reprint

---

## 🎨 Key Features to Explore

### ✅ RTL/LTR Support
- Go to "Print Check"
- Select a country (e.g., United Arab Emirates for RTL)
- Watch the check preview switch direction

### ✅ Drag & Drop
- Go to "Template Editor"
- Drag fields from left sidebar onto canvas
- Click a field to edit its properties

### ✅ Batch Operations
- Go to "Batch Printing"
- See the batch summary and table
- Click "Add Check Manually" to see the modal

### ✅ Data Tables
- Go to "Printed Checks"
- Try the search bar
- Toggle filters to see the filter panel
- Navigate through pagination

---

## 📁 Project Structure

```
check/
├── src/
│   ├── app/                    # All pages (Next.js App Router)
│   │   ├── page.tsx           # Dashboard
│   │   ├── print-check/       # Single check printing
│   │   ├── template-editor/   # Template designer
│   │   ├── batch-printing/    # Batch operations
│   │   └── printed-checks/    # Check history
│   ├── components/            # Reusable components
│   │   ├── Sidebar.tsx       # Left navigation
│   │   ├── Header.tsx        # Top header bar
│   │   └── AppLayout.tsx     # Page wrapper
│   └── lib/
│       └── mock-data.ts      # All mock data
├── public/                    # Static assets
├── package.json
├── tailwind.config.ts
└── README.md
```

---

## 🎨 Customization Quick Tips

### Change Brand Colors

Edit `tailwind.config.ts`:

```typescript
colors: {
  primary: {
    600: '#YOUR_COLOR', // Main brand color
    // ...
  }
}
```

### Update Company Name

Edit `src/components/Sidebar.tsx`:

```typescript
<h1 className="font-bold text-lg text-neutral-900">Your Company</h1>
```

### Add Mock Data

Edit `src/lib/mock-data.ts`:

```typescript
export const countries = [
  // Add your countries here
];
```

### Add New Page

Create `src/app/your-page/page.tsx`:

```typescript
import AppLayout from '@/components/AppLayout';

export default function YourPage() {
  return (
    <AppLayout title="Your Page" subtitle="Description">
      <div className="card p-6">
        Your content here
      </div>
    </AppLayout>
  );
}
```

---

## 🎯 What's Inside

### Technologies Used

- ⚛️ **Next.js 15** - React framework with App Router
- 🎨 **Tailwind CSS** - Utility-first styling
- 🎭 **TypeScript** - Type safety
- 🎪 **DND Kit** - Drag and drop functionality
- 🎨 **Lucide React** - Beautiful icons

### UI Components

- Professional sidebar navigation
- Responsive data tables
- Form inputs with validation styles
- Modal dialogs
- Status badges
- Statistics cards
- Search and filter panels
- Pagination controls
- Drag-and-drop canvas

### Mock Data Includes

- Countries (5) with RTL/LTR settings
- Banks (13) across different countries
- Check templates (4)
- Currencies (5)
- Sample printed checks (5)
- Batch check examples (3)

---

## 🔧 Common Commands

```bash
# Install dependencies
npm install

# Start development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

---

## 📚 Documentation

- **README.md** - Project overview and features
- **SETUP.md** - Detailed setup and configuration guide
- **UI-FEATURES.md** - Complete UI components documentation
- **QUICK-START.md** - This file!

---

## 🎯 Next Steps

### For Demo/Presentation

1. Run `npm run dev`
2. Navigate through all screens
3. Show RTL/LTR switching
4. Demonstrate drag & drop
5. Show table filtering

### For Development

1. Review mock data structure
2. Plan backend API endpoints
3. Design database schema
4. Implement authentication
5. Add form validation
6. Connect to real data

### For Customization

1. Update brand colors
2. Replace logo
3. Customize navigation
4. Add/remove form fields
5. Adjust table columns
6. Modify mock data

---

## 💡 Tips

- **All data is mock** - No backend required to run
- **Responsive** - Works on different screen sizes
- **Modular** - Easy to customize individual components
- **Type-safe** - TypeScript catches errors early
- **Clean code** - Well-organized and commented
- **Modern stack** - Latest Next.js and React features

---

## ❓ Troubleshooting

### Port 3000 in use?

```bash
npm run dev -- -p 3001
```

### Dependencies not installing?

```bash
rm -rf node_modules package-lock.json
npm install
```

### Build errors?

```bash
rm -rf .next
npm run dev
```

---

## 🎉 You're All Set!

Your Check Printing & Management System UI is ready to explore and customize.

**Happy coding!** 🚀

---

## 📞 Key Points to Remember

1. ✅ This is a **UI-only** implementation
2. ✅ All data is **mock data**
3. ✅ No backend required to run
4. ✅ Fully responsive design
5. ✅ RTL/LTR support built-in
6. ✅ Production-ready visual design
7. ✅ Easy to customize and extend

Ready to build something amazing! 💪


