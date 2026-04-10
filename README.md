# School ERP

A web-based School ERP built with React and Vite, featuring a modular architecture and Tailwind-based UI components.

Live Demo:
`https://school-erp-seven-bice.vercel.app/organization`

## Tech Stack

- React
- Vite
- Tailwind CSS
- shadcn/ui

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

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — create a production build
- `npm run preview` — preview the production build locally

## Deployment

This project is deployed on Vercel. The latest build is available at:
`https://school-erp-seven-bice.vercel.app/organization`

## Roadmap

- Expand module coverage (attendance, fees, reports)
- Enhance role-based access and permissions
- Improve reporting and exports
