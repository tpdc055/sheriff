# Sheriff Mobile - Field Officer Portal

> A mobile-optimized web application for sheriff field officers to manage enforcement writs, log service attempts, document seizures, and track fees in the field.

## 🎯 Overview

Sheriff Mobile is a Progressive Web App (PWA) designed for field officers working in law enforcement and court enforcement. It enables officers to work efficiently in the field with full offline capabilities, GPS tracking, photo documentation, and digital signatures.

## ✨ Key Features

### 📱 Mobile-First Design
- Responsive UI optimized for smartphones and tablets
- Bottom navigation for easy thumb access
- Large touch targets for field use
- Works seamlessly on iOS and Android browsers

### 🌐 Offline-First Architecture
- **Full offline functionality** - works without internet connection
- Data persists in browser localStorage
- Automatic sync queue management
- Connection status indicator
- Last sync timestamp tracking

### 📍 GPS Location Tracking
- Capture precise GPS coordinates for service attempts
- Record seizure locations automatically
- View locations on Google Maps with one tap
- High accuracy mode for precise positioning

### 📸 Photo Documentation
- Capture photos directly from device camera
- Multi-photo upload for thorough documentation
- Automatic image compression to save storage
- Preview and remove photos before submission

### ✍️ Digital Signatures
- Signature capture pad for service acknowledgment
- Touch/stylus support
- Clear and retake functionality
- Signatures stored as base64 images

### 📋 Writ Management
- View all assigned writs with priority indicators
- Search by writ number, case number, or party name
- Filter by status (pending, in progress, executed, closed)
- Detailed writ view with 4 organized tabs

### 📊 Dashboard & Analytics
- Real-time statistics (total, pending, in progress, executed)
- Urgent writs requiring immediate attention
- Quick action buttons
- Officer profile and performance stats

## 🏗️ Tech Stack

- **Framework:** React 18 + Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Signature:** react-signature-canvas
- **State:** React Hooks + localStorage
- **Package Manager:** Bun
- **Fonts:** IBM Plex Sans + DM Serif Display

## 📁 Project Structure

```
sheriff-mobile/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   └── signature-pad.tsx # Signature capture component
│   ├── utils/
│   │   ├── gps.ts          # GPS location utilities
│   │   ├── storage.ts      # localStorage & offline sync
│   │   └── photo.ts        # Image handling & compression
│   ├── types.ts            # TypeScript type definitions
│   ├── mock-data.ts        # Demo data for testing
│   ├── App.tsx             # Main application component
│   └── index.css           # Global styles & mobile optimizations
├── .same/
│   └── todos.md            # Development progress tracker
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Bun (recommended) or Node.js 18+
- Modern web browser with localStorage support

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sheriff-mobile
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

4. Open your browser to `http://localhost:5173`

### Build for Production

```bash
bun run build
# or
npm run build
```

The production build will be in the `dist/` folder.

## 📱 Usage Guide

### Dashboard View
- View statistics at a glance
- See urgent writs requiring immediate attention
- Quick navigation to writs list
- Monitor connection status (online/offline)

### Writs List
- Search writs by number, case, or party name
- Filter by status using dropdown
- Tap any writ to view full details
- Color-coded priority badges

### Writ Detail Tabs

#### 1. Details Tab
- Target party information
- Service address
- Court instructions
- Writ metadata (type, dates, priority)

#### 2. Service Tab
- **View service history** with outcomes and notes
- **Log new service attempt:**
  - Select outcome (served, refused, not found, etc.)
  - Enter location manually or capture GPS
  - Add detailed notes
  - Capture digital signature (optional)
- GPS coordinates link to Google Maps
- Witness name recording

#### 3. Seizures Tab
- **View seized items** with photos and values
- **Record new seizure:**
  - Describe the item(s)
  - Enter estimated value (KES)
  - Record condition
  - Add storage location
  - Capture GPS coordinates
  - Take photos with device camera
- Total seized value calculation

#### 4. Fees Tab
- View fee summary (charged vs. collected)
- Outstanding balance tracking
- Detailed fee list with receipt numbers
- Payment status indicators

### Profile View
- Officer information and badge number
- Performance statistics
- Sync status and last sync time
- Logout option

## 🔧 Key Functionalities

### GPS Location Capture
```typescript
// Automatically captures:
- Latitude & Longitude
- Accuracy (in meters)
- Timestamp

// Features:
- High accuracy mode
- Error handling for denied permissions
- Google Maps link generation
```

### Photo Upload
```typescript
// Capabilities:
- Direct camera access (capture="environment")
- Multiple photo selection
- Automatic compression to <1MB per photo
- Base64 encoding for offline storage
- Preview before submission
- Remove unwanted photos
```

### Signature Capture
```typescript
// Features:
- Canvas-based drawing
- Touch and stylus support
- Clear functionality
- Base64 export
- Signature preview
```

### Offline Storage
```typescript
// localStorage structure:
sheriff_writs          // All writ data
sheriff_offline_queue  // Pending sync items
sheriff_last_sync      // Last sync timestamp

// Auto-saves:
- New service attempts
- New seizures
- Updated writ data
```

## 🔐 Security & Privacy

- ✅ Data stored locally in browser localStorage
- ✅ No server-side data transmission (demo mode)
- ✅ Mock data for testing purposes
- ✅ Signature and photos stored as Base64
- ⚠️ For production: Implement backend API with authentication

## 🌍 Browser Compatibility

- ✅ Chrome/Edge (mobile & desktop)
- ✅ Safari (iOS & macOS)
- ✅ Firefox (mobile & desktop)
- ✅ Samsung Internet
- ⚠️ Requires modern browser with:
  - localStorage API
  - Geolocation API
  - File/Camera API
  - Canvas API

## 📊 Data Model

### Writ Structure
```typescript
{
  id: string;
  writNumber: string;
  caseNumber: string;
  type: 'execution' | 'attachment' | 'possession' | 'arrest' | 'search';
  status: 'pending' | 'in_progress' | 'executed' | 'closed' | 'stayed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  serviceAttempts: ServiceAttempt[];
  seizureItems: SeizureItem[];
  fees: EnforcementFee[];
  // ... additional fields
}
```

### Service Attempt
```typescript
{
  id: string;
  outcome: 'served' | 'refused' | 'not_found' | 'address_incorrect' | 'other';
  location: string;
  gpsCoordinates?: string;
  signature?: string; // Base64
  notes: string;
  // ... additional fields
}
```

### Seizure Item
```typescript
{
  id: string;
  description: string;
  estimatedValue: number;
  photos?: string[]; // Base64 array
  gpsCoordinates?: string;
  // ... additional fields
}
```

## 🎨 Design System

### Colors
- **Primary:** Amber (law enforcement theme)
- **Accents:** Blue (in progress), Emerald (executed)
- **Backgrounds:** Stone with amber gradients
- **Text:** Stone-900 for content, Amber-100 for headers

### Typography
- **Headings:** DM Serif Display (serif)
- **Body:** IBM Plex Sans (sans-serif)
- **Sizes:** Mobile-optimized (16px base)

### Components
- Cards with subtle shadows
- Rounded corners (lg: 0.5rem)
- Bottom navigation bar (fixed)
- Gradient headers
- Badge variants for status/priority

## 🚧 Roadmap

### Phase 2: Backend Integration
- [ ] Connect to main Sheriff system API
- [ ] Real authentication with JWT
- [ ] Automatic sync when online
- [ ] Real-time notifications

### Phase 3: Enhanced Features
- [ ] Push notifications for urgent writs
- [ ] QR code scanning for writ lookup
- [ ] Voice notes recording
- [ ] PDF export of reports
- [ ] Biometric authentication
- [ ] Dark mode support

### Phase 4: PWA Features
- [ ] Install as app (Add to Home Screen)
- [ ] Service Worker for true offline support
- [ ] Background sync
- [ ] App icon and splash screen

## 🐛 Known Issues

- Linter warnings (style preferences, non-critical)
- Photo size limited to localStorage capacity (~5MB total)
- GPS requires HTTPS in production
- Array index keys in photo galleries (performance consideration)

## 👥 Credits

- Built with [Same](https://same.new)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)
- Fonts from [Google Fonts](https://fonts.google.com)

## 📄 License

This project is part of the Sheriff Court Case Management System.

---

**Note:** This is a demo/prototype application using mock data. For production deployment, integrate with a secure backend API and implement proper authentication and authorization.

## 🆘 Support

For technical assistance or feature requests, contact the development team or refer to the main Sheriff system documentation.
