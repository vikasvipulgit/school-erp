# Javiya Schooling System

A full-stack school ERP with role-based access control, timetable management, tasks, leave, attendance, fees, push notifications, and reports.

Live Demo: `https://school-erp-seven-bice.vercel.app/organization`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS + shadcn/ui |
| Backend | NestJS 10 + TypeORM |
| Database | PostgreSQL (Azure Database for PostgreSQL) |
| Auth | JWT (access + refresh tokens, bcrypt passwords) |
| Notifications | Firebase Cloud Messaging (FCM) push notifications |
| Email | Nodemailer + SendGrid |
| API Docs | Swagger — `http://localhost:4000/api/docs` |

---

## Project Structure

```
school-erp/
├── frontend/          # React + Vite frontend
│   └── src/
│       ├── core/      # Auth, API client, shared layouts
│       ├── firebase/  # Firebase app + messaging init
│       ├── utils/     # Notification helpers
│       └── modules/   # Feature modules (timetable, tasks, leave, …)
│
└── backend-nest/      # NestJS + PostgreSQL backend
    └── src/
        ├── auth/          # JWT auth (register / login / refresh / logout)
        ├── users/         # User management + FCM token storage
        ├── firebase/      # Firebase Admin SDK (push notifications)
        ├── subjects/      # Subjects CRUD
        ├── teachers/      # Teachers CRUD
        ├── classes/       # Classes CRUD
        ├── rooms/         # Rooms CRUD
        ├── periods/       # Periods CRUD
        ├── tasks/         # Tasks + assignments
        ├── leave/         # Leave applications + proxy assignments
        ├── timetable/     # Timetable save & publish
        ├── attendance/    # Attendance marking
        ├── fees/          # Fee records
        ├── reports/       # Reports
        └── database/      # TypeORM entities + seed script
```

---

## Getting Started

### 1. Backend

```sh
cd backend-nest
cp .env.example .env          # fill in DB credentials, JWT secrets, and Firebase service account
npm install
npm run start:dev             # http://localhost:4000/api
```

**Swagger UI:** `http://localhost:4000/api/docs`

**Seed initial data** (subjects, teachers, classes, rooms, periods, and teacher login accounts):
```sh
npm run seed
```

Use a custom default password for seeded teacher accounts:
```sh
TEACHER_SEED_PASSWORD=Teacher@123 npm run seed
```

### 2. Frontend

```sh
cd frontend
cp .env.example .env.local    # fill in API URL and Firebase config
npm install
npm run dev                   # http://localhost:5173
```

---

## Environment Variables

### Backend (`backend-nest/.env`)

```env
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=school_erp

# JWT
JWT_ACCESS_SECRET=change-me-access-secret-min-32-chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_SECRET=change-me-refresh-secret-min-32-chars
JWT_REFRESH_EXPIRY=7d

# Firebase Admin SDK — paste the full service account JSON as a single-line string
# Get from: Firebase Console → Project Settings → Service accounts → Generate new private key
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}
```

### Frontend (`frontend/.env.local`)

```env
VITE_API_BASE_URL=http://localhost:4000/api

# Firebase — get from Firebase Console → Project Settings → Your apps
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=

# FCM VAPID key — Firebase Console → Project Settings → Cloud Messaging → Web Push certificates
VITE_FIREBASE_VAPID_KEY=
```

> The Firebase service worker (`public/firebase-messaging-sw.js`) is generated automatically at build time and during dev from `src/firebase-messaging-sw.template.js` — do not edit or commit it.

---

## API Endpoints

All endpoints are prefixed with `/api`. Auth header: `Authorization: Bearer <accessToken>`.

### Auth (public)
| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login — returns access + refresh tokens |
| POST | `/auth/refresh` | Exchange refresh token for new access token |
| POST | `/auth/logout` | Invalidate refresh token |
| GET | `/auth/me` | Current user profile |
| POST | `/auth/users/:id/role` | Set user role (admin only) |

### Reference Data (all authenticated)
| Method | Path |
|---|---|
| GET/POST/PATCH/DELETE | `/subjects`, `/teachers`, `/classes`, `/rooms`, `/periods` |

### Tasks
| Method | Path | Access |
|---|---|---|
| GET | `/tasks` | admin/principal: all; teacher: assigned only |
| POST | `/tasks` | teacher+ |
| PATCH | `/tasks/:id` | creator or admin |
| DELETE | `/tasks/:id` | admin |
| GET | `/tasks/:id/assignments` | all authenticated |
| GET | `/tasks/assignments/mine` | teacher (own assignments) |
| PATCH | `/tasks/assignments/:id/status` | assigned teacher or admin |

### Leave
| Method | Path | Access |
|---|---|---|
| GET | `/leave` | coordinator+: all; teacher: own |
| POST | `/leave` | teacher+ |
| PATCH | `/leave/:id/approve` | coordinator+ |
| PATCH | `/leave/:id/reject` | coordinator+ |
| GET/POST | `/leave/proxy` | coordinator+ |
| PATCH | `/leave/proxy/:id/approve` | coordinator+ |

### Timetable
| Method | Path | Access |
|---|---|---|
| GET | `/timetable` | all authenticated |
| POST | `/timetable/save` | coordinator+ |
| POST | `/timetable/publish` | coordinator+ |

### Attendance / Fees / Reports
| Path | Read | Write |
|---|---|---|
| `/attendance` | teacher+ | teacher+ |
| `/fees` | teacher+ (all), any (own `/fees/me`) | admin |
| `/reports` | teacher+ | admin |

### Users
| Method | Path | Description |
|---|---|---|
| POST | `/users/save-fcm-token` | Save FCM push token for the current user |

---

## Role Hierarchy

```
student (0) < parent (1) < teacher (2) < coordinator (3) < principal (4) < admin (5)
```

Roles are stored in the `users` table and encoded in the JWT. Use `POST /auth/users/:id/role` (admin only) to change a user's role.

---

## Scripts

### Backend
```sh
npm run start:dev   # watch mode
npm run build       # compile to dist/
npm run start       # run compiled dist/main.js
npm run seed        # seed reference data and teacher login accounts into PostgreSQL
```

### Frontend
```sh
npm run dev         # dev server
npm run build       # production build (also generates firebase-messaging-sw.js)
npm run preview     # preview production build
npm run lint        # ESLint
npm run format      # Prettier
```

---

## Deployment (Azure + Vercel)

1. Provision **Azure Database for PostgreSQL** and note the connection string.
2. Deploy `backend-nest/` to **Azure App Service** (Node 20 LTS):
   - Set all `DB_*`, `JWT_*`, `FIREBASE_SERVICE_ACCOUNT`, and `FRONTEND_URL` env vars.
   - Run `npm run seed` once after first deploy to populate reference data.
3. Deploy `frontend/` to **Vercel**:
   - Set `VITE_API_BASE_URL` to the Azure App Service URL.
   - Set all `VITE_FIREBASE_*` vars in the Vercel project settings.
4. Swagger UI is available at `<backend-url>/api/docs`.
