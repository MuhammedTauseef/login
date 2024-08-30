import Link from 'next/link';

const Header = () => {
  return (
    <header className="bg-blue-500 p-4 text-center text-white">
      <nav className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          FGEHA Attendance Managment System
        </Link>
        <div className="space-x-4">
          <Link href="/employees">Employees</Link>
          <Link href="/attendance">Attendance</Link>
          <Link href="/leave">Leave</Link>
          <Link href="/holidays">Holidays</Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;