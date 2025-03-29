import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Short10 - URL Shortener",
    description: "A simple URL shortener",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                {children}
            </body>
        </html>
    );
}
