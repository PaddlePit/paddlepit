import { Button } from "@/components/ui/button";

export default function Hero() {
	return (
		<div className="flex flex-col h-screen justify-center items-center gap-[32] bg-emerald-950">
			<div className="flex flex-row items-center gap-[8] bg-gold/20 px-5 py-2 border border-gold rounded-3xl">
				<span className="w-1.5 h-1.5 rounded-full bg-gold inline-block"></span>
				<span className="text-gold text-xs font-semibold">DAVAO CITY, PHILIPPINES</span>
			</div>
			<div className="flex flex-row h-[fit] gap-[16]">
				<h1 className="text-center font-semibold text-[64px] font-[Lora] text-cream">Play. Reserve. <br /><span className="italic">Repeat.</span></h1>
			</div>
			<p className="text-center text-muted-foreground text-xl">Book your court in seconds. Real-time <br /> availability, instant confirmation.</p>
			<div className="flex flex-row gap-[16]">
				<Button variant="gold" size="xl" className="text-lg">Book a Court</Button>
				<Button variant="cream" size="xl" className="text-lg">Check Availability</Button>
			</div>
		</div>
	);
}
