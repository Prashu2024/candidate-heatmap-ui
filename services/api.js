
const API_BASE_URL = 'https://forinterview.onrender.com';

export async function getPeople() {
  const response = await fetch(`${API_BASE_URL}/people`);
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Failed to fetch people: ${response.statusText}. Details: ${errorData}`);
  }
  return response.json();
}

export async function getPersonDetails(personId) {
  const response = await fetch(`${API_BASE_URL}/people/${personId}`);
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Failed to fetch details for person ${personId}: ${response.statusText}. Details: ${errorData}`);
  }
  return response.json();
}