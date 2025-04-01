import { Link } from 'react-router';

interface NavbarItemProps {
  label: string;
  to: string;
}

export const NavbarItem = ({ label, to }: NavbarItemProps) => {
  return (
    <Link
      to={to}
      style={{
        textDecoration: 'none',
        color: '#e2e2e2',
        padding: '10px',
        fontSize: '16px',
      }}
    >
      {label}
    </Link>
  );
};
