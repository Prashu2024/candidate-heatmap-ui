
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import UserList from '../components/UserList';
import Heatmap from '../components/Heatmap';
import { getPeople, getPersonDetails } from '../services/api';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [allUsers, setAllUsers] = useState([]); // { id, name }
  const [selectedCandidates, setSelectedCandidates] = useState([]); // { id, name, skills: {...} }
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInitialUsers = async () => {
      setIsLoadingUsers(true);
      setError(null);
      try {
        const usersFromApi = await getPeople();
        // Assuming API returns an array like [{ id: '...', name: '...' }]
        // If name is not directly available, you might need to derive it or use ID.
        setAllUsers(usersFromApi.map(user => ({
            id: user.id, // Ensure your API provides a unique id
            name: user.name || `Candidate ${user.id.substring(0,6)}` // Fallback name
        })));
      } catch (err) {
        console.error("Error in fetchInitialUsers:", err);
        setError(err.message || 'Failed to load user list.');
      }
      setIsLoadingUsers(false);
    };
    fetchInitialUsers();
  }, []);

  const handleAddCandidateToCompare = async (userId) => {
    if (selectedCandidates.find(c => c.id === userId)) return; // Already selected

    const userToAdd = allUsers.find(u => u.id === userId);
    if (!userToAdd) return;

    setIsLoadingDetails(true);
    setError(null);
    try {
      const skillsData = await getPersonDetails(userId);
      // The API for a person is assumed to return their skills directly
      // e.g., { "Creating Wireframes": 70, ... }
      // If it's nested like { "skillset": { ... } }, adjust here: skills = skillsData.skillset;

      const newCandidate = {
        id: userId,
        name: userToAdd.name,
        skills: skillsData // This should be the object of skill:value pairs
      };

      setSelectedCandidates(prev => [...prev, newCandidate]);

    } catch (err) {
      console.error(`Error fetching details for ${userToAdd.name}:`, err);
      setError(`Failed to load skills for ${userToAdd.name}. ${err.message}`);
    }
    setIsLoadingDetails(false);
  };

  return (
    <Layout allUsersCount={isLoadingUsers ? null : allUsers.length}>
      {error && <p className={styles.error}>Error: {error}</p>}
      <div className={styles.contentWrapper}>
        <UserList
          users={allUsers}
          onAddCandidate={handleAddCandidateToCompare}
          selectedCandidateIds={selectedCandidates.map(c => c.id)}
          isLoading={isLoadingUsers}
        />
        <Heatmap
          candidates={selectedCandidates}
          isLoading={isLoadingDetails && selectedCandidates.length === 0}
        />
      </div>
      {(isLoadingUsers || isLoadingDetails) && <div className={styles.loadingOverlay}><p>Loading Data...</p></div>}
    </Layout>
  );
}