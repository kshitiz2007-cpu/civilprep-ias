import type { Metadata } from "next";
import { ZenithCommandPalette } from "@/components/zenith-command-palette";
import { ZenithThemeProvider } from "@/components/zenith-theme-provider";
import "./globals.css";
import "./rose-atelier.css";

export const metadata: Metadata = {
  title: "CivilPrep IAS | UPSC • PCS • Beyond",
  description: "A connected learning and preparation platform for UPSC CSE and State PCS aspirants.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="rose">
      <body>
        <ZenithThemeProvider>
          {children}
          <ZenithCommandPalette />
        </ZenithThemeProvider>
      </body>
    </html>
  );
}
