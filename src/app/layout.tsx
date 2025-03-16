import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import { Providers } from "../components/providers";
import ServiceWorkerRegister from "../utils/registerSW";

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
      <Providers>
        <body
          className={`${poppins.className} antialiased flex min-h-screen w-full items-center justify-center bg-gray-900 p-0`}
        >
          <main className="relative h-screen max-w-[480px] w-full overflow-hidden  bg-gradient p-4 flex">
            <ServiceWorkerRegister />
            {children}
            <ToastContainer
              className="absolute z-50 top-[90%] left-[50%] translate-x-[-50%]"
              stacked
              limit={1}
              closeOnClick
              closeButton={false}
              position="bottom-center"
            />
          </main>
        </body>
      </Providers>
    </html>
  );
}
