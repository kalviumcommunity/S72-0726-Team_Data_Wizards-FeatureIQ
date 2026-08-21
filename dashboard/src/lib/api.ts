export const fetchUsers = async () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const response = await fetch(`${apiUrl}/api/users`);
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  return response.json();
};

export const fetchActivity = async () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const response = await fetch(`${apiUrl}/api/activity`);
  if (!response.ok) {
    throw new Error('Failed to fetch activity logs');
  }
  return response.json();
};

export const fetchUsage = async () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const response = await fetch(`${apiUrl}/api/usage`);
  if (!response.ok) {
    throw new Error('Failed to fetch feature usage logs');
  }
  return response.json();
};
