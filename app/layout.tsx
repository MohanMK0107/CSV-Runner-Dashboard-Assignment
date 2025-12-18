import type { Metadata } from "next";
import { Poppins , Inter  } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const poppins = Poppins({
  weight:["200","400","600"],
  subsets: ["latin"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "CSV Runner Dashboard",
  description: "A comprehensive web application that allows users to upload CSV files containing running data (date, person, miles run) and visualizes the data through interactive charts and comprehensive metrics. ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${poppins.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
