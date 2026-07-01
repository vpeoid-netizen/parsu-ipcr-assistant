import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { APP_DISPLAY_NAME } from "@/lib/utils";
import "./globals.css";

export const metadata: Metadata = {
  title: APP_DISPLAY_NAME,
  description: "FY 2026 IPCR rating computation tool for Partido State University teaching personnel.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
