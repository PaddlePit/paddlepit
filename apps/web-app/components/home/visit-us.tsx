const hours = [
	{ day: "Monday – Friday", time: "6:00 AM – 10:00 PM" },
	{ day: "Saturday", time: "6:00 AM – 11:00 PM" },
	{ day: "Sunday", time: "7:00 AM – 9:00 PM" },
];

const rates = [
	{ label: "Weekday Rate", price: "₱350 / hr per court" },
	{ label: "Weekend Rate", price: "₱400 / hr per court" },
];

export default function VisitUs() {
	return (
		<section id="visit-us" className="py-20 bg-cream w-full scroll-mt-24">
			<div className="max-w-6xl mx-auto px-5">
				<div className="mb-10">
					<h2 className="font-serif text-3xl md:text-4xl font-semibold text-emerald-deep mb-1">Visit Us</h2>
					<p className="text-emerald-deep/50 text-sm">Hours, location, and how to find our courts</p>
				</div>
				<div className="grid md:grid-cols-2 gap-8">
					<div>
						<h3 className="font-semibold text-emerald-deep mb-4 text-base">Business Hours</h3>
						<div className="bg-cream rounded-xl border border-emerald-deep/10 overflow-hidden">
							{hours.map((row, i) => (
								<div
									key={row.day}
									className={i < hours.length - 1 ? "flex justify-between px-5 py-4 border-b border-emerald-deep/8" : "flex justify-between px-5 py-4"}
								>
									<span className="text-sm text-emerald-deep">{row.day}</span>
									<span className="text-sm font-medium text-emerald-deep">{row.time}</span>
								</div>
							))}
						</div>
						<h3 className="font-semibold text-emerald-deep mb-4 mt-8 text-base">Court Rates</h3>
						<div className="bg-cream rounded-xl border border-emerald-deep/10 overflow-hidden">
							{rates.map((row, i) => (
								<div
									key={row.label}
									className={i < rates.length - 1 ? "flex justify-between px-5 py-4 border-b border-emerald-deep/8" : "flex justify-between px-5 py-4"}
								>
									<span className="text-sm text-emerald-deep">{row.label}</span>
									<span className="text-sm font-semibold text-emerald-deep">{row.price}</span>
								</div>
							))}
						</div>
					</div>
					<div>
						<h3 className="font-semibold text-emerald-deep mb-4 text-base">Find Us</h3>
						<div className="bg-emerald-light rounded-xl border border-emerald-deep/10 overflow-hidden h-52 flex items-center justify-center mb-4">
							<div className="text-center">
								<div className="w-10 h-10 bg-emerald-deep/20 rounded-full flex items-center justify-center mx-auto mb-2">
									<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
										<path d="M9 1C6.24 1 4 3.24 4 6c0 4 5 11 5 11s5-7 5-11c0-2.76-2.24-5-5-5Z" fill="#0F3D34"></path>
										<circle cx="9" cy="6" r="2" fill="#E6F0E9"></circle>
									</svg>
								</div>
								<p className="text-emerald-deep/50 text-sm">Google Map</p>
								<p className="text-emerald-deep/40 text-xs">Embedded map will go here</p>
							</div>
						</div>
						<p className="text-sm text-emerald-deep mb-3">Paddle Pit, Davao City, Davao del Sur, Philippines</p>
						<a
							href="https://maps.google.com"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-mid border border-emerald-mid/30 px-4 py-2.5 rounded-lg hover:bg-emerald-light transition-colors"
						>
							Get Directions
							<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
								<path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"></path>
							</svg>
						</a>
					</div>
				</div>
			</div>
		</section>
	);
}
