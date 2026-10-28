import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import TrustHighlights from './components/TrustHighlights';
import AboutSection from './components/AboutSection';
import ServicesSection from './components/ServicesSection';
import WhyChooseUs from './components/WhyChooseUs';
import OurApproach from './components/OurApproach';
import CallToAction from './components/CallToAction';
import TestimonialsSection from './components/TestimonialsSection';
import FAQSection from './components/FAQSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import BackToTop from './components/BackToTop';
import { SHOW_TESTIMONIALS } from './data/site';

export default function App() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <Navbar />
      <main id="main">
        <HeroSection />
        <TrustHighlights />
        <AboutSection />
        <ServicesSection />
        <WhyChooseUs />
        <OurApproach />
        <CallToAction />
        {SHOW_TESTIMONIALS && <TestimonialsSection />}
        <FAQSection />
        <ContactSection />
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
