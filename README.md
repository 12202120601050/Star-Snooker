# 🎱 Star Snooker Academy

Full-stack web app for **Star Snooker Academy** — Vraj Prime Complex, Vallabh Vidyanagar, Anand.

## Structure
```
star-snooker/
├── (frontend)   Next.js 14 + Tailwind — public site + admin/staff/customer dashboards
└── backend/     Node + Express + MongoDB — JWT auth, tables, canteen, stock, bills
```

## What's inside
- **Public site** — hero, games, price list, location (snooker red/gold/black brand).
- **Staff/Admin dashboards** — live tables with **timer + loser-pays frames**, canteen stock, **shift stock count**, sales, members.
- **Customer login** — loyalty points + active table.
- Operational data syncs via the backend API (with a local-first offline fallback).

## Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env   # fill MONGODB_URI, JWT_SECRET, FRONTEND_URL
npm run seed           # creates admin 9601818268 / staff 9106005507 (PIN 1234)
npm run dev
```

### Frontend
```bash
npm install
# set NEXT_PUBLIC_API_URL in .env.local to the backend URL
npm run dev
```

> Change the default PINs after first login.
