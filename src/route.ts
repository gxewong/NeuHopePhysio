/**
 * Minimal two-page routing without extra libraries.
 * Each page is a normal page load, so links are plain <a href> tags.
 *   /         → home page (all sections)
 *   /gallery  → photo gallery page
 */
export type Page = 'home' | 'gallery';

const path = window.location.pathname.replace(/\/+$/, '');
export const currentPage: Page = path.endsWith('/gallery') ? 'gallery' : 'home';

/** Link to a section of the home page that works from any page. */
export const toSection = (id: string) => (currentPage === 'home' ? `#${id}` : `/#${id}`);

/** Link to a page (or to its top when already on it). */
export const toPage = (page: Page, anchor: string) =>
  currentPage === page ? `#${anchor}` : page === 'home' ? '/' : `/${page}`;
