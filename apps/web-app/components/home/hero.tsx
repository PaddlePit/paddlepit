import { Button } from "@/components/ui/button";
import Link from "next/link";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function Hero() {
	return (
		<section id="hero" className="relative flex flex-col min-h-screen w-full justify-center items-center gap-[32] overflow-hidden pt-[44] scroll-mt-24">
			<video
				autoPlay
				muted
				loop
				playsInline
				preload="auto"
				className="absolute inset-0 h-full w-full object-cover"
				src={`${basePath}/hero-bg.mp4`}
			/>
			<div className="absolute inset-0 bg-emerald-950/50"></div>
			<div className="relative z-10 flex flex-col items-center gap-[32] px-[20]">
				<div className="flex flex-row items-center gap-[8] bg-gold/20 px-5 py-2 border border-gold rounded-3xl">
					<span className="w-1.5 h-1.5 rounded-full bg-gold inline-block"></span>
					<span className="text-gold min-[680]:text-xs text-[10px] font-semibold">DAVAO CITY, PHILIPPINES</span>
				</div>
				<div className="flex flex-row h-[fit] gap-[16]">
					<h1 className="text-center font-semibold min-[680]:text-[64px] text-[52px] font-[Lora] text-cream">Play. Reserve. <br /><span className="italic">Repeat.</span></h1>
				</div>
				<p className="text-center text-muted-foreground min-[680]:text-xl text-md">Book your court in seconds. <br /> Real-time availability, instant confirmation.</p>
				<div className="flex min-[680]:flex-row w-full flex-col gap-[16]">
					<Button asChild variant="gold" size="xl" className="min-[680]:text-lg text-md min-[680]:w-fit w-full">
						<Link href="/book">Book a Court</Link>
					</Button>
					<Button asChild variant="cream" size="xl" className="min-[680]:text-lg text-md min-[680]:w-fit w-full">
						<Link href="/book">Check Availability</Link>
					</Button>
				</div>
			</div>
		</section>
	);
}
