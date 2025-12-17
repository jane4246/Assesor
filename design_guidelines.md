# Design Guidelines: Document Assessment Platform

## Design Approach
**System-Based Design** using Material Design principles for clarity and trust in financial transactions. This utility-focused application prioritizes efficient workflows, clear status feedback, and professional presentation suitable for payment processing.

---

## Typography System
- **Primary Font**: Inter (Google Fonts)
- **Heading Scale**: text-4xl (hero), text-2xl (section), text-xl (cards), text-lg (labels)
- **Body Text**: text-base for primary content, text-sm for secondary info
- **Weight Distribution**: font-semibold for headings, font-medium for labels, font-normal for body

---

## Layout & Spacing
**Spacing Units**: Tailwind 4, 6, 8, 12, 16, 24 (p-4, gap-6, mb-8, py-12, etc.)
- **Container Width**: max-w-7xl for main layout, max-w-2xl for forms/upload areas
- **Section Padding**: py-16 desktop, py-12 mobile
- **Card Padding**: p-6 to p-8
- **Responsive Grid**: Single column mobile, 2-column tablet, 3-column desktop where appropriate

---

## Core Components

### Landing Page Structure
1. **Hero Section** (70vh): 
   - Bold headline: "Professional Document Assessment Services"
   - Subheading explaining service (assessment reports delivered via email)
   - Primary CTA: "Upload Document" button
   - Trust indicators: "Secure Payment • Fast Processing • KES 60 per Document"

2. **How It Works** (3-column grid on desktop):
   - Upload Your Document
   - Pay via M-Pesa
   - Receive Assessment Report
   (Each with icon, title, brief description)

3. **Pricing Section**:
   - Large pricing card: "KES 60 per document"
   - Accepted formats badge: .doc, .docx, .rtf
   - Payment method: M-Pesa logo/badge

4. **Footer**: Contact info, payment number display, simple navigation links

### Upload Interface
- **Drag-and-drop zone**: Large dashed border area (min-h-64)
- **File requirements card**: Supported formats, size limits, pricing reminder
- **Upload status**: Progress indicator during upload
- **File preview list**: Shows uploaded files with remove option
- **Action buttons**: "Proceed to Payment" (primary), "Cancel" (secondary)

### Payment Page
- **Order summary card**: Document name, file size, amount due (KES 60)
- **M-Pesa instructions**: Step-by-step visual guide
- **Payment number display**: +254710558915 (large, copyable)
- **Verification section**: "Confirm Payment" button triggering status check
- **Status feedback**: Loading state → Success/Failure with clear messaging

### Email Collection (Post-Payment)
- **Success confirmation**: Checkmark icon, "Payment Successful" message
- **Email form**: Single input field with validation
- **Submit button**: "Receive Assessment Report"
- **Transaction reference**: Display M-Pesa transaction ID

### Admin Dashboard
- **Document table**: Columns for filename, upload date, payment status, email, actions
- **Filter tabs**: "All", "Paid", "Pending Payment"
- **Status badges**: Green (Paid), Yellow (Pending), with clear labeling
- **Action buttons**: Download file, View details
- **Statistics cards**: Total uploads, Paid documents, Revenue today

---

## Status & Feedback Elements
- **Success states**: Green accent (emerald-500), checkmark icons
- **Pending states**: Amber accent (amber-500), clock icons
- **Error states**: Red accent (red-500), alert icons
- **Loading states**: Spinner with "Processing..." text
- **Notifications**: Toast-style alerts (top-right positioning)

---

## Form Design Patterns
- **Input fields**: Rounded borders (rounded-lg), clear labels above fields
- **File upload**: Prominent drop zone with upload icon and helper text
- **Buttons**: 
  - Primary: Solid fill, rounded-lg, px-8 py-3, font-medium
  - Secondary: Border outline, same sizing
- **Validation**: Inline error messages below fields in red text

---

## Navigation
- **Header**: Logo left, "Upload Document" CTA right, minimal navigation
- **Mobile**: Hamburger menu if needed
- **Breadcrumbs**: For multi-step upload/payment process

---

## Images
**Hero Section**: Professional workspace image showing documents/assessment (subtle, not overpowering). Alternatively, abstract geometric pattern suggesting organization and professionalism.

**How It Works Icons**: Use Material Icons or Heroicons for upload, payment, email delivery steps.

**M-Pesa Branding**: Include official M-Pesa logo in payment section for trust and recognition.

---

## Accessibility & Trust
- High contrast ratios for all text (WCAG AA minimum)
- Clear focus states on all interactive elements (ring-2 ring-offset-2)
- Payment number always visible and copyable
- Transaction confirmations with reference numbers
- Clear error messaging guiding users to resolution