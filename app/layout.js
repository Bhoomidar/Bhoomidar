import { Inter, Playfair_Display, Dancing_Script } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});
const dancing = Dancing_Script({ subsets: ["latin"], variable: "--font-dancing" });

export const metadata = {
  title: "Bhoomidar | Invest Today, Build a Brighter Tomorrow",
  description:
    "Great properties. Clear deals. Rewarding partnership. Bhoomidar is a trusted real estate partner network.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${dancing.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
