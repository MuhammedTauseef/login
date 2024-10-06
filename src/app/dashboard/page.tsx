// app/dashboard/page.tsx 
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface DashboardData {
  totalEmployees: number;
  present: number;
  absent: number;
  lateArrivals: number;
  upcomingHolidays: number;
  totalLeaves: number; // نیا فیلڈ شامل کیا گیا
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    totalEmployees: 0,
    present: 0,
    absent: 0,
    lateArrivals: 0,
    upcomingHolidays: 0,
    totalLeaves: 0, // نیا فیلڈ شامل کیا گیا
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/dashboard');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      const dashboardData = await response.json();
      setData(dashboardData);
      setError(null);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const intervalId = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(intervalId);
  }, []);

  if (isLoading) {
    return <div className="text-center mt-8">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <DashboardCard title="Total Employees" value={data.totalEmployees} link="/employees" />
        <DashboardCard title="Present" value={data.present} link="/attendance" />
        <DashboardCard title="Absent" value={data.absent} link="/attendance" />
        <DashboardCard title="Late Arrivals" value={data.lateArrivals} link="/attendance" />
        <DashboardCard title="Upcoming Holidays" value={data.upcomingHolidays} link="/holidays" />
        <DashboardCard title="Total Leaves" value={data.totalLeaves} link="/leave" /> {/* نیا DashboardCard شامل کیا گیا */}
      </div>
    </div>
  );
}

const DashboardCard = ({ title, value, link }: { title: string; value: number; link: string }) => (
  <Link href={link} className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition block">
    <h2 className="text-lg md:text-xl font-semibold mb-2">{title}</h2>
    <p className="text-2xl md:text-3xl font-bold text-primary">{value}</p>
  </Link>
);
