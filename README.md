# School ERP React App (Vite + shadcn/ui)

This is a starter template for a React web application using Vite and shadcn/ui, styled with Tailwind CSS.

## Folder Structure

```
src/
├── core/                        ← shared across everything
│   ├── auth/
│   ├── components/              ← shared UI (Button, Table, Modal)
│   ├── hooks/                   ← shared hooks
│   ├── layouts/                 ← dashboard shell, sidebars
│   └── supabase/                ← DB client, types
│
├── modules/
│   ├── timetable/               ← Module 1 (V1)
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── index.js             ← public API of this module
│   │
│   ├── tasks/                   ← Module 2 (V1)
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── index.js
│   │
│   ├── attendance/              ← Module 3 (V2, not built yet)
│   ├── fees/                    ← Module 4 (V3, not built yet)
│   └── reports/                 ← Module 5 (V2)
│
└── app/
    ├── router.jsx               ← all routes in one place
    └── main.jsx
```

## Getting Started

1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the development server:
   ```sh
   npm run dev
   ```

## Next Steps
- Integrate shadcn/ui components
- Add your modules and business logic
