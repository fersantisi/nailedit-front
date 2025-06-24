import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

interface Note {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface NotesModalProps {
  open: boolean;
  onClose: () => void;
  projectId?: number;
  goalId?: number;
  taskId?: number;
  title: string;
  userName: string;
}

const NotesModal: React.FC<NotesModalProps> = ({
  open,
  onClose,
  projectId,
  goalId,
  taskId,
  title,
  userName,
}) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [newNote, setNewNote] = useState({ name: '', description: '' });
  const [editingNote, setEditingNote] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [alert, setAlert] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Helper functions for endpoints
  const getFetchNotesEndpoint = () => {
    if (taskId && goalId && projectId) {
      return `${import.meta.env.VITE_SERVER_URL}/project/${projectId}/goal/${goalId}/task/${taskId}/notes`;
    } else if (goalId && projectId) {
      return `${import.meta.env.VITE_SERVER_URL}/project/${projectId}/goal/${goalId}/notes`;
    } else if (projectId) {
      return `${import.meta.env.VITE_SERVER_URL}/project/${projectId}/notes`;
    }
    return '';
  };

  const getCreateNoteEndpoint = () => {
    if (taskId && goalId && projectId) {
      return `${import.meta.env.VITE_SERVER_URL}/project/${projectId}/goal/${goalId}/task/${taskId}/createNote`;
    } else if (goalId && projectId) {
      return `${import.meta.env.VITE_SERVER_URL}/project/${projectId}/goal/${goalId}/createNote`;
    } else if (projectId) {
      return `${import.meta.env.VITE_SERVER_URL}/project/${projectId}/createNote`;
    }
    return '';
  };

  const getUpdateNoteEndpoint = (noteId: number) => {
    if (taskId && goalId && projectId) {
      return `${import.meta.env.VITE_SERVER_URL}/project/${projectId}/goal/${goalId}/task/${taskId}/note/${noteId}/updateNote`;
    } else if (goalId && projectId) {
      return `${import.meta.env.VITE_SERVER_URL}/project/${projectId}/goal/${goalId}/note/${noteId}/updateNote`;
    } else if (projectId) {
      return `${import.meta.env.VITE_SERVER_URL}/project/${projectId}/note/${noteId}/updateNote`;
    }
    return '';
  };

  const getDeleteNoteEndpoint = (noteId: number) => {
    if (taskId && goalId && projectId) {
      return `${import.meta.env.VITE_SERVER_URL}/project/${projectId}/goal/${goalId}/task/${taskId}/note/${noteId}`;
    } else if (goalId && projectId) {
      return `${import.meta.env.VITE_SERVER_URL}/project/${projectId}/goal/${goalId}/note/${noteId}`;
    } else if (projectId) {
      return `${import.meta.env.VITE_SERVER_URL}/project/${projectId}/note/${noteId}`;
    }
    return '';
  };

  const fetchNotes = async () => {
    if (!open) return;
    const endpoint = getFetchNotesEndpoint();
    if (!endpoint) return;
    setLoading(true);
    try {
      const response = await fetch(endpoint, {
        credentials: 'include',
      });
      if (response.ok) {
        const text = await response.text();
        if (!text) {
          setNotes([]);
        } else {
          const data = JSON.parse(text);
          setNotes(data);
        }
      } else {
        console.error('Failed to fetch notes');
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [open, projectId, goalId, taskId]);

  const createNote = async () => {
    if (!newNote.description.trim()) return;
    const endpoint = getCreateNoteEndpoint();
    if (!endpoint) return;
    try {
      const noteData: any = {
        name: userName,
        description: newNote.description.trim(),
      };
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(noteData),
      });
      if (response.ok) {
        setNewNote({ name: '', description: '' });
        setAlert({
          open: true,
          message: 'Note added successfully!',
          severity: 'success',
        });
        fetchNotes();
      } else {
        setAlert({
          open: true,
          message: 'Failed to create note',
          severity: 'error',
        });
      }
    } catch (error) {
      setAlert({
        open: true,
        message: 'Error creating note',
        severity: 'error',
      });
    }
  };

  const updateNote = async (noteId: number) => {
    if (!editForm.description.trim()) return;
    const endpoint = getUpdateNoteEndpoint(noteId);
    if (!endpoint) return;
    try {
      const noteData: any = {
        noteId: noteId,
        name: editForm.name,
        description: editForm.description.trim(),
      };
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(noteData),
      });
      if (response.ok) {
        const updatedNote = await response.json();
        setNotes((prev) =>
          prev.map((note) => (note.id === noteId ? updatedNote : note))
        );
        setEditingNote(null);
        setEditForm({ name: '', description: '' });
        setAlert({
          open: true,
          message: 'Note updated successfully!',
          severity: 'success',
        });
        fetchNotes();
      } else {
        setAlert({
          open: true,
          message: 'Failed to update note',
          severity: 'error',
        });
      }
    } catch (error) {
      setAlert({
        open: true,
        message: 'Error updating note',
        severity: 'error',
      });
    }
  };

  const deleteNote = async (noteId: number) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }
    const endpoint = getDeleteNoteEndpoint(noteId);
    if (!endpoint) return;
    try {
      const response = await fetch(endpoint, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.ok) {
        setNotes((prev) => prev.filter((note) => note.id !== noteId));
        setAlert({
          open: true,
          message: 'Note deleted successfully!',
          severity: 'success',
        });
      } else {
        setAlert({
          open: true,
          message: 'Failed to delete note',
          severity: 'error',
        });
      }
    } catch (error) {
      setAlert({
        open: true,
        message: 'Error deleting note',
        severity: 'error',
      });
    }
  };

  const startEditing = (note: Note) => {
    setEditingNote(note.id);
    setEditForm({ name: note.name, description: note.description });
  };

  const cancelEditing = () => {
    setEditingNote(null);
    setEditForm({ name: '', description: '' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCloseAlert = () => {
    setAlert((prev) => ({ ...prev, open: false }));
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { height: '80vh' },
        }}
      >
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">{title}</Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Create new note */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Write your note here..."
                  value={newNote.description}
                  onChange={(e) =>
                    setNewNote((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  onKeyPress={(e) => {
                    if (
                      e.key === 'Enter' &&
                      e.ctrlKey &&
                      newNote.description.trim()
                    ) {
                      createNote();
                    }
                  }}
                />
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={createNote}
                disabled={!newNote.description.trim()}
                sx={{ minWidth: 'fit-content' }}
              >
                Add Note
              </Button>
            </Box>

            <Divider />

            {/* Notes list */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : notes.length === 0 ? (
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  No notes yet. Create your first note above!
                </Typography>
              </Box>
            ) : (
              <List sx={{ width: '100%' }}>
                {notes.map((note) => (
                  <ListItem
                    key={note.id}
                    sx={{
                      flexDirection: 'column',
                      alignItems: 'stretch',
                      border: '1px solid #e0e0e0',
                      borderRadius: 1,
                      mb: 1,
                      p: 2,
                    }}
                  >
                    {editingNote === note.id ? (
                      <Box sx={{ width: '100%' }}>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          placeholder="Note content..."
                          value={editForm.description}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          sx={{ mb: 1 }}
                        />
                        <Box
                          sx={{
                            display: 'flex',
                            gap: 1,
                            justifyContent: 'flex-end',
                          }}
                        >
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<CancelIcon />}
                            onClick={cancelEditing}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<SaveIcon />}
                            onClick={() => updateNote(note.id)}
                            disabled={!editForm.description.trim()}
                          >
                            Save
                          </Button>
                        </Box>
                      </Box>
                    ) : (
                      <Box sx={{ width: '100%' }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            mb: 1,
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 'medium' }}
                          >
                            {note.name || 'Untitled Note'}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <IconButton
                              size="small"
                              onClick={() => startEditing(note)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => deleteNote(note.id)}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                        {note.description && (
                          <Typography
                            variant="body2"
                            sx={{ mb: 1, whiteSpace: 'pre-wrap' }}
                          >
                            {note.description}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          Created: {formatDate(note.createdAt)}
                          {note.updatedAt !== note.createdAt && (
                            <span>
                              {' '}
                              • Updated: {formatDate(note.updatedAt)}
                            </span>
                          )}
                        </Typography>
                      </Box>
                    )}
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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

export default NotesModal;
