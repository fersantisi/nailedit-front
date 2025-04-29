import React from 'react';
import { useNavigate } from 'react-router-dom';

interface DeleteTaskProps {
  projectId: string | undefined;
  goalId: number;
  taskId: number;
}

const DeleteTask: React.FC<DeleteTaskProps> = ({ projectId, taskId, goalId }) => {
  const navigate = useNavigate();
  const handleDelete = () => {
    fetch(
      `${import.meta.env.VITE_SERVER_URL}/project/${projectId}/goal/${goalId}/task/${taskId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      }
    );
    navigate(`/project/${projectId}`);
  };

  return (
    <button onClick={handleDelete} style={{ color: 'text.primary' }}>
      Delete Task
    </button>
  );
};

export default DeleteTask;
