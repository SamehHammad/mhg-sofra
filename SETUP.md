# Setup Guide

## Quick Start

Follow these steps to get the Check Printing & Management System UI running:

### Step 1: Install Dependencies

```bash
npm install
```

This will install:
- Next.js 15
- React 18
- Tailwind CSS
- DND Kit (for drag & drop)
- Lucide React (for icons)
- TypeScript

### Step 2: Run Development Server

```bash
npm run dev
```

The application will start on [http://localhost:3000](http://localhost:3000)

### Step 3: Explore the Screens

Navigate through the sidebar to explore all features:

1. **Dashboard** (`/`) - Overview and statistics
2. **Print Check** (`/print-check`) - Single check creation
3. **Template Editor** (`/template-editor`) - Design custom templates
4. **Batch Printing** (`/batch-printing`) - Process multiple checks
5. **Printed Checks** (`/printed-checks`) - View history and records

## Development

### File Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/             # Reusable UI components
└── lib/                    # Utilities and mock data
```

### Adding New Pages

Create a new folder in `src/app/`:

```typescript
// src/app/new-page/page.tsx
import AppLayout from '@/components/AppLayout';

export default function NewPage() {
  return (
    <AppLayout title="New Page" subtitle="Description">
      {/* Your content */}
    </AppLayout>
  );
}
```

### Styling

This project uses Tailwind CSS with custom utility classes defined in `globals.css`:

- **Buttons:** `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-outline`
- **Forms:** `.input`, `.select`, `.label`
- **Layout:** `.card`, `.table`

### Mock Data

All mock data is centralized in `src/lib/mock-data.ts`. Modify or extend it as needed:

```typescript
export const countries = [
  { id: '1', name: 'United States', code: 'US', direction: 'ltr' },
  // Add more countries...
];
```

## RTL/LTR Support

The system dynamically switches between RTL and LTR based on country selection:

1. Country selection triggers direction change
2. Check preview adapts layout
3. Text alignment and spacing adjust automatically

## Customization

### Brand Colors

Edit `tailwind.config.ts`:

```typescript
colors: {
  primary: {
    600: '#your-brand-color',
    // ... other shades
  }
}
```

### Logo & Branding

Update the logo in `src/components/Sidebar.tsx`:

```typescript
<h1 className="font-bold text-lg">Your Brand</h1>
```

### Navigation

Modify navigation items in `src/components/Sidebar.tsx`:

```typescript
const navigation = [
  { name: 'Your Page', href: '/your-page', icon: YourIcon },
  // ...
];
```

## Build for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

## Troubleshooting

### Port Already in Use

If port 3000 is busy, specify a different port:

```bash
npm run dev -- -p 3001
```

### TypeScript Errors

Run type checking:

```bash
npx tsc --noEmit
```

### Clear Cache

If you encounter build issues:

```bash
rm -rf .next
npm run dev
```

## Next Steps

This is a UI-only implementation. To make it production-ready:

1. **Add Backend API** - Connect to your server
2. **Implement Authentication** - User login and permissions
3. **Add Validation** - Form validation and error handling
4. **Database Integration** - Store templates and check history
5. **PDF Generation** - For actual check printing
6. **Testing** - Add unit and integration tests

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [DND Kit](https://docs.dndkit.com/)
- [Lucide Icons](https://lucide.dev/)

## Support

This is a UI template project. For questions or improvements:

1. Review the code structure
2. Check component implementations
3. Refer to the mock data patterns
4. Customize to your requirements

Happy coding! 🚀


