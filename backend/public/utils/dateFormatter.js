// Date formatting utility for consistent date display across the application
// Formats dates in d/Mon/yyyy format (e.g., 1/Jan/2025)

function formatDateConsistent(dateString) {
  if (!dateString) return '';
  
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';
  
  const day = d.getDate(); // No padding with zero
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { formatDateConsistent };
}
