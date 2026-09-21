import Link from "next/link";

export default function ReadyToPlay() {
	return (
		<section className="bg-emerald-deep py-16 w-full">
			<div className="max-w-2xl mx-auto px-5 text-center">
				<h2 className="font-serif text-3xl md:text-4xl font-semibold text-cream mb-3">Ready to play?</h2>
				<p className="text-cream/60 mb-8">Reserve your court today. No membership required.</p>
				<Link
					href="/book"
					className="inline-block bg-gold text-emerald-deep font-semibold text-base px-8 py-4 rounded-xl hover:bg-gold-muted transition-colors"
				>
					Book a Court Now
				</Link>
			</div>
		</section>
	);
}
