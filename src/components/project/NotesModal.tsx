import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
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
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface NotesModalProps {
  open: boolean;
  onClose: () => void;
  entityType: 'goal' | 'task';
  entityId: number;
  entityName: string;
  projectId: string;
  goalId?: number; // Required for tasks
}

export const NotesModal: React.FC<NotesModalProps> = ({
  open,
  onClose,
  entityType,
  entityId,
  entityName,
  projectId,
  goalId,
}) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editContent, setEditContent] = useState('');
  const [alert, setAlert] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const getNotesEndpoint = () => {
    if (entityType === 'goal') {
      return `${import.meta.env.VITE_SERVER_URL}/project/${projectId}/goal/${entityId}/notes`;
    } else {
      return `${import.meta.env.VITE_SERVER_URL}/project/${projectId}/goal/${goalId}/task/${entityId}/notes`;
    }
  };

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await fetch(getNotesEndpoint(), {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setNotes(data);
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
    if (open) {
      fetchNotes();
    }
  }, [open, entityId]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      const response = await fetch(getNotesEndpoint(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ content: newNote.trim() }),
      });

      if (response.ok) {
        const addedNote = await response.json();
        setNotes((prev) => [...prev, addedNote]);
        setNewNote('');
        setAlert({
          open: true,
          message: 'Note added successfully!',
          severity: 'success',
        });
      } else {
        throw new Error('Failed to add note');
      }
    } catch (error) {
      setAlert({
        open: true,
        message: 'Failed to add note',
        severity: 'error',
      });
    }
  };

  const handleEditNote = async () => {
    if (!editingNote || !editContent.trim()) return;

    try {
      const response = await fetch(`${getNotesEndpoint()}/${editingNote.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ content: editContent.trim() }),
      });

      if (response.ok) {
        const updatedNote = await response.json();
        setNotes((prev) =>
          prev.map((note) => (note.id === editingNote.id ? updatedNote : note))
        );
        setEditingNote(null);
        setEditContent('');
        setAlert({
          open: true,
          message: 'Note updated successfully!',
          severity: 'success',
        });
      } else {
        throw new Error('Failed to update note');
      }
    } catch (error) {
      setAlert({
        open: true,
        message: 'Failed to update note',
        severity: 'error',
      });
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      const response = await fetch(`${getNotesEndpoint()}/${noteId}`, {
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
        throw new Error('Failed to delete note');
      }
    } catch (error) {
      setAlert({
        open: true,
        message: 'Failed to delete note',
        severity: 'error',
      });
    }
  };

  const startEditing = (note: Note) => {
    setEditingNote(note);
    setEditContent(note.content);
  };

  const cancelEditing = () => {
    setEditingNote(null);
    setEditContent('');
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
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h6">
              Notes for {entityType}: {entityName}
            </Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          {/* Add new note */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              placeholder="Add a new note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleAddNote();
                }
              }}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddNote}
              disabled={!newNote.trim()}
              sx={{ minWidth: 'fit-content' }}
            >
              Add
            </Button>
          </Box>

          {/* Notes list */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : notes.length > 0 ? (
              <List>
                {notes.map((note) => (
                  <ListItem
                    key={note.id}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                      flexDirection: 'column',
                      alignItems: 'stretch',
                    }}
                  >
                    {editingNote?.id === note.id ? (
                      <Box sx={{ width: '100%' }}>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
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
                            size="small"
                            startIcon={<SaveIcon />}
                            onClick={handleEditNote}
                            disabled={!editContent.trim()}
                          >
                            Save
                          </Button>
                          <Button
                            size="small"
                            startIcon={<CancelIcon />}
                            onClick={cancelEditing}
                          >
                            Cancel
                          </Button>
                        </Box>
                      </Box>
                    ) : (
                      <>
                        <ListItemText
                          primary={
                            <Typography
                              variant="body1"
                              sx={{ whiteSpace: 'pre-wrap' }}
                            >
                              {note.content}
                            </Typography>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                              <Chip
                                label={`Created: ${formatDate(note.createdAt)}`}
                                size="small"
                                variant="outlined"
                              />
                              {note.updatedAt !== note.createdAt && (
                                <Chip
                                  label={`Updated: ${formatDate(note.updatedAt)}`}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <IconButton
                              size="small"
                              onClick={() => startEditing(note)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteNote(note.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </ListItemSecondaryAction>
                      </>
                    )}
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  No notes yet. Add your first note!
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

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
