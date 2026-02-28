import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "sonner";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ImobHub CRM",
  description: "CRM Imobiliário Inteligente",
  icons: {
    icon: "/logo-icon-color.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={poppins.className}>
        <AuthProvider>{children}</AuthProvider>
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            duration: 3000,
            style: { fontSize: '13px' },
          }}
        />
      </body>
    </html>
  );
}