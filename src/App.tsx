import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import TrustHighlights from './components/TrustHighlights';
import AboutSection from './components/AboutSection';
import TeamSection from './components/TeamSection';
import ServicesSection from './components/ServicesSection';
import WhyChooseUs from './components/WhyChooseUs';
import OurApproach from './components/OurApproach';
import CallToAction from './components/CallToAction';
import TestimonialsSection from './components/TestimonialsSection';
import FAQSection from './components/FAQSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import BackToTop from './components/BackToTop';
import GalleryPage from './components/GalleryPage';
import { SHOW_TESTIMONIALS } from './data/site';
import { currentPage } from './route';
import { useEffect } from 'react';

export default function App() {
  // Arriving from another page with a #section link: scroll once the page has rendered
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'instant' }));
  }, []);

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <Navbar />
      <main id="main">
        {currentPage === 'gallery' ? (
          <GalleryPage />
        ) : (
          <>
            <HeroSection />
            <TrustHighlights />
            <AboutSection />
            <TeamSection />
            <ServicesSection />
            <WhyChooseUs />
            <OurApproach />
            <CallToAction />
            {SHOW_TESTIMONIALS && <TestimonialsSection />}
            <FAQSection />
            <ContactSection />
          </>
        )}
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
