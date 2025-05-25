'use client';
import styles from '../styles/UserList.module.css';

export default function UserList({ users, onAddCandidate, selectedCandidateIds, isLoading }) {
  if (isLoading && users.length === 0) {
    return <div className={styles.userListContainer}><p>Loading users...</p></div>;
  }

  // Even if not loading, if no users, show a message
  if (!isLoading && users.length === 0) {
    return <div className={styles.userListContainer}><p>No users found.</p></div>;
  }

  return (
    <div className={styles.userListContainer}>
      <h3 className={styles.title}>Most recommended</h3>
      <p className={styles.recommendationNote}>
        Recommendations are based on your skill requirements and candidate's performance.
      </p>
      <ul className={styles.list}>
        {users.map(user => (
          <li key={user.id || user.name} className={styles.listItem}>
            <span>{user.name || `Candidate ${user.id}`}</span>
            <button
              onClick={() => onAddCandidate(user.id)}
              // selectedCandidateIds is now an array of IDs for whom details are loaded
              disabled={selectedCandidateIds.includes(user.id)}
              className={styles.addButton}
              title={selectedCandidateIds.includes(user.id) ? "Scores Loaded" : "Load scores to compare"}
            >
              {selectedCandidateIds.includes(user.id) ? '✓' : '+'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}