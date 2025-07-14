import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Snackbar,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Description as FileIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Archive as ArchiveIcon,
  VideoFile as VideoIcon,
  AudioFile as AudioIcon,
  Folder as FolderIcon,
} from '@mui/icons-material';

interface ProjectFilesSectionProps {
  projectId: string;
}

interface ProjectFile {
  id: number;
  projectId: number;
  filename: string;
  path: string;
  type: string;
  created_at: string;
  updatedAt: string;
}

export const ProjectFilesSection: React.FC<ProjectFilesSectionProps> = ({
  projectId,
}) => {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<ProjectFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const API_BASE_URL = import.meta.env.VITE_SERVER_URL;

  useEffect(() => {
    fetchFiles();
  }, [projectId]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/project/${projectId}/files`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      } else {
        showSnackbar('Error fetching files', 'error');
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      showSnackbar('Error fetching files', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (e.g., max 10MB)
    const maxSizeInMB = 10;
    if (file.size > maxSizeInMB * 1024 * 1024) {
      showSnackbar(`File size must be less than ${maxSizeInMB}MB`, 'error');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      setUploadProgress(0);

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded * 100) / e.total);
          setUploadProgress(progress);
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          fetchFiles();
          showSnackbar('File uploaded successfully', 'success');
        } else {
          showSnackbar('Error uploading file', 'error');
        }
        setUploading(false);
        setUploadProgress(0);
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        showSnackbar('Error uploading file', 'error');
        setUploading(false);
        setUploadProgress(0);
      });

      xhr.open('POST', `${API_BASE_URL}/project/${projectId}/upload`);
      xhr.withCredentials = true;
      xhr.send(formData);
    } catch (error) {
      console.error('Error uploading file:', error);
      showSnackbar('Error uploading file', 'error');
      setUploading(false);
      setUploadProgress(0);
    }

    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownload = async (file: ProjectFile) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/project/${projectId}/files/${file.id}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            Accept: '*/*',
          },
        }
      );

      if (response.ok) {
        // Ensure we get the response as a proper blob with correct MIME type
        const contentType =
          response.headers.get('content-type') ||
          file.type ||
          'application/octet-stream';
        console.log('Download response headers:', {
          contentType,
          contentLength: response.headers.get('content-length'),
          contentDisposition: response.headers.get('content-disposition'),
        });

        // Get the response as arrayBuffer to ensure binary data integrity
        const arrayBuffer = await response.arrayBuffer();
        console.log('Downloaded file size:', arrayBuffer.byteLength, 'bytes');

        // Create blob with explicit MIME type
        const blob = new Blob([arrayBuffer], { type: contentType });

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.filename;
        a.style.display = 'none';

        // Trigger download
        document.body.appendChild(a);
        a.click();

        // Cleanup
        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 100);

        showSnackbar('File downloaded successfully', 'success');
      } else {
        console.error('Download failed with status:', response.status);
        showSnackbar('Error downloading file', 'error');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      showSnackbar('Error downloading file', 'error');
    }
  };

  const handleDeleteFile = async () => {
    if (!fileToDelete) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/project/${projectId}/files/${fileToDelete.id}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      if (response.ok) {
        await fetchFiles();
        showSnackbar('File deleted successfully', 'success');
      } else {
        showSnackbar('Error deleting file', 'error');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      showSnackbar('Error deleting file', 'error');
    } finally {
      setDeleteDialogOpen(false);
      setFileToDelete(null);
    }
  };

  const openDeleteDialog = (file: ProjectFile) => {
    setFileToDelete(file);
    setDeleteDialogOpen(true);
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const getFileIcon = (mimeType: string | undefined | null) => {
    if (!mimeType) return <FileIcon />;

    if (mimeType.startsWith('image/')) return <ImageIcon />;
    if (mimeType === 'application/pdf') return <PdfIcon />;
    if (mimeType.startsWith('video/')) return <VideoIcon />;
    if (mimeType.startsWith('audio/')) return <AudioIcon />;
    if (
      mimeType.includes('zip') ||
      mimeType.includes('rar') ||
      mimeType.includes('archive')
    )
      return <ArchiveIcon />;
    return <FileIcon />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  if (loading) {
    return (
      <Card
        sx={{
          backgroundColor: '#4c4a52',
          mb: 3,
          width: '100%',
          maxWidth: '1200px',
          mx: 'auto',
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Typography variant="h6" sx={{ color: '#e2e2e2' }}>
            Loading project files...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card
        sx={{
          backgroundColor: '#4c4a52',
          mb: 3,
          width: '100%',
          maxWidth: '1200px',
          mx: 'auto',
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FolderIcon sx={{ color: '#79799a' }} />
              <Typography variant="h6" sx={{ color: '#e2e2e2' }}>
                Project Files
              </Typography>
              <Chip
                label={`${files.length} file${files.length !== 1 ? 's' : ''}`}
                size="small"
                sx={{
                  backgroundColor: '#79799a30',
                  color: '#e2e2e2',
                  border: '1px solid #79799a',
                }}
              />
            </Box>
            <Box>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                disabled={uploading}
              />
              <Button
                variant="contained"
                color="primary"
                startIcon={<UploadIcon />}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                Upload File
              </Button>
            </Box>
          </Box>

          {uploading && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ color: '#b0b0b0', mb: 1 }}>
                Uploading... {uploadProgress}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={uploadProgress}
                sx={{
                  backgroundColor: '#2e2e2e',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#1976d2',
                  },
                }}
              />
            </Box>
          )}

          {files.length === 0 ? (
            <Typography
              variant="body1"
              sx={{ color: '#b0b0b0', textAlign: 'center', py: 3 }}
            >
              No files uploaded to this project yet.
            </Typography>
          ) : (
            <TableContainer
              component={Paper}
              sx={{
                backgroundColor: '#2e2e2e',
                width: '100%',
                overflowX: 'auto',
              }}
            >
              <Table size="small" sx={{ width: '100%', minWidth: 500 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#e2e2e2', fontWeight: 'bold' }}>
                      File
                    </TableCell>
                    <TableCell sx={{ color: '#e2e2e2', fontWeight: 'bold' }}>
                      Size
                    </TableCell>
                    <TableCell sx={{ color: '#e2e2e2', fontWeight: 'bold' }}>
                      Type
                    </TableCell>
                    <TableCell sx={{ color: '#e2e2e2', fontWeight: 'bold' }}>
                      Uploaded
                    </TableCell>
                    <TableCell sx={{ color: '#e2e2e2', fontWeight: 'bold' }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {files.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell sx={{ color: '#e2e2e2' }}>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          {getFileIcon(file.type)}
                          <Typography variant="body2">
                            {file.filename}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: '#e2e2e2' }}>Unknown</TableCell>
                      <TableCell sx={{ color: '#e2e2e2' }}>
                        <Chip
                          label={
                            file.type?.split('/')[1]?.toUpperCase() || 'FILE'
                          }
                          size="small"
                          sx={{
                            backgroundColor: '#79799a20',
                            color: '#e2e2e2',
                            fontSize: '0.7rem',
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#e2e2e2' }}>
                        {formatDate(file.created_at)}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Download">
                          <IconButton
                            onClick={() => handleDownload(file)}
                            sx={{ color: '#4caf50' }}
                            size="small"
                          >
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            onClick={() => openDeleteDialog(file)}
                            sx={{ color: '#f44336' }}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: '#4c4a52', color: '#e2e2e2' }}>
          Confirm File Deletion
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: '#4c4a52', pt: 2 }}>
          {fileToDelete && (
            <Typography variant="body1" sx={{ color: '#e2e2e2' }}>
              Are you sure you want to delete "{fileToDelete.filename}"? This
              action cannot be undone.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ backgroundColor: '#4c4a52', p: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ color: '#e2e2e2' }}
          >
            Cancel
          </Button>
          <Button onClick={handleDeleteFile} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};
