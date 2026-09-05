import Link from "next/link";
import { Button } from "./ui/button";

export default function Navbar() {
	return (
		<div className="flex flex-row w-screen h-[64] border border-b-secondary justify-between items-center px-[64]">
			<div className="flex flex-row gap-[5]">
				<h1 className="text-xl font-bold text-primary">PaddlePit</h1>
			</div>
			<div className="flex flex-row gap-[32] justify-center items-center">
				<Link href="" className="hover:text-primary">Home</Link>
				<Link href="" className="hover:text-primary">Contact Us</Link>
				<Button className="text-white rounded-sm">Book Now</Button>
			</div>
		</div>
	)
}

