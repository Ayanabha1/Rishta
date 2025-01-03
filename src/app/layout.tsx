import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});
export const metadata: Metadata = {
  title: "Rishta",
  description: "Make stronger bonds",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.className} antialiased flex min-h-screen w-full items-center justify-center bg-gray-900 p-4`}
      >
        <main className="relative  h-screen  max-w-[390px]  w-full overflow-hidden  bg-gradient p-4 flex">
          {children}
          <ToastContainer
            className="absolute z-50 top-[90%]"
            stacked
            limit={1}
            closeOnClick
          />
        </main>
      </body>
    </html>
  );
}
