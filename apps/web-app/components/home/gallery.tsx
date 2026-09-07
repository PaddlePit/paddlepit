import Image from "next/image";
import { Button } from "../ui/button";
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
	return (
		<div className="relative flex flex-col min-h-screen items-center max-w-[950] w-full gap-[32] overflow-hidden bg-cream px-[20]">
			<div className="flex flex-row w-full justify-between items-center">
				<div className="flex flex-col gap-2">
					<h1 className="text-left font-semibold min-[680]:text-[5xl] text-4xl font-[Lora] text-emerald">Gallery</h1>
					<p className="text-sm text-emerald/60">A look inside our courts and facility</p>
				</div>
				<Button variant="outline">View All</Button>
			</div>
			<div className="flex flex-row flex-wrap w-full justify-left gap-[20]">
				{images.map((image) =>
					<div key={image.alt} className="relative flex justify-center items-center min-[680]:w-[calc(50%-15px)] w-full h-[230] bg-emerald min-[950]:hover:w-[450] rounded-3xl text-cream overflow-hidden transition-w duration-500">
						<Image
							src={image.src}
							alt={image.alt}
							fill
							sizes="(max-width: 680px) 100vw, 400px"
							className="object-cover"
						/>
					</div>
				)}
			</div>
		</div>
	);
}
