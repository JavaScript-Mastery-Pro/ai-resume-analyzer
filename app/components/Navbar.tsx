import { Link } from "react-router";

const Navbar = () => {
  return (
    <nav className="flex flex-row justify-between items-center bg-white rounded-full p-4 w-full px-10 max-w-[1200px] mx-auto ">
      <Link to="/">
        <p className="text-2xl font-bold text-gradient">RESUMIND</p>
      </Link>
      {/* <div className="flex flex-row gap-4">
        {navLinks.map((link) => (
          <Link key={link.label} to={link.href} className="text-gray-500">
            {link.label}
          </Link>
        ))}
      </div> */}
      <Link
        to="/upload"
        className="primary-gradient text-white rounded-full px-4 py-2 cursor-pointer hover:primary-gradient-hover transition-all duration-300"
      >
        Upload Resume
      </Link>
    </nav>
  );
};

export default Navbar;
