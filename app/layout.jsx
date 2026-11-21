import dynamic from "next/dynamic";
import "./globals.css";
import "@/components/ui/glass-carousel-utils/glass-carousel.css";
import "@/components/ui/GlassSurface.css";

const AureaSectioTransition = dynamic(
  () => import("@/components/ui/aurea-sectio-transition"),
  { ssr: false }
);

export const metadata = {
  title: "Saswat Mohanty — Creative Studio & Digital Design Portfolio",
  description: "A forward-thinking digital design and brand architecture studio portfolio by Saswat Mohanty.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Syne:wght@700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AureaSectioTransition />
        {children}
      </body>
    </html>
  );
}
