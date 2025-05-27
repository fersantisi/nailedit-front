import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, TextField, Typography } from '@mui/material';
import { Card } from '../components/ui/card';

export const EditTask = () => {
  const navigate = useNavigate();
  const { id, goalId, taskId } = useParams<{
    id: string;
    goalId: string;
    taskId: string;
  }>();

  const [taskData, setTaskData] = useState({
    name: '',
    description: '',
    label: '',
    dueDate: '',
  });

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SERVER_URL}/project/${id}/goal/${goalId}/task/${taskId}`,
          { credentials: 'include' }
        );
        console.log('Response:', response);
        
        const data = await response.json();
        setTaskData({
          name: data.name || '',
          description: data.description || '',
          label: data.label || '',
          dueDate: data.dueDate?.substring(0, 10) || '',
        });
        console.log('Task data:', data);
        
      } catch (error) {
        console.error('Failed to fetch task:', error);
      }
    };

    fetchTask();
  }, [id, goalId, taskId]);

  const updateTask = async (formData: FormData) => {
    const name = formData.get('taskName');
    const description = formData.get('taskDescription');
    const label = formData.get('taskLabel');
    const dueDate = formData.get('dueDate');

    if (!name) {
      console.error('Task name is required');
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/project/${id}/goal/${goalId}/task/${taskId}/updateTask`,
        {
          method: 'PUT',
          body: JSON.stringify({ name, description, label, dueDate }),
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const data = await response.json();
      console.log('Task updated successfully:', data);
      navigate(`/project/${id}`);
    } catch (error) {
      console.error('Error during task update:', error);
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
          '&:hover': { backgroundColor: 'primary.dark' },
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
            Edit Task
          </Typography>
        </Box>
        <Box component="form" action={updateTask} noValidate>
          <Box sx={{ marginBottom: '20px' }}>
            <TextField
              variant="outlined"
              name="taskName"
              id="taskName"
              type="text"
              label="Task Name"
              placeholder="Enter task's name"
              defaultValue={taskData.name}
              required
              fullWidth
              sx={{ marginTop: '10px' }}
            />
          </Box>
          <Box sx={{ marginBottom: '20px' }}>
            <TextField
              variant="outlined"
              name="taskDescription"
              id="taskDescription"
              type="text"
              label="Description (optional)"
              placeholder="Enter a Description"
              defaultValue={taskData.description}
              fullWidth
              sx={{ marginTop: '10px' }}
            />
          </Box>
          <Box sx={{ marginBottom: '20px' }}>
            <TextField
              variant="outlined"
              name="taskLabel"
              id="taskLabel"
              type="text"
              label="Label (optional)"
              placeholder="Enter a Label"
              defaultValue={taskData.label}
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
              defaultValue={taskData.dueDate}
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
