import { Link } from "react-router";

const Navbar = () => {
  return (
    <nav className="navbar">
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
      <Link to="/upload" className="primary-button w-fit">
        Upload Resume
      </Link>
    </nav>
  );
};

export default Navbar;
