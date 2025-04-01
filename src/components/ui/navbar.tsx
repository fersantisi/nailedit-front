import { NavbarItem } from './navbaritem';

export const Navbar = () => {
  return (
    <nav style={{ display: 'flex', backgroundColor: '#4c4a52', padding: '10px' }}>
      <NavbarItem label="Home" to="/" />
      <NavbarItem label="About" to="/about" />
      <NavbarItem label="Contact" to="/contact" />
      <NavbarItem label="Login" to="/login" />
      <NavbarItem label="Register" to="/register" />
    </nav>
  );
};
