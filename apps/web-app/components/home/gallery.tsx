"use client"

import { useState } from "react";
import Image from "next/image";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogTitle,
} from "../ui/dialog";
import img1 from "@/assets/gallery/1.jpg";
import img2 from "@/assets/gallery/2.jpg";
import img3 from "@/assets/gallery/3.jpg";
import img4 from "@/assets/gallery/4.jpg";

const images = [
	{ src: img1, alt: "PaddlePit court 1" },
	{ src: img2, alt: "PaddlePit court 2" },
	{ src: img3, alt: "PaddlePit court 3" },
	{ src: img4, alt: "PaddlePit court 4" },
];

export default function Gallery() {
	const [selected, setSelected] = useState<number | null>(null);

	return (
		<section id="gallery" className="relative flex flex-col items-center max-w-[950] w-full gap-[32] overflow-hidden bg-cream px-[20] py-16 scroll-mt-24">
			<div className="flex flex-row w-full justify-between items-center">
				<div className="flex flex-col gap-2">
					<h1 className="text-left font-semibold min-[680]:text-[5xl] text-4xl font-[Lora] text-emerald">Gallery</h1>
					<p className="text-sm text-emerald/60">A look inside our courts and facility</p>
				</div>
				<Button variant="outline">View All</Button>
			</div>
			<div className="flex flex-row flex-wrap w-full justify-left gap-[20]">
				{images.map((image, index) =>
					<button
						key={image.alt}
						onClick={() => setSelected(index)}
						className="group relative flex justify-center items-center min-[680]:w-[calc(50%-15px)] w-full h-[230] bg-emerald min-[950]:hover:w-[450] rounded-3xl text-cream overflow-hidden transition-w duration-500 cursor-pointer"
					>
						<Image
							src={image.src}
							alt={image.alt}
							fill
							sizes="(max-width: 680px) 100vw, 400px"
							className="object-cover"
						/>
					</button>
				)}
			</div>
			<Dialog open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null); }}>
				<DialogContent
					aria-describedby={undefined}
					className="grid sm:max-w-none bg-transparent p-0 shadow-none ring-0"
					style={{ width: "fit-content" }}
				>
					{selected !== null && (
						<Image
							src={images[selected].src}
							alt={images[selected].alt}
							width={images[selected].src.width}
							height={images[selected].src.height}
							className="h-auto w-auto max-h-[75vh] max-w-[calc(100vw-2rem)] rounded-4xl bg-emerald-950 object-contain"
						/>
					)}
					<DialogTitle className="sr-only">{selected !== null ? images[selected].alt : "Image preview"}</DialogTitle>
				</DialogContent>
			</Dialog>
		</section>
	);
}
