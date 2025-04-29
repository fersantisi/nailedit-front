import React from 'react';
import { useNavigate } from 'react-router-dom';

interface DeleteGoalProps {
  projectId: string | undefined;
  goalId: number;
}

const DeleteGoal: React.FC<DeleteGoalProps> = ({ projectId, goalId }) => {
  const navigate = useNavigate();
  const handleDelete = () => {
    fetch(
      `${import.meta.env.VITE_SERVER_URL}/project/${projectId}/goal/${goalId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      }
    )
    navigate(`/project/${projectId}`);
  };

  return (
    <button onClick={handleDelete} style={{ color: 'text.primary' }}>
      Delete Goal
    </button>
  );
};

export default DeleteGoal;