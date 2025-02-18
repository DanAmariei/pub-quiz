import Footer from "@/components/footer/index";
import Navbar from "@/components/navbar/index";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="container p-4 sm:p-6 flex-1">{children}</main>

      <Footer />
    </div>
  );
}
