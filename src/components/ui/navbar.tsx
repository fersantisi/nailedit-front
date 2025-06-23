import { Box, Typography } from '@mui/material';
import { NavbarItem } from './navbaritem';
import { User } from '../../types';

interface NavbarProps {
  user: User | null;
  isAdmin?: boolean;
}

export const Navbar = ({ user, isAdmin = false }: NavbarProps) => {
  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          backgroundColor: '#4c4a52',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          padding: '10px',
          width: '100%',
        }}
      >
        <Box sx={{ display: 'flex', gap: '20px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img
              src="/assets/nailedit.svg"
              style={{
                width: '50px',
                height: '50px',
                fill: 'white',
              }}
              alt="NailedIt Logo"
            />
            <NavbarItem to="/">
              <Typography variant="h6" component="div">
                NailedIt!
              </Typography>
            </NavbarItem>
          </Box>
          {user && !isAdmin ? (
            <>
              <NavbarItem to="/project/list">
                <Typography variant="h6" component="div">
                  Projects
                </Typography>
              </NavbarItem>
              <NavbarItem to="/calendar">
                <Typography variant="h6" component="div">
                  Calendar
                </Typography>
              </NavbarItem>
              <NavbarItem to="/gantt">
                <Typography variant="h6" component="div">
                  Gantt
                </Typography>
              </NavbarItem>
            </>
          ) : null}
        </Box>
        <Box sx={{ display: 'flex', gap: '20px', pr: 3 }}>
          {user ? (
            <>
              <NavbarItem to="/profile">
                <Typography variant="h6" component="div">
                  {user.username}
                </Typography>
              </NavbarItem>
              <NavbarItem to="/logout">
                <Typography variant="h6" component="div">
                  Log out
                </Typography>
              </NavbarItem>
            </>
          ) : (
            <>
              <NavbarItem to="/login">
                <Typography variant="h6" component="div">
                  Log-in
                </Typography>
              </NavbarItem>
              <NavbarItem to="/register">
                <Typography variant="h6" component="div">
                  Register
                </Typography>
              </NavbarItem>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};
