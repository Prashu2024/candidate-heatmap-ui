'use client';

import { useState, useEffect } from 'react';
import UserList from './components/UserList';
import Heatmap from './components/Heatmap';
import { getPeople, getPersonDetails } from '../services/api';

import pageStyles from './styles/Page.module.css';
import layoutStyles from './styles/LayoutParts.module.css';

export default function CandidateHeatmapPage() {
  const [allUsers, setAllUsers] = useState([]); // All users from /people
  const [displayedSkills, setDisplayedSkills] = useState([]); // All unique skills for rows
  const [selectedCandidateDetails, setSelectedCandidateDetails] = useState({}); // { userId: skillsMap }

  const [isLoadingUsers, setIsLoadingUsers] = useState(true); // For the initial user list
  const [isLoadingInitialSkills, setIsLoadingInitialSkills] = useState(true); // For fetching skills for rows
  const [isLoadingIndividualDetails, setIsLoadingIndividualDetails] = useState(false); // For a specific clicked user

  const [error, setError] = useState(null);
  const [allUsersCount, setAllUsersCount] = useState(null);

  // Function to parse skills from personDetails
  const parseSkillsFromDetails = (personDetails) => {
    const skillsMap = {};
    const skillNames = new Set();
    const skillsetArray = personDetails.data?.data?.skillset;

    if (skillsetArray && Array.isArray(skillsetArray)) {
      skillsetArray.forEach(skillCategory => {
        if (skillCategory.skills && Array.isArray(skillCategory.skills)) {
          skillCategory.skills.forEach(skillObject => {
            if (skillObject.name && skillObject.pos && Array.isArray(skillObject.pos) && skillObject.pos.length > 0 && skillObject.pos[0].hasOwnProperty('consensus_score')) {
              const skillName = skillObject.name;
              const consensusScore = skillObject.pos[0].consensus_score;
              skillsMap[skillName] = consensusScore;
              skillNames.add(skillName);
            }
          });
        }
      });
    }
    return { skillsMap, skillNames: Array.from(skillNames) };
  };

  // Fetch initial users and then skills from the first user for rows
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoadingUsers(true);
      setIsLoadingInitialSkills(true);
      setError(null);
      try {
        // 1. Fetch all users
        const usersFromApi = await getPeople();
        const mappedUsers = usersFromApi.map(user => ({
          id: user.id,
          name: user.name || `Candidate ${user.id ? user.id.substring(0, 6) : 'N/A'}`
        }));
        setAllUsers(mappedUsers);
        setAllUsersCount(mappedUsers.length);
        setIsLoadingUsers(false);

        // 2. Fetch skills from the first user (if any) to populate initial rows
        if (mappedUsers.length > 0) {
          const firstUserId = mappedUsers[0].id;
          try {
            const personDetails = await getPersonDetails(firstUserId);
            const { skillNames } = parseSkillsFromDetails(personDetails);
            setDisplayedSkills(prev => Array.from(new Set([...prev, ...skillNames])).sort());
          } catch (err) {
            console.warn(`Could not fetch initial skills from user ${firstUserId}:`, err.message);
            // Proceed without initial skills, or set a default list, or show error
          }
        }
      } catch (err) {
        console.error("Error fetching initial user list:", err);
        setError(err.message || 'Failed to load user list.');
        setAllUsersCount(0);
        setIsLoadingUsers(false); // Ensure loading state is off on error
      }
      setIsLoadingInitialSkills(false);
    };
    fetchInitialData();
  }, []);

  const handleAddCandidateToHeatmap = async (userId) => {
    // If details already fetched, no need to re-fetch unless you want to refresh
    if (selectedCandidateDetails[userId]) {
        console.log(`Details for ${userId} already loaded.`);
        return;
    }

    setIsLoadingIndividualDetails(true);
    setError(null); // Clear previous specific error for this action
    try {
      const personDetails = await getPersonDetails(userId);
      const { skillsMap, skillNames: newSkillsFromThisCandidate } = parseSkillsFromDetails(personDetails);

      setSelectedCandidateDetails(prev => ({
        ...prev,
        [userId]: skillsMap
      }));

      // Update displayedSkills if new skills are found
      if (newSkillsFromThisCandidate.length > 0) {
        setDisplayedSkills(prevSkills => {
          const updatedSkillSet = new Set([...prevSkills, ...newSkillsFromThisCandidate]);
          return Array.from(updatedSkillSet).sort();
        });
      }

    } catch (err) {
      console.error(`Error fetching details for user ${userId}:`, err);
      setError(`Failed to load skills for user. ${err.message}`);
      // Optionally remove from selectedCandidateDetails if fetch failed partially
      // setSelectedCandidateDetails(prev => { const newState = {...prev}; delete newState[userId]; return newState; });
    }
    setIsLoadingIndividualDetails(false);
  };

  const isLoadingOverall = isLoadingUsers || isLoadingInitialSkills;

  return (
    <div className={layoutStyles.pageContainer}>
      <header className={layoutStyles.header}>
        <div className={layoutStyles.candidateInfo}>
          <span>{allUsersCount !== null ? `${allUsersCount} Candidates` : 'Loading...'}</span>
          <div className={layoutStyles.navButtons}>
            <button>←</button> <button>→</button>
          </div>
        </div>
      </header>

      <nav className={layoutStyles.tabs}>
        <button className={`${layoutStyles.tabButton} ${layoutStyles.activeTab}`}>Compare View</button>
      </nav>

      <main className={pageStyles.mainContentArea}>
        {error && <p className={pageStyles.error}>Error: {error}</p>}
        <div className={pageStyles.contentWrapper}>
          <UserList
            users={allUsers}
            onAddCandidate={handleAddCandidateToHeatmap} // Renamed for clarity
            // IDs of users whose details are loaded and ready to be shown in heatmap
            selectedCandidateIds={Object.keys(selectedCandidateDetails)}
            isLoading={isLoadingUsers} // UserList is primarily concerned with the list of users
          />
          <Heatmap
            // Pass all available users for columns, displayed skills for rows,
            // and details of selected candidates for cell values.
            allAvailableCandidates={allUsers}
            displayedSkills={displayedSkills}
            candidateScores={selectedCandidateDetails}
            // Heatmap loading state: if users or initial skills are loading,
            // OR if we are fetching for a specific user AFTER initial load.
            isLoading={isLoadingOverall || (isLoadingIndividualDetails && Object.keys(selectedCandidateDetails).length > 0)}
            isInitializing={isLoadingOverall} // Special prop for initial structural loading
          />
        </div>
        {isLoadingOverall && (
            <div className={pageStyles.loadingOverlay}><p>Initializing Candidate Data...</p></div>
        )}
        {isLoadingIndividualDetails && !isLoadingOverall && ( // Show this only when adding subsequent users
            <div className={pageStyles.loadingOverlay}><p>Loading Candidate Skills...</p></div>
        )}
      </main>
    </div>
  );
}