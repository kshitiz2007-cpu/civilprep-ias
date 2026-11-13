import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gyankunj IAS — Civil Services Learning & Evaluation Studio",
  description:
    "A refined bilingual learning and evaluation experience for Civil Services aspirants, with interactive tests, resources, analytics and focused preparation tools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="rose"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}