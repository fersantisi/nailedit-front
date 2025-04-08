import { AppBar, Box, Typography } from '@mui/material';
import { NavbarItem } from './navbaritem';

interface NavbarProps {
  isLoggedIn: boolean;
}

export const Navbar = ({ isLoggedIn }: NavbarProps) => {
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
          <NavbarItem to="/">
            <Typography variant="h6" component="div">
              NailedIt!
            </Typography>
          </NavbarItem>
          {isLoggedIn ? (
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
          {isLoggedIn ? (
            <>
              <NavbarItem to="/user/profile">
                <Typography variant="h6" component="div">
                  My profile
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
