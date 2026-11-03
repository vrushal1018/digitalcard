# Digital Business Card Builder

## Product Requirements & Development Specification

**Frontend:** Next.js (App Router)\
**Styling:** Tailwind CSS\
**Language:** TypeScript\
**Purpose:** Build a web application that collects a person's basic
details and generates a shareable, interactive digital business card
matching the supplied reference design.

------------------------------------------------------------------------

## 1. Product Overview

Create a simple web panel where an administrator or user enters a
person's details:

-   Name
-   Designation
-   Company name
-   Phone number
-   Office location
-   Profile photo

After submission, the application generates a polished digital business
card inspired by the uploaded reference image. The card should preserve
the reference's dark, premium appearance, rounded outer container,
profile image on the left, identity details on the right, and action
buttons along the bottom.

The generated card must be interactive. When someone taps an action, the
relevant destination should open. For example:

-   Phone action opens the device dialer.
-   Location action opens the office location in Google Maps.
-   Share action shares the card URL using the native share sheet where
    supported, with a copy-link fallback.
-   The profile photo and text are presentation elements; only actions
    with valid data should be interactive.

The result should be accessible through a unique URL so it can be sent
to anyone.

------------------------------------------------------------------------

## 2. Main User Journey

1.  User opens the card creation panel.
2.  User fills in the six required fields.
3.  User uploads a profile photo.
4.  A live preview updates as the user enters information.
5.  User selects **Generate Card**.
6.  The application validates the details and creates a digital card
    with a unique public URL.
7.  User copies or shares the URL.
8.  A recipient opens the URL and sees the digital card.
9.  Recipient taps an action such as Call or Location to perform that
    action.

------------------------------------------------------------------------

## 3. Input Panel

Build a clean, responsive form page.

### Fields

  -----------------------------------------------------------------------
  Field                   Input type              Validation / behavior
  ----------------------- ----------------------- -----------------------
  Name                    Text                    Required

  Designation             Text                    Required

  Company name            Text                    Required

  Phone number            Tel                     Required; normalize
                                                  before creating a
                                                  `tel:` link

  Office location         Searchable text or      Required; use this
                          address                 value to create a
                                                  Google Maps destination
                                                  link

  Photo                   File upload             Required; accept JPG,
                                                  PNG, and WebP; show
                                                  preview
  -----------------------------------------------------------------------

### Form behavior

-   Show clear labels and helpful placeholders.
-   Validate required fields before generation.
-   Validate the phone number sufficiently to avoid creating a broken
    call link.
-   Show an image preview after a photo is selected.
-   Allow the user to replace the selected photo.
-   Display inline validation messages.
-   Disable the Generate Card button while the form is submitting.
-   Show a useful success or error state.
-   Do not lose entered data if card generation fails.

### Suggested placeholders

-   Name: `Alex Jordan`
-   Designation: `Creative Director`
-   Company name: `Innovative Spaces`
-   Phone number: `+91 98765 43210`
-   Office location: `BKC, Mumbai, Maharashtra`

------------------------------------------------------------------------

## 4. Digital Card Design

Use the uploaded reference image as the visual direction. Recreate the
design responsively rather than embedding the reference image as the
card.

### Visual structure

**Outer card** - Very dark charcoal / near-black background. - Large
rounded corners. - Thin, subtle grey border. - Premium, minimal
appearance. - Comfortable internal spacing. - Card should fit smaller
mobile screens without horizontal scrolling.

**Profile and identity section** - Profile photo on the left. - Photo
displayed as a square or slightly portrait crop with rounded corners. -
Name displayed prominently in white. - Optional verified-style accent
icon may be included only as a decorative design element; do not imply
real-world verification. - Designation and company displayed below the
name in muted grey. - Phone and location must not be crammed into this
text area if they are already represented by action buttons.

**Action row** - Place large, evenly spaced icon buttons along the
bottom. - Match the reference's dark rounded-square buttons and subtle
outlines. - Use a bright accent treatment for the primary action or
hover/focus state. - Use Lucide icons (for example, `Video`, `Phone`,
`MessageCircle`, `MapPin`, and `Share2`). - Use meaningful accessible
labels and tooltips. - On narrow screens, allow the buttons to shrink or
wrap while preserving comfortable tap targets.

### Suggested action buttons

1.  **Call** --- opens `tel:<phone-number>`.
2.  **WhatsApp** --- opens a WhatsApp chat using the normalized phone
    number. Only show this if the phone number is valid.
3.  **Email or Message** --- optional future action; do not show a
    non-functional button.
4.  **Location** --- opens Google Maps for the supplied office location.
5.  **Share** --- shares the public card URL or copies it to the
    clipboard.

The reference image includes video, call, chat, payment, and scan-like
icons. Those are visual inspiration only. Do not implement payment,
video calling, or scanning actions unless the product requirements are
expanded to include real destinations and behavior. Every visible action
must work.

### Responsive layout

-   Desktop: wide card with photo and details side by side, action row
    underneath.
-   Mobile: retain the same visual hierarchy, scale the photo and
    typography down, and keep all action buttons usable.
-   Use a centered max-width container on the public card page.
-   Test at 320px, 375px, 768px, 1024px, and desktop widths.

------------------------------------------------------------------------

## 5. Interactive Actions and URL Behavior

### Phone

Create a `tel:` URL from the normalized phone number.

Example:

``` ts
const phoneHref = `tel:${normalizedPhone}`;
```

On mobile, tapping Call should open the device's dialer. Desktop
behavior depends on installed calling applications.

### WhatsApp

Create a WhatsApp click-to-chat URL using the phone number in
international format, digits only:

``` ts
const whatsappHref = `https://wa.me/${internationalDigitsOnly}`;
```

Do not include `+`, spaces, brackets, or hyphens in the `wa.me` number.

### Google Maps

Use the office location as a query, properly URL-encoded:

``` ts
const mapsHref =
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(officeLocation)}`;
```

Opening the link should launch Google Maps or the browser's Maps
experience. If the user later provides latitude and longitude, prefer a
coordinate-based Maps destination.

### Share

Use the Web Share API when available:

``` ts
if (navigator.share) {
  await navigator.share({
    title: `${name} — Digital Business Card`,
    text: `${name}, ${designation} at ${companyName}`,
    url: window.location.href,
  });
} else {
  await navigator.clipboard.writeText(window.location.href);
}
```

Handle cancellation and clipboard errors gracefully. Provide a visible
**Copy link** fallback.

------------------------------------------------------------------------

## 6. Routes and Pages

Use the Next.js App Router.

Suggested routes:

``` text
/
  Card creation panel

/card/[slug]
  Public digital business card

/api/cards
  Create a card (if using a database-backed API)

/api/upload
  Upload profile photo (if using a separate upload endpoint)
```

### Route behavior

-   `/` displays the creation form and live preview.
-   `/card/[slug]` loads and displays the card associated with the slug.
-   Unknown slugs should show a proper not-found page.
-   Public card pages should have appropriate page metadata, including
    the person's name and company.
-   Use a stable, unguessable or sufficiently unique slug. Do not expose
    sequential database IDs as public card identifiers.

------------------------------------------------------------------------

## 7. Suggested Tech Stack

-   **Next.js App Router** --- application framework and routing.
-   **TypeScript** --- type safety.
-   **Tailwind CSS** --- styling and responsive design.
-   **Lucide React** --- action icons.
-   **React Hook Form + Zod** --- optional form handling and validation.
-   **Database** --- PostgreSQL, MongoDB, or Supabase for persistent
    card records.
-   **Image storage** --- Supabase Storage, Cloudinary, or another
    persistent object-storage service.
-   **Deployment** --- Vercel.

Do not store uploaded photos only in local application memory or a
temporary browser object URL if cards must remain accessible to other
people. A generated public card needs a persistent image URL.

------------------------------------------------------------------------

## 8. Data Model

A card record can use this shape:

``` ts
export type DigitalCard = {
  id: string;
  slug: string;
  name: string;
  designation: string;
  companyName: string;
  phoneNumber: string;
  officeLocation: string;
  photoUrl: string;
  createdAt: string;
  updatedAt: string;
};
```

Possible database fields:

  Field             Type        Notes
  ----------------- ----------- -------------------------------
  id                UUID        Internal primary key
  slug              String      Unique public URL identifier
  name              String      Person's name
  designation       String      Job title
  company_name      String      Organization
  phone_number      String      Store normalized phone number
  office_location   String      Human-readable office address
  photo_url         String      Persistent image URL
  created_at        Timestamp   Creation time
  updated_at        Timestamp   Last update

Store only the information required to render and operate the card.
Protect creation and editing endpoints if the panel is intended for
internal use.

------------------------------------------------------------------------

## 9. Suggested Project Structure

``` text
src/
  app/
    page.tsx
    layout.tsx
    globals.css
    card/
      [slug]/
        page.tsx
    api/
      cards/
        route.ts
      upload/
        route.ts
  components/
    card-builder/
      CardForm.tsx
      PhotoUpload.tsx
      CardPreview.tsx
    digital-card/
      DigitalCard.tsx
      CardActionButton.tsx
      ShareButton.tsx
  lib/
    validation.ts
    phone.ts
    links.ts
    cards.ts
  types/
    card.ts
```

Adjust the structure to the selected database and storage provider. Keep
the card rendering component reusable so the preview and public page
share the same design.

------------------------------------------------------------------------

## 10. Functional Requirements

### Must have for the first version

-   [ ] Form with name, designation, company name, phone, office
    location, and photo.
-   [ ] Required-field validation.
-   [ ] Photo upload and preview.
-   [ ] Live digital-card preview.
-   [ ] Card design closely follows the supplied reference.
-   [ ] Generate and save a card.
-   [ ] Unique public card URL.
-   [ ] Public page loads the correct card data.
-   [ ] Call action opens the dialer.
-   [ ] Location action opens Google Maps.
-   [ ] Share action works, with copy-link fallback.
-   [ ] Responsive layout for mobile, tablet, and desktop.
-   [ ] Loading, success, error, and not-found states.
-   [ ] Persistent photo storage.

### Good follow-up features

-   Edit an existing card.
-   Download the card as a PNG.
-   Generate a QR code for the public card URL.
-   Add email, website, LinkedIn, and Instagram actions.
-   Add optional company logo and brand accent color.
-   Add an admin dashboard to list, search, and deactivate cards.
-   Add analytics such as card views and action clicks, with appropriate
    privacy disclosure.

------------------------------------------------------------------------

## 11. Design and Implementation Guidelines

-   Treat the uploaded reference as the primary visual reference.
-   Keep the card clean, premium, and uncluttered.
-   Use CSS/Tailwind for the card itself; do not use the uploaded
    screenshot as a background.
-   Use semantic buttons and links.
-   Add keyboard focus styles and accessible names to icon-only
    controls.
-   Ensure sufficient text contrast.
-   Use `next/image` for optimized profile-photo rendering where
    appropriate.
-   Avoid unnecessary animation; prioritize fast loading and smooth
    interactions.
-   Use server-side data loading for the public card route where
    practical.
-   Never render an action button unless its destination or behavior is
    implemented.
-   Do not expose private admin or upload credentials in client-side
    code.

------------------------------------------------------------------------

## 12. Acceptance Criteria

The first version is complete when:

1.  An administrator can enter all six fields and upload a photo.
2.  The preview updates to reflect the entered information.
3.  Submitting the form creates a persistent card record and a public
    URL.
4.  Opening that URL in a separate browser or device displays the same
    card.
5.  Tapping the phone action opens the dialer with the correct number.
6.  Tapping the location action opens Google Maps with the correct
    office location.
7.  Tapping Share opens the native share sheet where supported, or
    copies the URL.
8.  The design remains usable on small mobile screens and desktop.
9.  Invalid or missing data produces understandable validation feedback.
10. Refreshing the public card URL does not lose the card data or image.

------------------------------------------------------------------------

## 13. Recommended Development Phases

### Phase 1 --- UI and preview

-   Set up Next.js, TypeScript, and Tailwind CSS.
-   Build the card creation form.
-   Recreate the reference card using a reusable component.
-   Add live preview and responsive styling.
-   Implement local validation.

### Phase 2 --- Card generation and persistence

-   Select and configure a database.
-   Configure persistent image storage.
-   Implement card creation and unique slug generation.
-   Save the record and return its public URL.

### Phase 3 --- Public card and actions

-   Build `/card/[slug]`.
-   Fetch and render saved card details.
-   Implement Call, WhatsApp, Maps, and Share actions.
-   Add metadata, loading, error, and not-found states.

### Phase 4 --- Testing and deployment

-   Test all form validations.
-   Test photo uploads and persistence.
-   Test links on Android, iOS, and desktop.
-   Test responsive layouts and keyboard accessibility.
-   Deploy to Vercel and configure production environment variables.

------------------------------------------------------------------------

## 14. Important Product Decision

The card must be a **shareable web page**, not just an image generated
in the browser. A static image cannot provide working phone, map,
WhatsApp, or share interactions. The image can be added later as an
optional downloadable version, while the public URL remains the primary
digital card.

**Expected outcome:** A user fills in the basic details once, generates
a premium digital business card, and shares one URL. Anyone opening that
URL can view the card and use its working action buttons.
