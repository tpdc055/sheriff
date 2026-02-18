# Court Case Management System

> A comprehensive judiciary case management prototype designed for the Kenyan Judiciary

[![Live Demo](https://img.shields.io/badge/demo-live-green)](https://same-pv8ydhxhw52-latest.netlify.app)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Overview

This is a cloud-hosted prototype of a Court Case Management System built to demonstrate end-to-end workflow for judiciary operations including registry/filing, scheduling, orders, and enforcement (Sheriff's office).

**Live Demo:** https://same-pv8ydhxhw52-latest.netlify.app

## Key Features

### 1. **Dashboard**
- Real-time KPIs (Active Cases, Filed This Month, Pending Hearings, Enforcement Actions)
- Revenue tracking with month-over-month comparison
- Enforcement Completion Rate monitoring
- Average Case Age metrics
- Cases by Age Bracket (color-coded distribution)
- Monthly Case Trend (filed vs closed visualization)
- Upcoming Hearings preview
- Top Process Bottlenecks identification

### 2. **Registry & Filing (Cases Module)**
- Create new cases with type, priority, and parties
- Filter by status and type
- Comprehensive case details with tabs:
  - Case Details & Filing Information
  - Parties & Counsel
  - Timeline & Events
  - Documents & Attachments
- Auto-generated filing references
- Support for Civil, Criminal, Commercial, Family, and Probate cases

### 3. **Scheduling & Listings**
- Day and Week calendar views
- Cause list management
- Create and schedule hearings
- Hearing types: Mention, Trial, Ruling, Directions, Status, Settlement
- Court room assignment

### 4. **Orders & Directions**
- Create draft orders
- Order workflow: Draft → Pending Review → Issued → Served → Executed
- Order types: Rulings, Injunctions, Writs, Summons, Directions, Judgments
- Judicial sign-off capability

### 5. **Sheriff/Enforcement** ⭐ *Key Differentiator*
- Writ management (Execution, Attachment, Possession, Arrest, Search)
- Service attempt logging with outcomes tracking
- Seizure inventory register with:
  - Item description and estimated value
  - Condition tracking
  - Storage location management
  - Disposition records
- Comprehensive fee ledger:
  - Writ execution fees
  - Service fees
  - Seizure & storage fees
  - Receipt generation
  - Payment tracking

### 6. **Audit Log**
- Complete activity timeline
- Filter by action type and module
- Track who changed what, when, and why
- IP address logging
- Before/after value tracking for updates

### 7. **Reports & Analytics**
- **Overview Tab**: Key metrics and trends
- **Cases Tab**: Distribution by type, age, and status
- **Enforcement Tab**: Writ statistics and service outcomes
- **Finance Tab**: Revenue tracking and fee collection rates

## Role-Based Access Control

The system supports 7 user roles with different permissions:

| Role | Permissions |
|------|------------|
| **Registrar** | Full system access, can manage all modules |
| **Registry** | Create/edit cases, schedule hearings, view reports |
| **Judge** | View assigned cases, create/issue orders, schedule hearings |
| **Associate** | Assist judges with order preparation and scheduling |
| **Sheriff** | Manage enforcement, log service attempts, track seizures |
| **Finance** | View financial reports, track fee collection |
| **Admin** | System administration and user management |

Switch between roles using the dropdown in the sidebar to see different permission levels.

## Tech Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **State Management:** React Context API
- **Package Manager:** Bun
- **Deployment:** Netlify (Dynamic Site)
- **Fonts:** Inter (via Next.js Font Optimization)

## Getting Started

### Prerequisites

- Bun (recommended) or Node.js 18+
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/tpdc055/sheriff.git
cd sheriff
```

2. Install dependencies:
```bash
bun install
# or
npm install
```

3. Run the development server:
```bash
bun dev
# or
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
bun run build
# or
npm run build
```

## Demo Data

The system uses **synthetic demo data only** for security and privacy:
- Fake names and case numbers
- Simulated court proceedings
- Sample financial data
- No real court information

Use the **"Reset Demo Data"** button in the sidebar to restore the original demo dataset.

## Project Structure

```
court-case-management/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── page.tsx           # Dashboard
│   │   ├── cases/             # Cases module
│   │   ├── scheduling/        # Scheduling module
│   │   ├── orders/            # Orders module
│   │   ├── enforcement/       # Enforcement module
│   │   ├── audit/             # Audit log
│   │   └── reports/           # Reports module
│   ├── components/
│   │   ├── sidebar.tsx        # Main navigation
│   │   └── ui/                # shadcn/ui components
│   └── lib/
│       ├── types.ts           # TypeScript type definitions
│       ├── mock-data.ts       # Demo data
│       ├── store.tsx          # State management
│       └── utils.ts           # Utility functions
├── .same/                     # Project documentation
└── public/                    # Static assets
```

## Roadmap for Production

### Phase 2: Pilot Implementation
- [ ] Supabase backend integration (PostgreSQL + Auth + RLS)
- [ ] Real authentication with role management
- [ ] Document upload with versioning and checksums
- [ ] Email/SMS notification system
- [ ] PDF generation for orders and receipts

### Phase 3: Production Deployment
- [ ] On-premises database deployment
- [ ] Hybrid cloud architecture (app tier + on-prem data)
- [ ] Advanced search and filtering
- [ ] Batch operations
- [ ] Excel/PDF export functionality
- [ ] Backup and disaster recovery
- [ ] Compliance and security audit
- [ ] National rollout

## Security Features

Even in prototype phase, security best practices are followed:

- ✅ Synthetic data only (no real court information)
- ✅ Role-based access control (RBAC)
- ✅ Audit logging for all actions
- ✅ Secure state management
- ✅ Input validation
- ✅ No sensitive data in version control

## Demo Script for Presentations

1. **Login** - Switch between different roles using the sidebar dropdown
2. **Dashboard** - Review KPIs, bottlenecks, and trends
3. **Create Case** - File a new case with parties and details
4. **Schedule Hearing** - Add a hearing to the calendar
5. **Issue Order** - Create and issue a court order
6. **Log Enforcement** - Record a service attempt or seizure
7. **View Audit Log** - Track all system activity
8. **Generate Reports** - View analytics across modules
9. **Reset Demo** - Clear and restore demo data

## Contributing

This is a prototype for demonstration purposes. For production deployment inquiries or contributions, please contact the development team.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Same](https://same.new) - Cloud-based IDE
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)

## Support

For technical support or inquiries about production deployment:
- Email: admin@court.demo
- Documentation: See `.same/todos.md` for project status

---

**Note:** This is a prototype system using synthetic data. Do not upload real court documents or sensitive information.
