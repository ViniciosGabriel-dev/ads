import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CampaignTypes from "@/components/CampaignTypes";
import Goals from "@/components/Goals";
import Benefits from "@/components/Benefits";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import PromoOffer from "@/components/PromoOffer";
import Support from "@/components/Support";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <CampaignTypes />
        <Goals />
        <Benefits />
        <Testimonials />
        <FAQ />
        <PromoOffer />
        <Support />
      </main>
      <Footer />
    </>
  );
}
