export const formatDate = (dateString: string) => {
  if (!dateString) return 'No due date';

  // Parse the date string as-is without timezone conversion
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day); // month is 0-indexed in JS Date

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  if (diffDays < 0) {
    return `${formattedDate} (Overdue)`;
  } else if (diffDays === 0) {
    return `${formattedDate} (Today)`;
  } else if (diffDays === 1) {
    return `${formattedDate} (Tomorrow)`;
  } else if (diffDays <= 7) {
    return `${formattedDate} (${diffDays} days)`;
  } else {
    return formattedDate;
  }
};

export const getPriorityColor = (label: string) => {
  switch (label.toLowerCase()) {
    case 'high':
    case 'urgent':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'success';
    default:
      return 'default';
  }
};
