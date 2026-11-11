import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

const sans = Geist({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Vesperal", template: "%s · Vesperal" },
  description:
    "Vesperal is an autonomous software company for your repository. An Ideator, a Coder and a Tester take turns on your codebase; only the Tester can ship.",
  openGraph: {
    title: "Vesperal",
    description: "The night shift for your codebase.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sans.variable} ${mono.variable} ${serif.variable}`}
    >
      <head>
        <link id="favicon" rel="icon" type="image/svg+xml" href="/icon-dark.svg" />
        {/* Dark is the default. A stored "light" preference flips the theme and the tab icon before first paint. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("theme")==="light"){document.documentElement.classList.add("light");document.getElementById("favicon").href="/icon-light.svg"}}catch(e){}`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
