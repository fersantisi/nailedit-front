import { Card } from '../components/ui/card';
import {
  Box,
  Button,
  TextField,
  Alert,
  Snackbar,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/ui/navbar';
import { useState, useEffect } from 'react';
import { User } from '../types';

export const NewProject = () => {
  const navigate = useNavigate();
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
    projectName?: string;
    projectDescription?: string;
    projectCategory?: string;
    projectImage?: string;
    duedate?: string;
  }>({});

  useEffect(() => {
    const fetchUser = async () => {
      try {
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

  const validateForm = (formData: FormData) => {
    const errors: typeof formErrors = {};
    const name = formData.get('projectName') as string;
    const description = formData.get('projectDescription') as string;
    const category = formData.get('projectCategory') as string;
    const image = formData.get('projectImage') as string;
    const duedate = formData.get('duedate') as string;

    // Validate project name
    if (!name || name.trim().length === 0) {
      errors.projectName = 'Project name is required';
    } else if (name.trim().length < 3) {
      errors.projectName = 'Project name must be at least 3 characters long';
    }

    // Validate description (optional but if provided, check length)
    if (description && description.trim().length > 500) {
      errors.projectDescription =
        'Description must be less than 500 characters';
    }

    // Validate category (optional but if provided, check length)
    if (category && category.trim().length > 50) {
      errors.projectCategory = 'Category must be less than 50 characters';
    }

    // Validate image URL (optional but if provided, check if it's a valid URL)
    if (image && image.trim().length > 0) {
      try {
        new URL(image);
      } catch {
        errors.projectImage = 'Please enter a valid URL for the image';
      }
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

  const createProject = async (formData: FormData) => {
    if (!validateForm(formData)) {
      setAlert({
        open: true,
        message: 'Please fix the form errors before submitting',
        severity: 'error',
      });
      return;
    }

    const name = formData.get('projectName') as string;
    const description = formData.get('projectDescription') as string;
    const category = formData.get('projectCategory') as string;
    const image = formData.get('projectImage') as string;
    const duedate = formData.get('duedate') as string;

    try {
      const response = await fetch(
        import.meta.env.VITE_SERVER_URL + '/project/create',
        {
          method: 'POST',
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim() || undefined,
            category: category.trim() || undefined,
            image: image.trim() || undefined,
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
        let message = 'Failed to create project';
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
        message: 'Project created successfully!',
        severity: 'success',
      });

      // Navigate to home after a short delay
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      console.error('Error creating project:', error);
      setAlert({
        open: true,
        message:
          error instanceof Error ? error.message : 'Failed to create project',
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
                error={!!formErrors.projectName}
                helperText={formErrors.projectName}
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
                placeholder="Enter a description"
                fullWidth
                multiline
                rows={3}
                error={!!formErrors.projectDescription}
                helperText={formErrors.projectDescription}
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
                error={!!formErrors.projectCategory}
                helperText={formErrors.projectCategory}
                sx={{ marginTop: '10px' }}
              />
            </Box>

            <Box sx={{ marginBottom: '20px' }}>
              <TextField
                variant="outlined"
                name="projectImage"
                id="projectImage"
                type="url"
                label="Image URL (optional)"
                placeholder="https://example.com/image.jpg"
                fullWidth
                error={!!formErrors.projectImage}
                helperText={formErrors.projectImage}
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
                error={!!formErrors.duedate}
                helperText={formErrors.duedate}
                sx={{ marginTop: '10px' }}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Box>

            <Button type="submit" variant="contained" color="primary" fullWidth>
              Create Project
            </Button>
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
