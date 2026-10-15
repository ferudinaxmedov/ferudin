import Nav from '@/components/public/Nav';
import Hero from '@/components/public/Hero';
import Services from '@/components/public/Services';
import Work from '@/components/public/Work';
import About from '@/components/public/About';
import Contact from '@/components/public/Contact';
import Footer from '@/components/public/Footer';
import Effects from '@/components/public/Effects';

export default function Home() {
  return (
    <>
      <div className="aurora" aria-hidden>
        <i />
        <i />
        <i />
        <i />
      </div>
      <Effects />
      <main className="relative z-10">
        <Nav />
        <Hero />
        <Work />
        <Services />
        <About />
        <Contact />
        <Footer />
      </main>
    </>
  );
}
