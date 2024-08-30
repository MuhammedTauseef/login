import './globals.css';
import Header from '@/components/Layout/Header';
import Sidebar from '@/components/Layout/Sidebar';
import Footer from '@/components/Layout/Footer';

export const metadata = {
  title: 'Housing Authority Attendance System',
  description: 'Advanced attendance management system for federal government employees',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-4">
            {children}
          </main>
        </div>
        <Footer />
      </body>
    </html>
  );
}