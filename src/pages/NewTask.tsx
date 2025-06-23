import { Card } from '../components/ui/card';
import {
  Box,
  Button,
  TextField,
  Alert,
  Snackbar,
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '../components/ui/navbar';
import { useState, useEffect } from 'react';
import { User } from '../types';

export const NewTask = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { goalId } = useParams<{ goalId: string }>();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    taskName: '',
    taskDescription: '',
    taskLabel: '',
    duedate: '',
  });
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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field when user starts typing
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);

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
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser(null);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  const validateForm = () => {
    const errors: typeof formErrors = {};
    const { taskName, taskDescription, taskLabel, duedate } = formData;

    // Validate task name
    if (!taskName || taskName.trim().length === 0) {
      errors.taskName = 'Task name is required';
    } else if (taskName.trim().length < 3) {
      errors.taskName = 'Task name must be at least 3 characters long';
    }

    // Validate description (optional but if provided, check length)
    if (taskDescription && taskDescription.trim().length > 500) {
      errors.taskDescription = 'Description must be less than 500 characters';
    }

    // Validate label (optional but if provided, check length)
    if (taskLabel && taskLabel.trim().length > 50) {
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

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setAlert({
        open: true,
        message: 'Please fix the form errors before submitting',
        severity: 'error',
      });
      return;
    }

    const { taskName, taskDescription, taskLabel, duedate } = formData;

    try {
      const response = await fetch(
        import.meta.env.VITE_SERVER_URL +
          `/project/${id}/goal/${goalId}/createTask`,
        {
          method: 'POST',
          body: JSON.stringify({
            name: taskName.trim(),
            description: taskDescription.trim() || undefined,
            label: taskLabel.trim() || undefined,
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
        let message = 'Failed to create task';
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
        message: 'Task created successfully!',
        severity: 'success',
      });

      // Navigate to project after a short delay
      setTimeout(() => {
        navigate(`/project/${id}`);
      }, 1500);
    } catch (error) {
      console.error('Error during task creation:', error);
      setAlert({
        open: true,
        message:
          error instanceof Error ? error.message : 'Failed to create task',
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
          overflow: 'hidden',
          overflowX: 'hidden',
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
          height: 'calc(100vh - 70px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          px: '15px',
          width: '100%',
          overflow: 'hidden',
          overflowX: 'hidden',
        }}
      >
        <Card
          variant="outlined"
          sx={{
            width: '400px',
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
              New Task
            </Typography>
          </Box>
          <Box component="form" onSubmit={createTask} noValidate>
            <Box sx={{ marginBottom: '20px' }}>
              <TextField
                variant="outlined"
                name="taskName"
                id="taskName"
                type="text"
                label="Task Name"
                placeholder="Enter task's name"
                required
                fullWidth
                value={formData.taskName}
                onChange={(e) => handleInputChange('taskName', e.target.value)}
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
                fullWidth
                multiline
                rows={3}
                value={formData.taskDescription}
                onChange={(e) =>
                  handleInputChange('taskDescription', e.target.value)
                }
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
                fullWidth
                value={formData.taskLabel}
                onChange={(e) => handleInputChange('taskLabel', e.target.value)}
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
                placeholder="Enter a due date (optional)"
                fullWidth
                value={formData.duedate}
                onChange={(e) => handleInputChange('duedate', e.target.value)}
                error={!!formErrors.duedate}
                helperText={formErrors.duedate}
                sx={{ marginTop: '10px' }}
                slotProps={{ inputLabel: { shrink: true } }}
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
                Create Task
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
