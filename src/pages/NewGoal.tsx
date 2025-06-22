import Typography from '@mui/material/Typography';
import { Card } from '../components/ui/card';
import { Box, Button, TextField, Alert, Snackbar } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '../components/ui/navbar';
import { useState, useEffect } from 'react';
import { User } from '../types';

export const NewGoal = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

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
    goalName?: string;
    goalDescription?: string;
    duedate?: string;
  }>({});

  // Add state to track form values
  const [formData, setFormData] = useState({
    goalName: '',
    goalDescription: '',
    duedate: '',
  });

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
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
        setUser(meData);
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
    const { goalName, goalDescription, duedate } = formData;

    // Validate goal name
    if (!goalName || goalName.trim().length === 0) {
      errors.goalName = 'Goal name is required';
    } else if (goalName.trim().length < 3) {
      errors.goalName = 'Goal name must be at least 3 characters long';
    }

    // Validate description (optional but if provided, check length)
    if (goalDescription && goalDescription.trim().length > 500) {
      errors.goalDescription = 'Description must be less than 500 characters';
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

  const createGoal = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setAlert({
        open: true,
        message: 'Please fix the form errors before submitting',
        severity: 'error',
      });
      return;
    }

    const { goalName, goalDescription, duedate } = formData;

    try {
      const response = await fetch(
        import.meta.env.VITE_SERVER_URL + `/project/${id}/createGoal`,
        {
          method: 'POST',
          body: JSON.stringify({
            name: goalName.trim(),
            description: goalDescription.trim() || undefined,
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
        let message = 'Failed to create goal';
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
        message: 'Goal created successfully!',
        severity: 'success',
      });

      // Navigate to project after a short delay
      setTimeout(() => {
        navigate(`/project/${id}`);
      }, 1500);
    } catch (error) {
      console.error('Error during goal creation:', error);
      setAlert({
        open: true,
        message:
          error instanceof Error ? error.message : 'Failed to create goal',
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
              New Goal
            </Typography>
          </Box>
          <Box component="form" onSubmit={createGoal} noValidate>
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
                error={!!formErrors.goalName}
                helperText={formErrors.goalName}
                sx={{ marginTop: '10px' }}
                value={formData.goalName}
                onChange={(e) => handleInputChange('goalName', e.target.value)}
              />
            </Box>
            <Box sx={{ marginBottom: '20px' }}>
              <TextField
                variant="outlined"
                name="goalDescription"
                id="goalDescription"
                type="text"
                label="Description (optional)"
                placeholder="Enter a description"
                fullWidth
                multiline
                rows={3}
                error={!!formErrors.goalDescription}
                helperText={formErrors.goalDescription}
                sx={{ marginTop: '10px' }}
                value={formData.goalDescription}
                onChange={(e) =>
                  handleInputChange('goalDescription', e.target.value)
                }
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
                error={!!formErrors.duedate}
                helperText={formErrors.duedate}
                sx={{ marginTop: '10px' }}
                slotProps={{ inputLabel: { shrink: true } }}
                value={formData.duedate}
                onChange={(e) => handleInputChange('duedate', e.target.value)}
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
                Create Goal
              </Button>
            </Box>
          </Box>
        </Card>
      </Box>
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>
    </>
  );
};
