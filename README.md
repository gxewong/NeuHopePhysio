# Neuhope Physiotherapy Centre — Website

A responsive single-page website built with **React + TypeScript + Vite + Tailwind CSS + Lucide React**.

## Run locally

Requires Node.js 18 or newer.

```bash
npm install
npm run dev        # start the dev server → http://localhost:5173
npm run build      # type-check and build for production into /dist
npm run preview    # preview the production build
```

## Where to edit things

| What | File |
| --- | --- |
| Clinic address, phone, WhatsApp, email, hours, map, social links, policy URLs | `src/data/site.ts` → `clinic` |
| Enquiry form endpoint (Formspree, Basin, your own API…) | `src/data/site.ts` → `ENQUIRY_ENDPOINT` |
| Services, FAQs, navigation links | `src/data/site.ts` |
| Testimonials (approved, with consent only) | `src/data/site.ts` → `testimonials` / `SHOW_TESTIMONIALS` |
| Brand colours, fonts, radii, shadows | `tailwind.config.js` |
| Buttons, cards, form field styles | `src/index.css` (`@layer components`) |
| Page title, meta description, Open Graph tags | `index.html` |
| Photos | `src/assets/images/` |

Any clinic detail left as `null` shows a clearly marked placeholder such as `[Insert clinic phone number]`.
Phone (`tel:`), email (`mailto:`), WhatsApp (`wa.me`) and Google Maps links are created automatically once real values are added.

## Enquiry form

The form validates all input (required fields, phone and email formats, consent) and focuses the first problem field.

**No backend is connected yet.** While `ENQUIRY_ENDPOINT` is `null`, the form says so clearly and never shows a fake success message.
To make it live, set `ENQUIRY_ENDPOINT` to a URL that accepts a JSON `POST` and returns a 2xx status. The form then shows sending, success and error states.

## Before publishing — checklist

- [ ] Replace every `[Insert …]` placeholder in `src/data/site.ts`
- [ ] Confirm the six service categories match what the clinic actually offers
- [ ] Connect the enquiry form, and link the clinic's real Privacy Policy (and Terms, if any)
- [ ] Add genuine, consented testimonials, or set `SHOW_TESTIMONIALS = false`
- [ ] Add the clinic's location to the meta description, plus `og:url` / `og:image` in `index.html`
- [ ] Optionally swap the stock photos for real photos of the clinic (with consent from anyone pictured)

## Image credits

Stock photos from [Unsplash](https://unsplash.com) (Unsplash License). They are illustrative only and do not show Neuhope's staff or patients.

- `hero.webp` — Ortopediatri Çocuk Ortopedi Akademisi (unsplash.com/photos/B3qVNvZ0AHY)
- `about.webp` — Yury Kirillov (unsplash.com/photos/pbUWW-CBoqY)
- `band.webp` — Sincerely Media (unsplash.com/photos/5uLbdKsUXMg)

If a photo fails to load, an on-brand illustrated fallback is shown instead of a broken image.

## Project structure

```
src/
  App.tsx                 page composition
  data/site.ts            all editable content and clinic details
  components/
    Navbar.tsx            sticky header, active-section highlight, mobile menu
    HeroSection.tsx
    TrustHighlights.tsx
    AboutSection.tsx
    ServicesSection.tsx   "Enquire" links pre-select the service in the form
    WhyChooseUs.tsx
    OurApproach.tsx       horizontal timeline on desktop, vertical on mobile
    CallToAction.tsx
    TestimonialsSection.tsx
    FAQSection.tsx        accessible accordion (arrow keys, Home/End)
    ContactSection.tsx    contact details + validated enquiry form
    Footer.tsx
    BackToTop.tsx, Logo.tsx, SmartImage.tsx, SectionHeading.tsx, ClinicValue.tsx
```

## Accessibility notes

Semantic landmarks and headings, skip link, visible yellow focus rings, labelled form fields with linked inline errors,
keyboard-operable menu and accordion, `prefers-reduced-motion` respected, and descriptive alt text on all photos.
