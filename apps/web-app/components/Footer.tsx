export default function Footer() {
	return (
		<footer id="footer" className="bg-emerald-night py-12 w-full">
			<div className="max-w-6xl mx-auto px-5">
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">
					<div>
						<div className="flex items-center gap-2.5">
							<svg width="36" height="36" viewBox="0 0 36 36" fill="none">
								<rect width="36" height="36" rx="8" fill="#0F3D34"></rect>
								<circle cx="18" cy="18" r="10" stroke="#C8A96A" strokeWidth="1.5" fill="none"></circle>
								<line x1="18" y1="8" x2="18" y2="28" stroke="#C8A96A" strokeWidth="1.5"></line>
								<line x1="8" y1="18" x2="28" y2="18" stroke="#C8A96A" strokeWidth="1.5"></line>
								<circle cx="18" cy="18" r="3" fill="#C8A96A"></circle>
							</svg>
							<span className="font-serif font-semibold tracking-tight text-xl text-cream">PaddlePit</span>
						</div>
						<p className="text-cream/40 text-sm mt-3 max-w-[200]">Davao&apos;s premier pickleball venue.</p>
					</div>
					<div>
						<h4 className="text-cream/60 text-xs font-semibold tracking-widest uppercase mb-4">Contact</h4>
						<div className="space-y-2">
							<p className="text-cream/70 text-sm">(088) 123 4567</p>
							<p className="text-cream/70 text-sm">hello@paddlepit.ph</p>
							<p className="text-cream/70 text-sm">Davao City, Davao del Sur</p>
						</div>
					</div>
					<div>
						<h4 className="text-cream/60 text-xs font-semibold tracking-widest uppercase mb-4">Follow Us</h4>
						<div className="flex gap-3">
							<a href="#" className="w-9 h-9 bg-cream/10 rounded-lg flex items-center justify-center text-cream/70 hover:bg-cream/20 hover:text-cream transition-colors text-sm font-bold" aria-label="Facebook">f</a>
							<a href="#" className="w-9 h-9 bg-cream/10 rounded-lg flex items-center justify-center text-cream/70 hover:bg-cream/20 hover:text-cream transition-colors text-sm font-bold" aria-label="YouTube">▷</a>
						</div>
					</div>
				</div>
				<div className="border-t border-cream/10 pt-6">
					<p className="text-cream/30 text-xs">© 2026 PaddlePit. All rights reserved.</p>
				</div>
			</div>
		</footer>
	);
}
