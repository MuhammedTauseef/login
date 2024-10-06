// components/Layout/Header.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Function to toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-blue-500 text-white">
      <nav className="container mx-auto flex justify-between items-center p-4">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold">
          FGEHA Attendance
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-6">
          <li>
            <Link href="/dashboard" className="hover:text-gray-300">
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/employees" className="hover:text-gray-300">
              Employees
            </Link>
          </li>
          <li>
            <Link href="/attendance" className="hover:text-gray-300">
              Attendance
            </Link>
          </li>
          <li>
            <Link href="/leave" className="hover:text-gray-300">
              Leave
            </Link>
          </li>
          <li>
            <Link href="/holidays" className="hover:text-gray-300">
              Holidays
            </Link>
          </li>
          <li>
            <Link href="/reports" className="hover:text-gray-300">
              Reports
            </Link>
          </li>
        </ul>

        {/* Hamburger Menu Button */}
        <button
          className="md:hidden focus:outline-none"
          onClick={toggleMobileMenu}
          aria-label="Toggle Menu"
        >
          {/* Hamburger Icon */}
          <svg
            className="h-6 w-6 fill-current"
            viewBox="0 0 24 24"
          >
            {mobileMenuOpen ? (
              // Close Icon
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              // Hamburger Icon
              <path
                fillRule="evenodd"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-blue-600">
          <ul className="flex flex-col space-y-2 p-4">
            <li>
              <Link href="/dashboard" className="block hover:text-gray-300" onClick={toggleMobileMenu}>
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/employees" className="block hover:text-gray-300" onClick={toggleMobileMenu}>
                Employees
              </Link>
            </li>
            <li>
              <Link href="/attendance" className="block hover:text-gray-300" onClick={toggleMobileMenu}>
                Attendance
              </Link>
            </li>
            <li>
              <Link href="/leave" className="block hover:text-gray-300" onClick={toggleMobileMenu}>
                Leave
              </Link>
            </li>
            <li>
              <Link href="/holidays" className="block hover:text-gray-300" onClick={toggleMobileMenu}>
                Holidays
              </Link>
            </li>
            <li>
              <Link href="/reports" className="block hover:text-gray-300" onClick={toggleMobileMenu}>
                Reports
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default Header;
