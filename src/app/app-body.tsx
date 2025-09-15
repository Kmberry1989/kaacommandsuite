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
        backgroundImage: 'url(/wallpaper-trending.png)',
        backgroundRepeat: 'repeat',
        backgroundSize: '540px 540px',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        opacity: 0.15,
        zIndex: 0,
      }}
    >
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Toaster />
        {children}
      </div>
    </body>
  );
}
