import Image from "next/image";
import Hero from "../components/home/hero.tsx";

export default function Home() {
  return (
    <div className="flex flex-col h-screen">   
      <Hero/>
    </div>
  );
}
