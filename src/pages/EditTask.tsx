import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Snackbar,
} from '@mui/material';
import { Card } from '../components/ui/card';
import { Navbar } from '../components/ui/navbar';
import { User } from '../types';

export const EditTask = () => {
  const navigate = useNavigate();
  const { id, goalId, taskId } = useParams<{
    id: string;
    goalId: string;
    taskId: string;
  }>();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });
  const [formErrors, setFormErrors] = useState<{
    taskName?: string;
    taskDescription?: string;
    taskLabel?: string;
    duedate?: string;
  }>({});

  const [taskData, setTaskData] = useState({
    name: '',
    description: '',
    label: '',
    duedate: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch user data
        const meResponse = await fetch(
          import.meta.env.VITE_SERVER_URL + '/users/me',
          {
            method: 'GET',
            credentials: 'include',
          }
        );

        if (!meResponse.ok) {
          setUser(null);
          navigate('/login');
          return;
        }

        const meData = await meResponse.json();
        console.log('meData', meData);

        const userId = meData.userId;

        const profileResponse = await fetch(
          import.meta.env.VITE_SERVER_URL + `/users/profile/${userId}`,
          {
            method: 'GET',
            credentials: 'include',
          }
        );

        if (profileResponse.ok) {
          const userData = await profileResponse.json();
          setUser(userData);
        } else {
          setUser(null);
          navigate('/login');
          return;
        }

        // Fetch task data
        const response = await fetch(
          `${import.meta.env.VITE_SERVER_URL}/project/${id}/goal/${goalId}/task/${taskId}`,
          { credentials: 'include' }
        );

        const data = await response.json();
        setTaskData({
          name: data.name || '',
          description: data.description || '',
          label: data.label || '',
          duedate: data.dueDate?.substring(0, 10) || '',
        });
      } catch (error) {
        console.error('Failed to fetch task:', error);
        setAlert({
          open: true,
          message: 'Failed to load task data',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, goalId, taskId, navigate]);

  const validateForm = (formData: FormData) => {
    const errors: typeof formErrors = {};
    const name = formData.get('taskName') as string;
    const description = formData.get('taskDescription') as string;
    const label = formData.get('taskLabel') as string;
    const duedate = formData.get('duedate') as string;

    // Validate task name
    if (!name || name.trim().length === 0) {
      errors.taskName = 'Task name is required';
    } else if (name.trim().length < 3) {
      errors.taskName = 'Task name must be at least 3 characters long';
    }

    // Validate description (optional but if provided, check length)
    if (description && description.trim().length > 500) {
      errors.taskDescription = 'Description must be less than 500 characters';
    }

    // Validate label (optional but if provided, check length)
    if (label && label.trim().length > 50) {
      errors.taskLabel = 'Label must be less than 50 characters';
    }

    // Validate due date (optional but if provided, check if it's in the future)
    if (duedate) {
      const selectedDate = new Date(duedate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        errors.duedate = 'Due date must be in the future';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const updateTask = async (formData: FormData) => {
    if (!validateForm(formData)) {
      setAlert({
        open: true,
        message: 'Please fix the form errors before submitting',
        severity: 'error',
      });
      return;
    }

    const name = formData.get('taskName') as string;
    const description = formData.get('taskDescription') as string;
    const label = formData.get('taskLabel') as string;
    const duedate = formData.get('duedate') as string;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/project/${id}/goal/${goalId}/task/${taskId}/updateTask`,
        {
          method: 'PUT',
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim() || undefined,
            label: label.trim() || undefined,
            dueDate: duedate || undefined,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        let message = 'Failed to update task';
        if (data.errors && Array.isArray(data.errors)) {
          message = data.errors
            .map((error: any) => error.constraints?.isNotEmpty || error.message)
            .join('\n');
        } else if (data.message) {
          message = data.message;
        }
        throw new Error(message);
      }

      setAlert({
        open: true,
        message: 'Task updated successfully!',
        severity: 'success',
      });

      // Navigate to project after a short delay
      setTimeout(() => {
        navigate(`/project/${id}`);
      }, 1500);
    } catch (error) {
      console.error('Error during task update:', error);
      setAlert({
        open: true,
        message:
          error instanceof Error ? error.message : 'Failed to update task',
        severity: 'error',
      });
    }
  };

  const handleCloseAlert = () => {
    setAlert((prev) => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        Loading...
      </Box>
    );
  }

  return (
    <>
      <Navbar user={user} />
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          pt: 4,
          px: '15px',
          width: '100%',
          gap: '20px',
          overflow: 'hidden',
        }}
      >
        <Card
          variant="outlined"
          sx={{
            width: '400px',
            margin: 'auto',
            padding: '20px',
            backgroundColor: 'secondary.main',
          }}
        >
          <Box
            sx={{
              textAlign: 'center',
              marginBottom: '20px',
              fontWeight: 'bold',
            }}
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
                error={!!formErrors.taskName}
                helperText={formErrors.taskName}
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
                placeholder="Enter a description"
                defaultValue={taskData.description}
                fullWidth
                multiline
                rows={3}
                error={!!formErrors.taskDescription}
                helperText={formErrors.taskDescription}
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
                placeholder="Enter a label (e.g., high, medium, low)"
                defaultValue={taskData.label}
                fullWidth
                error={!!formErrors.taskLabel}
                helperText={formErrors.taskLabel}
                sx={{ marginTop: '10px' }}
              />
            </Box>
            <Box sx={{ marginBottom: '20px' }}>
              <TextField
                variant="outlined"
                name="duedate"
                id="duedate"
                type="date"
                label="Due Date (optional)"
                defaultValue={taskData.duedate}
                fullWidth
                error={!!formErrors.duedate}
                helperText={formErrors.duedate}
                sx={{ marginTop: '10px' }}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                type="button"
                variant="outlined"
                fullWidth
                onClick={() => navigate(`/project/${id}`)}
              >
                Back to Project
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
              >
                Save Changes
              </Button>
            </Box>
          </Box>
        </Card>
      </Box>

      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alert.severity}
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </>
  );
};
