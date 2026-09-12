"use client"

import { HugeiconsIcon } from "@hugeicons/react";
import {
	SmartphoneIcon,
	MailIcon,
	LocationIcon,
	ClockIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";

const contactInfo = [
	{
		icon: SmartphoneIcon,
		label: "Phone",
		value: "(088) 123 4567",
		href: "tel:+63881234567",
	},
	{
		icon: MailIcon,
		label: "Email",
		value: "hello@paddlepit.ph",
		href: "mailto:hello@paddlepit.ph",
	},
	{
		icon: LocationIcon,
		label: "Location",
		value: "Paddle Pit, Davao City, Davao del Sur",
		href: "https://maps.google.com",
	},
];

const hours = [
	{ day: "Mon – Fri", time: "6:00 AM – 10:00 PM" },
	{ day: "Saturday", time: "6:00 AM – 11:00 PM" },
	{ day: "Sunday", time: "7:00 AM – 9:00 PM" },
];

export function ContactUsModal() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<button
					type="button"
					className="text-sm text-emerald/60 hover:text-emerald duration-200 cursor-pointer"
				>
					Contact Us
				</button>
			</DialogTrigger>
			<DialogContent
				showCloseButton
				className="max-w-sm rounded-4xl bg-emerald-night border border-cream/10 p-0 shadow-2xl sm:max-w-sm"
			>
				<DialogHeader className="items-center pt-9 pb-5 px-6 text-center bg-gradient-to-b from-white/5 to-transparent rounded-t-4xl">
					<div className="relative mb-3">
						<div className="absolute inset-0 -m-3 rounded-full bg-gold/20 blur-xl" />
						<div className="relative w-16 h-16 rounded-full bg-emerald-deep border-2 border-gold flex items-center justify-center overflow-hidden">
							<svg width="34" height="34" viewBox="0 0 36 36" fill="none">
								<circle cx="18" cy="18" r="10" stroke="#C8A96A" strokeWidth="1.5" fill="none"></circle>
								<line x1="18" y1="8" x2="18" y2="28" stroke="#C8A96A" strokeWidth="1.5"></line>
								<line x1="8" y1="18" x2="28" y2="18" stroke="#C8A96A" strokeWidth="1.5"></line>
								<circle cx="18" cy="18" r="3" fill="#C8A96A"></circle>
							</svg>
						</div>
					</div>
					<DialogTitle className="font-serif text-xl font-semibold text-cream leading-none">
						PaddlePit
					</DialogTitle>
					<p className="text-cream/50 text-xs mt-1.5 tracking-wide uppercase">
						Pickleball Courts · Davao City
					</p>
				</DialogHeader>

				<div className="px-6 pb-6 space-y-4">
					<div className="bg-cream/5 border border-cream/10 rounded-2xl divide-y divide-cream/8">
						{contactInfo.map(({ icon, label, value, href }) => (
							<a
								key={label}
								href={href}
								target={href.startsWith("http") ? "_blank" : undefined}
								rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
								className="flex items-center gap-3 px-4 py-3 hover:bg-cream/5 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
							>
								<span className="w-9 h-9 rounded-xl bg-gold/15 text-gold flex items-center justify-center shrink-0">
									<HugeiconsIcon icon={icon} strokeWidth={2} className="size-4" />
								</span>
								<span className="min-w-0">
									<span className="block text-cream/40 text-[11px] uppercase tracking-wider">
										{label}
									</span>
									<span className="block text-sm text-cream truncate">{value}</span>
								</span>
							</a>
						))}
					</div>

					<div className="bg-cream/5 border border-cream/10 rounded-2xl px-4 py-3">
						<div className="flex items-center gap-2 text-cream/40 text-[11px] uppercase tracking-wider mb-2">
							<HugeiconsIcon icon={ClockIcon} strokeWidth={2} className="size-3.5" />
							<span>Business Hours</span>
						</div>
						<div className="space-y-1">
							{hours.map(({ day, time }) => (
								<div key={day} className="flex justify-between text-sm gap-3">
									<span className="text-cream/60">{day}</span>
									<span className="text-cream font-medium">{time}</span>
								</div>
							))}
						</div>
					</div>

					<div className="flex gap-3 pt-1">
						<Button asChild variant="gold" className="flex-1 rounded-xl">
							<a href="tel:+63881234567">Call Now</a>
						</Button>
						<Button asChild variant="cream" className="flex-1 rounded-xl">
							<a href="mailto:hello@paddlepit.ph">Email Us</a>
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
