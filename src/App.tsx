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
import { EditGoal } from './pages/EditGoal';
import { EditTask } from './pages/EditTask';
import { AdminUsers } from './pages/AdminUsers';
import { AdminRoute } from './components/admin/AdminRoute';
import { Profile } from './pages/Profile';
import { Calendar } from './pages/Calendar';
import { ProjectList } from './pages/ProjectList';
import { Gantt } from './pages/Gantt';
import { StockPage } from './pages/Stock';
import { Community } from './pages/Community';

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
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#2e2e2e',
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
          <Route
            path="/auth/recoverPassword/:token"
            element={
              <GuestRoute>
                <PasswordReset />
              </GuestRoute>
            }
          />
          <Route path="/profile" element={<Profile />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/gantt" element={<Gantt />} />
          <Route path="/stock" element={<StockPage />} />
          <Route path="/community" element={<Community />} />
          <Route path="/project/list" element={<ProjectList />} />
          <Route path="/project/:id" element={<Project />} />
          <Route path="/project/:id/edit" element={<EditProject />} />
          <Route path="/project/create" element={<NewProject />} />
          <Route path="/project/:id/goal/create" element={<NewGoal />} />
          <Route path="/project/:id/goal/:goalId/edit" element={<EditGoal />} />
          <Route
            path="/project/:id/goal/:goalId/task/:taskId/edit"
            element={<EditTask />}
          />
          <Route
            path="/project/:id/goal/:goalId/task/create"
            element={<NewTask />}
          />
          <Route path="/logout" element={<Logout />} />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            }
          />
        </Routes>
      </ThemeProvider>
    </Box>
  );
}

export default App;
