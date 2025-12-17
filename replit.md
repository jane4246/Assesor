# DocAssess - Document Assessment Platform

## Overview

DocAssess is a professional document assessment service platform built for the Kenyan market. Users upload documents (.doc, .docx, .rtf), pay KES 60 via M-Pesa mobile payments, and receive assessment reports via email. The application follows a clean full-stack architecture with React frontend, Express backend, and PostgreSQL database.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens defined in CSS variables
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite with hot module replacement

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Pattern**: RESTful endpoints under `/api/*` prefix
- **File Uploads**: Multer middleware storing files to `uploads/` directory
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Schema Validation**: Zod for request validation with drizzle-zod integration

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Key Tables**:
  - `users`: Basic user authentication
  - `documents`: Uploaded document metadata and payment status
  - `payments`: M-Pesa payment transaction records

### Application Flow
1. User uploads document → stored in filesystem, metadata in database
2. User initiates M-Pesa payment → payment record created
3. Payment callback updates status → document marked as paid
4. User provides email → assessment report delivery endpoint

### Project Structure
```
├── client/           # React frontend
│   └── src/
│       ├── pages/    # Route components (home, upload, payment, email, admin)
│       ├── components/ui/  # shadcn/ui components
│       ├── hooks/    # Custom React hooks
│       └── lib/      # Utilities and query client
├── server/           # Express backend
│   ├── routes.ts     # API route definitions
│   ├── storage.ts    # Database access layer
│   └── db.ts         # Database connection
├── shared/           # Shared code between frontend/backend
│   └── schema.ts     # Drizzle database schema
└── uploads/          # Uploaded document storage
```

### Design System
- Material Design principles for financial trust
- Inter font family via Google Fonts
- Green primary color (HSL 142 76% 36%) for brand identity
- Responsive layouts: mobile-first with tablet/desktop breakpoints

## External Dependencies

### Payment Integration
- **M-Pesa STK Push**: Safaricom mobile payment integration (implementation pending)
- Target payment number: +254710558915
- Fixed pricing: KES 60 per document

### Database
- **PostgreSQL**: Primary database via `DATABASE_URL` environment variable
- Connection pooling via `pg` package
- Schema migrations via `drizzle-kit push`

### File Storage
- Local filesystem storage in `uploads/` directory
- Supported formats: .doc, .docx, .rtf
- Maximum file size: 10MB

### Email Service
- Email delivery for assessment reports (implementation pending)
- Nodemailer package available for integration

### Third-Party Libraries
- `@tanstack/react-query`: Server state management
- `drizzle-orm` + `drizzle-zod`: Database ORM and validation
- `multer`: File upload handling
- `wouter`: Client-side routing
- `date-fns`: Date formatting utilities