import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PaddlePit",
  description: "Book your court in seconds. Real-time availability, instant confirmation.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`h-full antialiased`}
    >
      <body className="min-h-full flex flex-col justify-center">{children}</body>
    </html>
  );
}
