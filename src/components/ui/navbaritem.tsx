import { Link } from 'react-router';

interface NavbarItemProps {
  to: string;
  children?: React.ReactNode;
}

export const NavbarItem = ({ to, children }: NavbarItemProps) => {
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
      {children}
    </Link>
  );
};
