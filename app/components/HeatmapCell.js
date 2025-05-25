'use client';
import styles from '../styles/Heatmap.module.css';

// Updated getSkillColor function for scores 0, 1, 2, 3
function getSkillColor(value) {
  const val = parseInt(value, 10);

  if (isNaN(val) || value === null || value === undefined) {
    return styles.colorScoreDefault; // A default very pale color for missing/invalid scores
  }

  switch (val) {
    case 0:
      return styles.colorScore0; // #ecfff1
    case 1:
      return styles.colorScore1; // #a6d96a
    case 2:
      return styles.colorScore2; // #1a9641
    case 3:
      return styles.colorScore3; // #003f0b
    default:
      // If score is something else (e.g., negative, or > 3), use the default
      return styles.colorScoreDefault;
  }
}

export default function HeatmapCell({ value }) {
  const colorClass = getSkillColor(value);

  return (
    <td className={`${styles.heatmapCell} ${colorClass}`}>
      {/* Content is visual (color) */}
    </td>
  );
}