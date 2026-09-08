"use client"

import { useEffect, useRef, useState } from "react";

function PickleballIcon() {
	return (
		<svg width="26" height="26" viewBox="0 0 48 48" fill="none">
			<circle cx="24" cy="24" r="22" fill="#FFD400" stroke="#0F3D34" strokeWidth="2.5" />
			<circle cx="15" cy="15" r="4.5" fill="#0F3D34" />
			<circle cx="33" cy="15" r="4.5" fill="#0F3D34" />
			<circle cx="24" cy="31" r="4.5" fill="#0F3D34" />
		</svg>
	);
}

export default function CursorPickleball() {
	const [pos, setPos] = useState({ x: 0, y: 0 });
	const posRef = useRef({ x: 0, y: 0 });

	useEffect(() => {
		const onMouseMove = (e: MouseEvent) => {
			posRef.current = { x: e.clientX, y: e.clientY };
			setPos(posRef.current);
		};

		document.addEventListener("mousemove", onMouseMove);
		return () => {
			document.removeEventListener("mousemove", onMouseMove);
		};
	}, []);

	return (
		<div
			className="pointer-events-none fixed z-100"
			style={{ left: pos.x, top: pos.y }}
			aria-hidden="true"
		>
			<div className="-translate-x-1/2 -translate-y-1/2 animate-[spin_2s_linear_infinite]">
				<PickleballIcon />
			</div>
		</div>
	);
}
