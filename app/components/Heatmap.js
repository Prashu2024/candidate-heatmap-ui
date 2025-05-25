
'use client';
import HeatmapCell from './HeatmapCell';
import styles from '../styles/Heatmap.module.css';

// const NUM_EMPTY_GRID_ROWS = 15; // No longer needed for this specific empty state

export default function Heatmap({
  allAvailableCandidates, 
  displayedSkills,    
  candidateScores,  
  isLoading,    
  isInitializing   
}) {

  // Show a global loading state if still initializing the basic structure
  if (isInitializing && (!allAvailableCandidates || allAvailableCandidates.length === 0 || !displayedSkills)) {
    return (
      <div className={`${styles.heatmapContainer} ${styles.loadingState}`}>
        <p>Loading candidate and skill structure...</p>
      </div>
    );
  }

  // If we have candidates for columns but no skills for rows yet (e.g., first user skill fetch failed)
  if (allAvailableCandidates.length > 0 && displayedSkills.length === 0 && !isInitializing) {
    return (
        <div className={`${styles.heatmapContainer} ${styles.emptyState}`}>
            <p className={styles.emptyStateMessage}>No skills to display. Try adding a candidate or check data.</p>
            {/* Optionally, still render the candidate headers */}
             <div className={styles.scrollableTable}>
                <table className={styles.heatmapTable}>
                    <thead>
                        <tr>
                            <th className={styles.skillNameHeader}>Skill</th>
                            {allAvailableCandidates.map(candidate => (
                                <th key={candidate.id} className={styles.candidateHeader}>
                                    {candidate.name ? candidate.name.split(' ').map(n => n[0]).join('.').toUpperCase() + '.' : `ID ${candidate.id}`}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan={allAvailableCandidates.length + 1} style={{textAlign: 'center', padding: '20px', color: '#777'}}>
                                Skill list is currently empty.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
  }


  // If no candidates are available at all (e.g., /people API failed or returned empty)
  if (allAvailableCandidates.length === 0 && !isInitializing) {
      return (
          <div className={`${styles.heatmapContainer} ${styles.emptyState}`}>
              <p className={styles.emptyStateMessage}>No candidates available to display.</p>
          </div>
      );
  }


  return (
    <div className={`${styles.heatmapContainer} ${styles.scrollableTable}`}>
      {isLoading && !isInitializing && <div className={styles.heatmapLoadingOverlay}><p>Updating scores...</p></div>}
      <table className={styles.heatmapTable}>
        <thead>
          <tr>
            <th className={styles.skillNameHeader}>Skill</th>
            {allAvailableCandidates.map(candidate => (
              <th key={candidate.id} className={styles.candidateHeader}>
                {candidate.name ? candidate.name.split(' ').map(n => n[0]).join('.').toUpperCase() + '.' : `ID ${candidate.id}`}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayedSkills.map(skillName => (
            <tr key={skillName}>
              <td className={styles.skillName}>{skillName}</td>
              {allAvailableCandidates.map(candidate => (
                <HeatmapCell
                  key={`${candidate.id}-${skillName}`}
                  // Get score from candidateScores if that candidate's details are loaded
                  value={candidateScores[candidate.id]?.[skillName]}
                />
              ))}
            </tr>
          ))}
          {/* Message if skills are displayed but no candidates available (should not happen if logic is correct) */}
          {displayedSkills.length > 0 && allAvailableCandidates.length === 0 && (
             <tr>
                <td colSpan={1} className={styles.skillName}>Error</td>
                <td>No candidate columns to display.</td>
             </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}