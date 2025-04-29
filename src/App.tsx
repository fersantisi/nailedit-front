import { Route, Routes } from 'react-router';
import { Login } from './pages/Login';
import { Box, createTheme, ThemeProvider } from '@mui/material';
import { Register } from './pages/Register';
import { NewProject } from './pages/NewProject';
import { Home } from './pages/Home';
import { NewGoal } from './pages/NewGoal';
import { NewTask } from './pages/NewTask';
import { Logout } from './pages/Logout';
import { GuestRoute } from './components/GuestRoute';
import { PasswordRecovery } from './pages/PasswordRecovery';
import { PasswordReset } from './pages/PasswordReset';
import { Project } from './pages/Project';
import { EditProject } from './pages/EditProject';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#79799a',
    },
    secondary: {
      main: '#4c4a52',
    },
    background: {
      default: '#2e2e2e',
    },
    text: {
      primary: '#e2e2e2',
    },
  },
});

function App() {
  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <ThemeProvider theme={theme}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <Register />
              </GuestRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <GuestRoute>
                <PasswordRecovery />
              </GuestRoute>
            }
          />
          <Route
            path="/recoverPassword/:token"
            element={
              <GuestRoute>
                <PasswordReset />
              </GuestRoute>
            }
          />
          <Route path="/project/:id" element={<Project />} />
          <Route path="/project/:id/edit" element={<EditProject />} />
          <Route path="/project/create" element={<NewProject />} />
          <Route path="/project/:id/goal/create" element={<NewGoal />} />
          <Route
            path="/project/:id/goal/:goalId/task/create"
            element={<NewTask />}
          />
          <Route path="/logout" element={<Logout />} />
        </Routes>
      </ThemeProvider>
    </Box>
  );
}

export default App;
