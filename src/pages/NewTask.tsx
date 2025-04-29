import Typography from '@mui/material/Typography';
import { Card } from '../components/ui/card';
import { Box, Button } from '@mui/material';
import { TextField } from '@mui/material';

export const NewTask = () => {
  const createTask = async (formData: FormData) => {
    const name = formData.get('taskName');
    const description = formData.get('taskDescription');
    const priority = formData.get('taskPirority');
    const label = formData.get('taskLabel');
    const duedate = formData.get('dueDate');

    if (!name) {
      console.error('All fields are required');
      return;
    }

    try {
      const response = await fetch(
        import.meta.env.VITE_SERVER_URL + '/task/create',
        {
          method: 'POST',
          body: JSON.stringify({ name, description, priority, label, duedate }),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Response:', response);

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const data = await response.json();
      console.log('Task created successfully:', data);
    } catch (error) {
      console.error('Error during task creation:', error);
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
            New Task
          </Typography>
        </Box>
        <Box component="form" action={createTask} noValidate>
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
              fullWidth
              sx={{ marginTop: '10px' }}
            />
          </Box>
          <Box sx={{ marginBottom: '20px' }}>
            <TextField
              variant="outlined"
              name="taskPirority"
              id="taskPirority"
              type="text"
              label="Pirority (optional)"
              placeholder="Enter a Pirority"
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
            Create task
          </Button>
        </Box>
      </Card>
    </Box>
  );
};
