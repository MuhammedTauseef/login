import Link from 'next/link';

const Sidebar = () => {
  return (
    <aside className="bg-black text-white w-64 min-h-screen p-4 text">
      <nav>
        <ul className="space-y-2">
          <li><Link href="/">Dashboard</Link></li>
          <li><Link href="/employees">Employees</Link></li>
          <li><Link href="/attendance">Attendance</Link></li>
          <li><Link href="/leave">Leave</Link></li>
          <li><Link href="/holidays">Holidays</Link></li>
          <li><Link href="/wings-sections">Wings & Sections</Link></li>
          <li><Link href="/users">Users</Link></li>
          <li><Link href="/reports">Reports</Link></li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;