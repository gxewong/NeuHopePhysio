/**
 * Minimal two-page routing without extra libraries.
 * Each page is a normal page load, so links are plain <a href> tags.
 *   /         → home page (all sections)
 *   /contact  → contact details and appointment enquiry form
 */
export type Page = 'home' | 'contact';

const path = window.location.pathname.replace(/\/+$/, '');
export const currentPage: Page = path.endsWith('/contact') ? 'contact' : 'home';

/** Link to a section of the home page that works from any page. */
export const toSection = (id: string) => (currentPage === 'home' ? `#${id}` : `/#${id}`);

/** Link to a page (or to a spot on it when already there). */
export const toPage = (page: Page, anchor: string) =>
  currentPage === page ? `#${anchor}` : page === 'home' ? `/#${anchor}` : `/${page}#${anchor}`;

/** Contact page link; optionally pre-selects a service in the enquiry form. */
export const toContact = (serviceId?: string) =>
  serviceId ? `/contact?service=${encodeURIComponent(serviceId)}#enquiry` : toPage('contact', 'contact');
