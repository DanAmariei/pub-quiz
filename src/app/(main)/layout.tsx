import Footer from "@/components/footer/index";
import Navbar from "@/components/navbar/index";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />

      <main className="container p-4 sm:p-6 flex-1">{children}</main>

      <Footer />
    </>
  );
}
