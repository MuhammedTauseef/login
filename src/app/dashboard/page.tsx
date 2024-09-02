'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface DashboardData {
  totalEmployees: number;
  present: number;
  onLeave: number;
  lateArrivals: number;
  upcomingHolidays: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    totalEmployees: 0,
    present: 0,
    onLeave: 0,
    lateArrivals: 0,
    upcomingHolidays: 0,
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

    // Set up interval to fetch data every 30 seconds
    const intervalId = setInterval(fetchDashboardData, 30000);

    // Clean up interval on component unmount
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
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardCard title="Total Employees" value={data.totalEmployees} link="/employees" />
        <DashboardCard title="Present" value={data.present} link="/attendance" />
        <DashboardCard title="On Leave" value={data.onLeave} link="/leave" />
        <DashboardCard title="Late Arrivals" value={data.lateArrivals} link="/attendance" />
        <DashboardCard title="Upcoming Holidays" value={data.upcomingHolidays} link="/holidays" />
      </div>
    </div>
  );
}

const DashboardCard = ({ title, value, link }: { title: string; value: number; link: string }) => (
  <Link href={link} className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition">
    <h2 className="text-xl font-semibold mb-2">{title}</h2>
    <p className="text-3xl font-bold text-primary">{value}</p>
  </Link>
);
