import Link from "next/link";
import { Button } from "./ui/button";

export default function Navbar() {
	return (
		<div className="flex flex-row w-screen h-fit py-[16] border border-b-secondary justify-between items-center px-[64]">
			<div className="flex flex-row gap-[10] items-center">
				{/* Mock Logo */}
				<svg width="36" height="36" viewBox="0 0 36 36" fill="none">
					<rect width="36" height="36" rx="8" fill="#0F3D34"></rect>
					<circle cx="18" cy="18" r="10" stroke="#C8A96A" stroke-width="1.5" fill="none"></circle>
					<line x1="18" y1="8" x2="18" y2="28" stroke="#C8A96A" stroke-width="1.5"></line>
					<line x1="8" y1="18" x2="28" y2="18" stroke="#C8A96A" stroke-width="1.5"></line>
					<circle cx="18" cy="18" r="3" fill="#C8A96A"></circle>
				</svg>
				<h1 className="text-xl font-semibold text-primary font-[Lora]">PaddlePit</h1>
			</div>
			<div className="flex flex-row gap-[20] justify-center items-center">
				<Link href="" className="text-sm text-primary hover:text-gold font-semibold duration-200">Home</Link>
				<Link href="" className="text-sm text-emerald/60 hover:text-emerald duration-200">Gallery</Link>
				<Link href="" className="text-sm text-emerald/60 hover:text-emerald duration-200">Visit Us</Link>
				<Link href="" className="text-sm text-emerald/60 hover:text-emerald duration-200">Contact Us</Link>
				<Button className="text-white rounded-lg">Book Now</Button>
			</div>
		</div>
	)
}

