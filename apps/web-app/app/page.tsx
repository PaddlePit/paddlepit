import Hero from "@/components/home/hero";
import Navbar from "@/components/Navbar";
import Gallery from "@/components/home/gallery";

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="flex flex-col h-screen w-screen items-center gap-[100]">
        <Hero />
        <Gallery />
      </div>
    </>
  );
}
