import Typography from '@mui/material/Typography';
import { Card } from '../components/ui/card';
import { Box, Button } from '@mui/material';
import { TextField } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

interface Project {
  id: string;
  name: string;
  description?: string;
  category?: string;
  image?: string;
  dueDate?: string;
}

export const EditProject = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    projectName: '',
    projectDescription: '',
    projectCategory: '',
    projectImage: '',
    dueDate: '',
  });

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/project/${projectId}`, {
          credentials: 'include',
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch project');
        }

        setProject(data);
        setFormData({
          projectName: data.name || '',
          projectDescription: data.description || '',
          projectCategory: data.category || '',
          projectImage: data.image || '',
          dueDate: data.dueDate || '',
        });
      } catch (error) {
        console.error('Error fetching project:', error);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const updateProject = async (e: React.FormEvent) => {
    e.preventDefault();

    const { projectName, projectDescription, projectCategory, projectImage, dueDate } = formData;

    if (!projectName) {
      console.error('Project name is required');
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/project/${projectId}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            name: projectName,
            description: projectDescription,
            category: projectCategory,
            image: projectImage,
            dueDate,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        let message = '';
        for (const error of data.errors) {
          message += error.constraints.isNotEmpty + '\n';
        }
        throw new Error(message);
      }

      console.log('Project updated successfully:', data);
      navigate('/');
    } catch (error) {
      console.error(error);
    }
  };

  if (!project) {
    return <Typography>Loading...</Typography>;
  }

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
            Edit Project
          </Typography>
        </Box>
        <Box component="form" onSubmit={updateProject} noValidate>
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
              value={formData.projectName}
              onChange={handleInputChange}
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
              value={formData.projectDescription}
              onChange={handleInputChange}
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
              value={formData.projectCategory}
              onChange={handleInputChange}
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
              value={formData.projectImage}
              onChange={handleInputChange}
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
              value={formData.dueDate}
              onChange={handleInputChange}
              sx={{ marginTop: '10px' }}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Update Project
          </Button>
        </Box>
      </Card>
    </Box>
  );
};
