// components/Layout/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar = () => {
  const pathname = usePathname();

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/employees', label: 'Employees' },
    { href: '/attendance', label: 'Attendance' },
    { href: '/leave', label: 'Leave' },
    { href: '/holidays', label: 'Holidays' },
    { href: '/wings-sections', label: 'Wings & Sections' },
    { href: '/users', label: 'Users' },
    { href: '/reports', label: 'Reports' },
  ];

  return (
    <aside className="hidden md:block bg-black text-white w-64 min-h-screen p-4">
      <nav>
        <ul className="space-y-2">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`block px-4 py-2 rounded hover:bg-gray-700 ${
                  pathname === link.href ? 'bg-gray-700 font-semibold' : ''
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
