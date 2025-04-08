import { Route, Routes } from 'react-router';
import { Login } from './pages/Login';
import { Box, createTheme, ThemeProvider } from '@mui/material';
import { Register } from './pages/Register';
import { NewProject } from './pages/NewProject';
import { Home } from './pages/Home';

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
    <Box sx={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <ThemeProvider theme={theme}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/project/create" element={<NewProject />} />
        </Routes>
      </ThemeProvider>
    </Box>
  );
}

export default App;
