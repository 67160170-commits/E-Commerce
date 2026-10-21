import type { Metadata } from "next";
import "@fontsource-variable/noto-sans-thai"; // ฟอนต์โฮสต์เอง ไม่เรียก Google Fonts
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ThirdPartyScripts from "@/components/ThirdPartyScripts";
import CookieConsentBanner from "@/components/CookieConsentBanner";

export const metadata: Metadata = {
  title: { default: "My YaDom | รวมยาดมไทย จัดอันดับกลิ่นที่คุณรัก", template: "%s | My YaDom" },
  description: "ค้นพบยาดมไทย เลือกกลิ่นที่ชอบ รีวิวและจัดอันดับความหอม พร้อมช้อปในที่เดียว",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className="h-full antialiased">
      <body className="flex min-h-full flex-col font-sans">
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
        <CookieConsentBanner />
        <ThirdPartyScripts />
      </body>
    </html>
  );
}
