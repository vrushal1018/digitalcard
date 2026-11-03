# Digital Business Card Builder (InaCard)

A production-ready digital business card builder web application built according to [`digital-business-card-spec.md`](./digital-business-card-spec.md).

## Features

- **Responsive Card Creation Form**:
  - Full Name, Designation/Job Title, Company Name, Phone Number, Office Location, and Profile Photo Upload.
  - Comprehensive client and server-side validation with inline error messaging.
  - Photo upload with preview, file type validation (JPG, PNG, WebP), and replace/remove actions.
- **Synchronized Live Card Preview**:
  - Real-time updates as fields are typed.
  - Sticky side-by-side layout on desktop and fluid responsive stacking on mobile.
- **Interactive Digital Business Card**:
  - Dark, premium appearance inspired by the reference design with rounded corners, subtle borders, and glow effects.
  - Profile photo with fallback placeholder avatar.
  - Identity section with prominent name and decorative verified badge.
  - **Call action**: One-tap dialer launch via `tel:<normalized-number>`.
  - **WhatsApp action**: One-tap chat via `https://wa.me/<international-digits-only>`.
  - **Location action**: One-tap Google Maps directions via query-encoded office location.
  - **Share action**: Native Web Share API integration with automatic fallback to clipboard copy and visual confirmation.
- **Persistent Storage & Routing**:
  - Unique, unguessable public URLs (`/card/[slug]`).
  - Server-side data loading with dynamic OpenGraph and document metadata.
  - 404 / Not-Found page for nonexistent or invalid cards.
  - Persistent JSON and file-upload storage across reloads.
- **Automated Verification Suite**:
  - Unit and component tests covering phone normalization, link generators, form validation, persistence, and React component rendering.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Testing**: Vitest, React Testing Library, JSDOM

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Test Suite
```bash
npm test
```

### 4. Build for Production
```bash
npm run build
npm start
```

