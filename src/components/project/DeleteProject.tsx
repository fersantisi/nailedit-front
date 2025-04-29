import React from 'react';
import { useNavigate } from 'react-router-dom';

interface DeleteProjectProps {
  projectId: string | undefined;
}

const DeleteProject: React.FC<DeleteProjectProps> = ({ projectId }) => {
  const navigate = useNavigate();
  const handleDelete = () => {
    fetch(`${import.meta.env.VITE_SERVER_URL}/project/${projectId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    navigate('/');
  };

  return (
    <button onClick={handleDelete} style={{ color: 'text.primary' }}>
      Delete Project
    </button>
  );
};

export default DeleteProject;
