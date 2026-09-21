"use client"

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "cn";
import { Button } from "./ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Menu01Icon } from "@hugeicons/core-free-icons";
import { ContactUsModal } from "./ContactUsModal";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const links = [
	{ href: "/#hero", label: "Home" },
	{ href: "/#gallery", label: "Gallery" },
	{ href: "/#visit-us", label: "Visit Us" },
];

export default function Navbar() {
	const [hidden, setHidden] = useState(false);
	const prevY = useRef(0);

	useEffect(() => {
		const threshold = 16;
		const onScroll = () => {
			const y = window.scrollY;
			const delta = y - prevY.current;
			if (Math.abs(delta) > threshold) {
				if (delta > 0 && y > 120) {
					setHidden(true);
				} else if (delta < 0) {
					setHidden(false);
				}
			}
			prevY.current = y;
		};
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	return (
		<div
			className={cn(
				"fixed flex flex-row justify-center top-0 z-50 w-screen pt-[10] transition-transform duration-500",
				hidden && "-translate-y-full"
			)}
		>
			<div className="w-full h-fit flex flex-row bg-cream rounded-3xl max-w-[950] py-[16] justify-between items-center px-[20] mx-[20] shadow-lg shadow-emerald-deep/10">
				<div className="flex flex-row gap-[10] items-center">
					{/* Mock Logo */}
					<svg width="36" height="36" viewBox="0 0 36 36" fill="none">
						<rect width="36" height="36" rx="8" fill="#0F3D34"></rect>
						<circle cx="18" cy="18" r="10" stroke="#C8A96A" strokeWidth="1.5" fill="none"></circle>
						<line x1="18" y1="8" x2="18" y2="28" stroke="#C8A96A" strokeWidth="1.5"></line>
						<line x1="8" y1="18" x2="28" y2="18" stroke="#C8A96A" strokeWidth="1.5"></line>
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
						<ContactUsModal />
						<Button asChild className="text-cream rounded-lg">
							<Link href="/book">Book Now</Link>
						</Button>
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
								<ContactUsModal className="group/dropdown-menu-item relative flex w-full cursor-default items-center gap-2.5 rounded-2xl px-3 py-2 text-sm font-medium text-popover-foreground outline-hidden select-none focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground" />
							</DropdownMenuItem>
							<DropdownMenuItem>
								<Button asChild className="w-full cream rounded-2xl">
									<Link href="/book">Book Now</Link>
								</Button>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</div>
	)
}
