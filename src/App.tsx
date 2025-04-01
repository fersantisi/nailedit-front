import { Route, Routes } from 'react-router';
import { Login } from './pages/Login';
import { Box, createTheme, ThemeProvider } from '@mui/material';
import { Register } from './pages/Register';

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
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </ThemeProvider>
    </Box>
  );
}

export default App;
