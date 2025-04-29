import Typography from '@mui/material/Typography';
import { Card } from '../components/ui/card';
import { Box, Button } from '@mui/material';
import { TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const NewProject = () => {
  const navigate = useNavigate();
  const createProject = async (formData: FormData) => {
    const name = formData.get('projectName');
    const description = formData.get('projectDescription');
    const category = formData.get('projectCategory');
    const image = formData.get('projectImage');
    const dueDate = formData.get('dueDate');

    console.log(typeof dueDate);

    if (!name) {
      console.error('All fields are required');
      return;
    }

    try {
      const response = await fetch(
        import.meta.env.VITE_SERVER_URL + '/project/create',
        {
          method: 'POST',
          body: JSON.stringify({ name, description, category, image, dueDate }),
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      console.log('Response:', response);

      const data = await response.json();

      if (!response.ok) {
        let message = '';
        for (const error of data.errors) {
          message += error.constraints.isNotEmpty + '\n';
        }
        throw new Error(message);
      }

      if (response.ok) {
        navigate('/');
      }

      console.log('Project created successfully:', data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box>
      <Button
        variant="contained"
        color="primary"
        sx={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 1,
          backgroundColor: 'primary.main',
          '&:hover': {
            backgroundColor: 'primary.dark',
          },
        }}
        onClick={() => {
          window.location.href = '/';
        }}
      >
        Back to Home
      </Button>
      <Card
        variant="outlined"
        sx={{
          width: '300px',
          margin: 'auto',
          padding: '20px',
          backgroundColor: 'secondary.main',
        }}
      >
        <Box
          sx={{ textAlign: 'center', marginBottom: '20px', fontWeight: 'bold' }}
        >
          <Typography variant="h3" component="h1" gutterBottom>
            New Project
          </Typography>
        </Box>
        <Box component="form" action={createProject} noValidate>
          <Box sx={{ marginBottom: '20px' }}>
            <TextField
              variant="outlined"
              name="projectName"
              id="projectName"
              type="text"
              label="Project Name"
              placeholder="Enter project's name"
              required
              fullWidth
              sx={{ marginTop: '10px' }}
            />
          </Box>
          <Box sx={{ marginBottom: '20px' }}>
            <TextField
              variant="outlined"
              name="projectDescription"
              id="projectDescription"
              type="text"
              label="Description (optional)"
              placeholder="Enter a Description"
              fullWidth
              sx={{ marginTop: '10px' }}
            />
          </Box>
          <Box sx={{ marginBottom: '20px' }}>
            <TextField
              variant="outlined"
              name="projectCategory"
              id="projectCategory"
              type="text"
              label="Category (optional)"
              placeholder="Enter a category"
              fullWidth
              sx={{ marginTop: '10px' }}
            />
          </Box>
          <Box sx={{ marginBottom: '20px' }}>
            <TextField
              variant="outlined"
              name="projectImage"
              id="projectImage"
              type="text"
              label="Image (optional)"
              placeholder="Upload an image"
              fullWidth
              sx={{ marginTop: '10px' }}
            />
          </Box>
          <Box sx={{ marginBottom: '20px' }}>
            <TextField
              variant="outlined"
              name="dueDate"
              id="dueDate"
              type="date"
              label="Due Date (optional)"
              placeholder="Enter a due date (optional)"
              fullWidth
              sx={{ marginTop: '10px' }}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Create project
          </Button>
        </Box>
      </Card>
    </Box>
  );
};
