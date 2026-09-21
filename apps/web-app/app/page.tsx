import Hero from "@/components/home/hero";
import Gallery from "@/components/home/gallery";
import VisitUs from "@/components/home/visit-us";
import ReadyToPlay from "@/components/home/ready-to-play";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <div className="flex flex-col min-h-screen w-screen items-center">
        <Hero />
        <Gallery />
        <VisitUs />
        <ReadyToPlay />
      </div>
      <Footer />
    </>
  );
}
