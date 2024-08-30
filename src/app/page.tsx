import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardCard title="Total Employees" value="1700" link="/employees" />
        <DashboardCard title="Present" value="1560" link="/attendance" />
        <DashboardCard title="On Leave" value="35" link="/leave" />
        <DashboardCard title="Late Arrivals" value="25" link="/attendance" />
        <DashboardCard title="Upcoming Holidays" value="3" link="/holidays" />
      </div>
    </div>
  );
}

const DashboardCard = ({ title, value, link }: { title: string; value: string; link: string }) => (
  <Link href={link} className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition">
    <h2 className="text-xl font-semibold mb-2">{title}</h2>
    <p className="text-3xl font-bold text-primary">{value}</p>
  </Link>
);