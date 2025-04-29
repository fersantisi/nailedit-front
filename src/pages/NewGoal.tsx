import Typography from '@mui/material/Typography';
import { Card } from '../components/ui/card';
import { Box, Button } from '@mui/material';
import { TextField } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

export const NewGoal = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const createGoal = async (formData: FormData) => {
    const name = formData.get('goalName');
    const description = formData.get('goalDescription');
    const dueDate = formData.get('dueDate');

    if (!name) {
      console.error('All fields are required');
      return;
    }

    try {
      const response = await fetch(
        import.meta.env.VITE_SERVER_URL + `/project/${id}/createGoal`,
        {
          method: 'POST',
          body: JSON.stringify({ name, description, dueDate }),
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      console.log('Response:', response);

      if (!response.ok) {
        throw new Error('Failed to create goal');
      }

      const data = await response.json();
      console.log('Goal created successfully:', data);
    } catch (error) {
      console.error('Error during goal creation:', error);
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
            New Goal
          </Typography>
        </Box>
        <Box component="form" action={createGoal} noValidate>
          <Box sx={{ marginBottom: '20px' }}>
            <TextField
              variant="outlined"
              name="goalName"
              id="goalName"
              type="text"
              label="Goal Name"
              placeholder="Enter goal's name"
              required
              fullWidth
              sx={{ marginTop: '10px' }}
            />
          </Box>
          <Box sx={{ marginBottom: '20px' }}>
            <TextField
              variant="outlined"
              name="goalDescription"
              id="goalDescription"
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
            Create goal
          </Button>
        </Box>
      </Card>
    </Box>
  );
};
