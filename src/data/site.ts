/**
 * ─────────────────────────────────────────────────────────────
 *  Neuhope — editable site content
 * ─────────────────────────────────────────────────────────────
 *  All clinic-specific details live in this file so they can be
 *  replaced without touching the components.
 *
 *  IMPORTANT: Leave a value as `null` until it has been verified.
 *  Components show a clearly marked placeholder for `null` values
 *  and only create tel:, mailto:, WhatsApp and map links once real
 *  details are supplied.
 */

import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  Bone,
  Dumbbell,
  Footprints,
  HeartPulse,
  Stethoscope,
} from 'lucide-react';

export interface ClinicDetails {
  name: string;
  address: string | null;
  /** Display format, e.g. "+60 6-123 4567" */
  phone: string | null;
  /** International format digits only, e.g. "60123456789" (no +, spaces or dashes) */
  whatsapp: string | null;
  email: string | null;
  /** One line per entry, e.g. ["Mon–Fri: 9:00am – 6:00pm", "Sat: 9:00am – 1:00pm"] */
  hours: string[] | null;
  /** Optional Google Maps share link. Generated from the address if left null. */
  mapUrl: string | null;
  /** Only add real, official profiles. Empty array hides the section. */
  social: { platform: 'facebook' | 'instagram'; label: string; href: string }[];
  /** Set to the clinic's published policy URLs, or leave null to show "available on request". */
  privacyPolicyUrl: string | null;
  termsUrl: string | null;
}

export const clinic: ClinicDetails = {
  name: 'NeuHope Physiotherapy 曦望物理治疗',
  address: "101, Jln Adda 3/1, Adda Heights, 81100 Johor Bahru, Johor Darul Ta'zim",
  phone: "+60 128080432",
  whatsapp: null, // [Insert official WhatsApp number]
  email: null, // [Insert clinic email address]
  hours: ["Monday – Friday: 9am – 6pm", "Saturday: 9am – 3pm", "Sunday: Closed"],
  mapUrl: null,
  social: [
    { platform: "facebook", label: "NeuHope Physiotherapy 曦望物理治疗", href: "https://www.facebook.com/neuhopephysiotherapy" },
    { platform: "instagram", label: "@neuhopephysio", href: "https://www.instagram.com/neuhopephysio/" },
  ],
  privacyPolicyUrl: null,
  termsUrl: null,
};

/**
 * Appointment request form endpoint.
 * Paste the Google Apps Script "Web app" URL here (see README →
 * "Connect appointment requests to Google Calendar"). It looks like:
 *   https://script.google.com/macros/s/XXXXXXXX/exec
 * While this is null the form validates input but clearly tells the
 * visitor it is NOT connected and nothing has been sent.
 */
export const ENQUIRY_ENDPOINT: string | null = null;

/* ── Appointment booking rules ───────────────────────────── */
/*  Used by the request form to offer start times inside opening
    hours. Keep these in step with the opening hours above.
    Times are 24-hour "HH:MM". Day 0 = Sunday … 6 = Saturday.
    null = closed that day.                                   */

export const booking = {
  appointmentTypes: [
    { id: 'initial', label: 'Initial assessment', minutes: 90 },
    { id: 'follow-up', label: 'Follow-up session', minutes: 60 },
  ],
  /** Gap between offered start times */
  slotStepMinutes: 30,
  /** [opening time, closing time] — appointments must finish by closing time */
  hours: {
    0: null,
    1: ['09:00', '18:00'],
    2: ['09:00', '18:00'],
    3: ['09:00', '18:00'],
    4: ['09:00', '18:00'],
    5: ['09:00', '18:00'],
    6: ['09:00', '15:00'],
  } as Record<number, [string, string] | null>,
};

/* ── Helpers ──────────────────────────────────────────────── */

export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`;
export const whatsappHref = (digits: string) =>
  `https://wa.me/${digits.replace(/\D/g, '')}?text=${encodeURIComponent(
    'Hello Neuhope, I would like to enquire about an appointment.',
  )}`;
export const mapHref = (c: ClinicDetails) =>
  c.mapUrl ??
  (c.address
    ? `https://maps.app.goo.gl/25qPr6QjWJULU3AAA`
    : null);

/* ── Our Team ─────────────────────────────────────────────── */
/*  Add one entry per staff member. Only use real details the
    staff member has approved.
    Photos: put the picture in the  public/team  folder and write
    its name as  photo: "/team/file-name.jpg". Square photos look
    best. Leave photo as null to show the person's initials.
    The "Our Team" section and menu link appear automatically
    once at least one person is added.                         */

/*  null = not filled in yet (shows an [Insert …] placeholder).
    Delete a line completely to hide that detail for that person. */
export interface TeamMember {
  name: string;
  role: string | null;
  /** e.g. "BSc (Hons) Physiotherapy" */
  qualifications?: string | null;
  /** One or two short sentences */
  bio?: string | null;
  /** e.g. ["English", "Bahasa Melayu", "中文"] */
  languages?: string[] | null;
  photo: string | null;
}

export const team: TeamMember[] = [
  {
    name: "Edwin Tay",
    role: null, // [Insert role, e.g. "Physiotherapist"]
    qualifications: null, // [Insert qualifications]
    bio: null, // [Insert a short bio]
    languages: null, // [Insert languages, e.g. ["English", "中文"]]
    photo: null, // [Insert photo, e.g. "/team/edwin-tay.jpg"]
  },
  {
    name: "Maslyn Poh",
    role: null, // [Insert role, e.g. "Physiotherapist"]
    qualifications: null, // [Insert qualifications]
    bio: null, // [Insert a short bio]
    languages: null, // [Insert languages, e.g. ["English", "中文"]]
    photo: null, // [Insert photo, e.g. "/team/maslyn-poh.jpg"]
  },
];

/* ── Navigation ───────────────────────────────────────────── */

export const navLinks: { id: string; label: string; page?: 'contact' }[] = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About Us' },
  ...(team.length > 0 ? [{ id: 'team', label: 'Our Team' }] : []),
  { id: 'services', label: 'Services' },
  { id: 'approach', label: 'Our Approach' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'faqs', label: 'FAQs' },
  { id: 'contact', label: 'Contact', page: 'contact' },
];

/* ── Services ─────────────────────────────────────────────── */
/*  Sample service categories — verify against the clinic's
    actual services before publishing.                         */

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const services: Service[] = [
  {
    id: 'musculoskeletal',
    title: 'Musculoskeletal Physiotherapy',
    description:
      'Support for common muscle, joint and movement-related problems, with treatment plans based on your individual needs.',
    icon: Bone,
  },
  {
    id: 'sports-injury',
    title: 'Sports Injury Rehabilitation',
    description:
      'Guided rehabilitation to support recovery from sports-related injuries and help you work towards returning to your chosen activities.',
    icon: Activity,
  },
  {
    id: 'post-surgical',
    title: 'Post-Surgical Rehabilitation',
    description:
      'Rehabilitation to support the recovery of movement, strength and everyday function after surgery, in line with appropriate medical guidance.',
    icon: Stethoscope,
  },
  {
    id: 'pain-management',
    title: 'Pain Management',
    description:
      'Individualised physiotherapy approaches to help you manage certain types of pain and improve movement and daily function.',
    icon: HeartPulse,
  },
  {
    id: 'mobility',
    title: 'Mobility & Functional Rehabilitation',
    description:
      'Exercises and movement training designed to support balance, mobility, strength and the everyday activities that matter to you.',
    icon: Footprints,
  },
  {
    id: 'exercise-therapy',
    title: 'Exercise Therapy',
    description:
      'Structured therapeutic exercises designed around your movement goals, abilities and rehabilitation needs.',
    icon: Dumbbell,
  },
];

/* ── FAQs ─────────────────────────────────────────────────── */

export const faqs = [
  {
    q: 'What does a physiotherapist do?',
    a: 'Physiotherapists help assess and manage movement difficulties, certain types of pain, injuries and rehabilitation needs through appropriate treatment, movement guidance and therapeutic exercises.',
  },
  {
    q: 'Do I need a referral before making an appointment?',
    a: "Referral requirements may depend on your circumstances and the clinic's policies. Contact Neuhope to confirm whether you need a referral before your visit.",
  },
  {
    q: 'What should I bring to my first appointment?',
    a: 'You may wish to bring relevant medical reports, imaging results, a list of current medications and any referral documents you have. Contact the clinic if you are unsure what is needed.',
  },
  {
    q: 'How long does a physiotherapy session take?',
    a: 'Session duration can vary depending on the service and your individual needs. Please contact Neuhope to confirm the expected duration for your appointment.',
  },
  {
    q: 'How many sessions will I need?',
    a: 'The number of sessions varies according to your condition, goals, response to treatment and rehabilitation needs. Your physiotherapist can discuss an appropriate plan after assessing you.',
  },
  {
    q: 'How do I book an appointment?',
    a: 'Use the appointment enquiry form on this page or contact the clinic directly to enquire about available appointments.',
  },
];

/* ── Testimonials ─────────────────────────────────────────── */
/*  Only add genuine, approved testimonials with the patient's
    written consent. While this array is empty, the section shows
    clearly labelled placeholders. Set SHOW_TESTIMONIALS to false
    to hide the section entirely.                               */

export const SHOW_TESTIMONIALS = true;
export const testimonials: { quote: string; attribution: string }[] = [];

/* ── Gallery (home page, before the FAQs) ──────────────────────────────── */
/*  Photos of the clinic. Put each photo in the  public/gallery
    folder, then add a line below, for example:
      { src: "/gallery/reception.jpg", alt: "Reception area", caption: "Our reception" },
    "alt" describes the photo for people using screen readers.
    "caption" is optional and appears under the photo.
    While this list is empty, the page shows placeholder tiles.
    Only use photos of the real clinic, with permission from
    anyone who can be recognised.                               */

export interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
}

export const gallery: GalleryImage[] = [];
