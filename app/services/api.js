const BASE_URL = 'https://forinterview.onrender.com';

export const fetchUsers = async () => {
  const response = await fetch(`${BASE_URL}/people`);
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Failed to fetch users: ${response.statusText}. Details: ${errorData}`);
  }
  return response.json();
};

export const fetchUserDetails = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }
  const response = await fetch(`${BASE_URL}/people/${userId}`);
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Failed to fetch details for user ${userId}: ${response.statusText}. Details: ${errorData}`);
  }
  return response.json();
};

export const fetchResume = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }
    const response = await fetch(`${BASE_URL}/resume/${userId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch resume for user ${userId}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching resume for ${userId}:`, error);
    throw error;
  }
};
