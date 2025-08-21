import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/sections/Hero';
import CheatCardShowcase from '@/components/sections/CheatCardShowcase';
import FeatureGrid from '@/components/sections/FeatureGrid';
import UseCases from '@/components/sections/UseCases';

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <CheatCardShowcase />
        <FeatureGrid />
        <UseCases />
      </main>
      <Footer />
    </>
  );
}