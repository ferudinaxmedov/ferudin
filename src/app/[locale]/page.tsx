import Nav from '@/components/public/Nav';
import Hero from '@/components/public/Hero';
import Services from '@/components/public/Services';
import Work from '@/components/public/Work';
import About from '@/components/public/About';
import Contact from '@/components/public/Contact';
import Footer from '@/components/public/Footer';
import RevealObserver from '@/components/public/RevealObserver';

export default function Home() {
  return (
    <main className="noise-bg">
      <RevealObserver />
      <Nav />
      <Hero />
      <Services />
      <Work />
      <About />
      <Contact />
      <Footer />
    </main>
  );
}
