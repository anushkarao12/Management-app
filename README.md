# TaskFlow

A team task management application built with React, TypeScript, and Tailwind CSS.

## Features

- **Authentication** - Role-based access control (Admin/Member)
- **Dashboard** - Overview with stats, charts, and recent activity
- **Projects** - Create and manage team projects with member assignment
- **Tasks** - Kanban board with drag-and-drop, list view, comments
- **Team** - Member management with role assignment
- **Settings** - Profile, notifications, appearance preferences

## Tech Stack

- React 19 + TypeScript
- Tailwind CSS 4
- Recharts for data visualization
- React Hook Form + Zod validation
- Vite build system

## Project Structure

```
src/
├── components/
│   ├── layout/      # Sidebar, Header
│   └── ui/          # Button, Card, Modal, etc.
├── context/         # Auth, Theme providers
├── hooks/           # useWorkspace, useDebounce
├── lib/             # Utils, constants
├── pages/           # Dashboard, Projects, Tasks, etc.
├── services/        # Database, storage
└── types/           # TypeScript interfaces
```

## Getting Started

```bash
npm install
npm run dev
```

## Demo Accounts

- **Admin**: alex@company.io
- **Member**: sarah@company.io

(Any password works in demo mode)

## Architecture Decisions

- **Local Storage** - Data persists in browser for demo purposes
- **Service Layer** - Clean separation between UI and data operations
- **Custom Hooks** - Reusable data fetching with `useProjects`, `useTasks`, `useTeam`
- **Type Safety** - Full TypeScript coverage with strict mode

## Deployment

Build for production:

```bash
npm run build
```

Output in `dist/` directory.
