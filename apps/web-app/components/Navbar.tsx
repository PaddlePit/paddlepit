import Link from "next/link";
import { Button } from "./ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Menu01Icon } from "@hugeicons/core-free-icons";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const links = [
	{ href: "", label: "Home" },
	{ href: "", label: "Gallery" },
	{ href: "", label: "Visit Us" },
	{ href: "", label: "Contact Us" },
];

export default function Navbar() {
	return (
		<div className="flex flex-row w-screen self-center max-w-[950] h-fit py-[16] justify-between items-center px-[20]">
			<div className="flex flex-row gap-[10] items-center">
				{/* Mock Logo */}
				<svg width="36" height="36" viewBox="0 0 36 36" fill="none">
					<rect width="36" height="36" rx="8" fill="#0F3D34"></rect>
					<circle cx="18" cy="18" r="10" stroke="#C8A96A" strokeWidth="1.5" fill="none"></circle>
					<line x1="18" y1="8" x2="18" y2="28" stroke="#C8A96A" stroke-width="1.5"></line>
					<line x1="8" y1="18" x2="28" y2="18" stroke="#C8A96A" stroke-width="1.5"></line>
					<circle cx="18" cy="18" r="3" fill="#C8A96A"></circle>
				</svg>
				<h1 className="text-xl font-semibold text-primary font-[Lora]">PaddlePit</h1>
			</div>
			<div className="flex flex-row gap-[20] justify-center items-center">
				<div className="hidden min-[680px]:flex flex-row gap-[20] justify-center items-center">
					{links.map((link) => (
						<Link
							key={link.label}
							href={link.href}
							className={
								link.label === "Home"
									? "text-sm text-primary hover:text-gold font-semibold duration-200"
									: "text-sm text-emerald/60 hover:text-emerald duration-200"
							}
						>
							{link.label}
						</Link>
					))}
					<Button className="text-cream rounded-lg">Book Now</Button>
				</div>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon" className="text-primary min-[680px]:hidden">
							<HugeiconsIcon icon={Menu01Icon} strokeWidth={2} />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-48">
						{links.map((link) => (
							<DropdownMenuItem key={link.label} asChild>
								<Link href={link.href}>{link.label}</Link>
							</DropdownMenuItem>
						))}
						<DropdownMenuItem asChild>
							<Button className="w-full cream rounded-2xl">Book Now</Button>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	)
}
