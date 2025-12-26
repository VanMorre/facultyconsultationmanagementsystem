import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ToastProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata = {
  title: "Faculty Consultation Management System",
  description: "Faculty Consultation Hours Portal - CITE",
  icons: {
    icon: [
      { url: "/images/coclogo-removebg.png", type: "image/png", sizes: "any" },
    ],
    apple: [
      { url: "/images/coclogo-removebg.png", type: "image/png", sizes: "180x180" },
    ],
    shortcut: "/images/coclogo-removebg.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
