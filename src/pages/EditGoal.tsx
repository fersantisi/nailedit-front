import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, TextField, Typography } from '@mui/material';
import { Card } from '../components/ui/card';

export const EditGoal = () => {
  const navigate = useNavigate();
  const { id, goalId } = useParams<{ id: string; goalId: string }>();

  const [goalData, setGoalData] = useState({
    name: '',
    description: '',
    dueDate: '',
  });

  useEffect(() => {
    const fetchGoal = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SERVER_URL}/project/${id}/goal/${goalId}`,
          {
            credentials: 'include',
          }
        );
        const data = await response.json();
        setGoalData({
          name: data.name || '',
          description: data.description || '',
          dueDate: data.dueDate?.substring(0, 10) || '',
        });
      } catch (error) {
        console.error('Failed to fetch goal:', error);
      }
    };

    fetchGoal();
  }, [id, goalId]);

  const updateGoal = async (formData: FormData) => {
    const name = formData.get('goalName');
    const description = formData.get('goalDescription');
    const dueDate = formData.get('dueDate');

    if (!name) {
      console.error('All fields are required');
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/project/${id}/goal/${goalId}/updateGoal`,
        {
          method: 'PUT',
          body: JSON.stringify({ name, description, dueDate }),
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update goal');
      }

      const data = await response.json();
      console.log('Goal updated successfully:', data);
      navigate(`/project/${id}`);
    } catch (error) {
      console.error('Error during goal update:', error);
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
        }}
        onClick={() => navigate('/')}
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
            Edit Goal
          </Typography>
        </Box>
        <Box component="form" action={updateGoal} noValidate>
          <Box sx={{ marginBottom: '20px' }}>
            <TextField
              variant="outlined"
              name="goalName"
              id="goalName"
              type="text"
              label="Goal Name"
              placeholder="Enter goal's name"
              defaultValue={goalData.name}
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
              defaultValue={goalData.description}
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
              placeholder="Enter a due date"
              defaultValue={goalData.dueDate}
              fullWidth
              sx={{ marginTop: '10px' }}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Save Changes
          </Button>
        </Box>
      </Card>
    </Box>
  );
};
