import { AppBar, Box, Typography } from '@mui/material';
import { NavbarItem } from './navbaritem';
import { User } from '../../types';

interface NavbarProps {
  user: User | null;
}

export const Navbar = ({ user }: NavbarProps) => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        sx={{
          backgroundColor: '#4c4a52',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          padding: '10px',
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
          {user ? (
            <>
              <NavbarItem to="/project/list">
                <Typography variant="h6" component="div">
                  Projects
                </Typography>
              </NavbarItem>
              <NavbarItem to="/project/create">
                <Typography variant="h6" component="div">
                  New Project
                </Typography>
              </NavbarItem>
            </>
          ) : (
            <></>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: '20px' }}>
          {user ? (
            <>
              <NavbarItem to="/user/profile">
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
      </AppBar>
    </Box>
  );
};
