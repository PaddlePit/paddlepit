import { Button } from "@/components/ui/button";

export default function Hero() {
	return (
		<div className="flex flex-col h-screen justify-center items-center gap-[32]">
			<div className="flex flex-row h-[fit] gap-[16]">
				<div className="flex aspect-square h-full text-white bg-primary justify-center items-center text-2xl rounded-2xl">Logo</div>
				<h1 className="text-center font-bold text-[64px] text-primary">PaddlePit</h1>
			</div>
			<p className="text-center text-muted-foreground">Book your court in seconds. Real-time availability, instant confirmation.</p>
			<Button className="w-[187] h-[66] text-xl text-white">Book Now</Button>
		</div>
	);
}
