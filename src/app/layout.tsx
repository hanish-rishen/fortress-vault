import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const splinsSansMono = localFont({
  src: [
    {
      path: './fonts/SplineSansMono-VariableFont_wght.ttf',
      weight: '400',
      style: 'normal',
    }
  ],
  variable: '--font-splins-sans-mono',
});

export const metadata: Metadata = {
  title: "Fortress Vault",
  description: "Your fortress of digital security",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${splinsSansMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
