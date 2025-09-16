"use client";

import { Inter, Montserrat, Roboto, Lora } from "next/font/google";
import { useFont } from "@/context/font-provider";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";

// Font definitions
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-sans" });
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-sans",
});
const lora = Lora({ subsets: ["latin"], variable: "--font-sans" });

const fontMap: { [key: string]: any } = {
  Inter: inter,
  Montserrat: montserrat,
  Roboto: roboto,
  Lora: lora,
};

export function AppBody({ children }: { children: React.ReactNode }) {
  const { font } = useFont();
  const fontClass = fontMap[font]?.className || inter.className;

  return (
    <body
      className={cn("font-sans antialiased", fontClass)}
      style={{
        backgroundColor: "#000000",
        backgroundImage:
          "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(/wallpaper-trending.png)",
        backgroundRepeat: "repeat",
        backgroundSize: "540px 540px",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(255, 255, 255, 0.3)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>
        <Toaster />
        {children}
      </div>
    </body>
  );
}
