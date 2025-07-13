import { Box, Typography } from '@mui/material';
import { NavbarItem } from './navbaritem';
import { User } from '../../types';
import { Link } from 'react-router';
import {
  Home as HomeIcon,
  Folder as ProjectIcon,
  CalendarMonth as CalendarIcon,
  Timeline as GanttIcon,
  Person as ProfileIcon,
  Logout as LogoutIcon,
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
  AdminPanelSettings as AdminIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';

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
            <Link
              to="/"
              style={{
                textDecoration: 'none',
                color: '#e2e2e2',
                padding: '0px',
                fontSize: '16px',
              }}
            >
              <img
                src="/assets/nailedit.svg"
                style={{
                  width: '50px',
                  height: '50px',
                  fill: 'white',
                }}
                alt="NailedIt Logo"
              />
            </Link>
            <NavbarItem to="/">
              <Typography variant="h6" component="div">
                NailedIt!
              </Typography>
            </NavbarItem>
          </Box>
          {user && !isAdmin ? (
            <>
              <NavbarItem to="/project/list">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ProjectIcon sx={{ color: 'white' }} />
                  <Typography variant="h6" component="div">
                    Projects
                  </Typography>
                </Box>
              </NavbarItem>
              <NavbarItem to="/calendar">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarIcon sx={{ color: 'white' }} />
                  <Typography variant="h6" component="div">
                    Calendar
                  </Typography>
                </Box>
              </NavbarItem>
              <NavbarItem to="/gantt">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GanttIcon sx={{ color: 'white' }} />
                  <Typography variant="h6" component="div">
                    Gantt
                  </Typography>
                </Box>
              </NavbarItem>
              <NavbarItem to="/stock">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InventoryIcon sx={{ color: 'white' }} />
                  <Typography variant="h6" component="div">
                    Stock
                  </Typography>
                </Box>
              </NavbarItem>
            </>
          ) : null}
          {user && isAdmin ? (
            <>
              <NavbarItem to="/admin/users">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AdminIcon sx={{ color: 'white' }} />
                  <Typography variant="h6" component="div">
                    Admin Users
                  </Typography>
                </Box>
              </NavbarItem>
            </>
          ) : null}
        </Box>
        <Box sx={{ display: 'flex', gap: '20px', pr: 3 }}>
          {user ? (
            <>
              <NavbarItem to="/profile">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ProfileIcon sx={{ color: 'white' }} />
                  <Typography variant="h6" component="div">
                    {user.username}
                  </Typography>
                </Box>
              </NavbarItem>
              <NavbarItem to="/logout">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LogoutIcon sx={{ color: 'white' }} />
                  <Typography variant="h6" component="div">
                    Log out
                  </Typography>
                </Box>
              </NavbarItem>
            </>
          ) : (
            <>
              <NavbarItem to="/login">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LoginIcon sx={{ color: 'white' }} />
                  <Typography variant="h6" component="div">
                    Log-in
                  </Typography>
                </Box>
              </NavbarItem>
              <NavbarItem to="/register">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <RegisterIcon sx={{ color: 'white' }} />
                  <Typography variant="h6" component="div">
                    Register
                  </Typography>
                </Box>
              </NavbarItem>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};
