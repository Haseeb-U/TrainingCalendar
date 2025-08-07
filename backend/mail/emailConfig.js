// Email configuration and constants
const EMAIL_CONFIG = {
  // Company branding
  company: {
    name: 'Training Calendar System',
    tagline: 'Your Gateway to Professional Excellence',
    supportEmail: 'support@trainingcalendar.com',
    website: 'https://trainingcalendar.com',
    logo: '🎓'
  },

  // Color themes for different email types
  themes: {
    welcome: '#48bb78',      // Green
    reminder: '#38b2ac',     // Teal
    notification: '#4c51bf', // Indigo
    report: '#805ad5',       // Purple
    default: '#4a90e2'       // Blue
  },

  // Default settings
  defaults: {
    timezone: 'UTC',
    dateFormat: {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    },
    timeFormat: {
      hour: '2-digit',
      minute: '2-digit'
    }
  },

  // Email priorities
  priorities: {
    high: {
      color: '#e53e3e',
      label: 'HIGH PRIORITY',
      icon: '🚨'
    },
    medium: {
      color: '#dd6b20',
      label: 'MEDIUM PRIORITY',
      icon: '⚠️'
    },
    low: {
      color: '#38a169',
      label: 'LOW PRIORITY',
      icon: '💡'
    }
  },

  // Training status styling
  statusStyles: {
    pending: {
      background: '#fed7d7',
      color: '#c53030',
      icon: '⏳'
    },
    completed: {
      background: '#c6f6d5',
      color: '#2f855a',
      icon: '✅'
    }
  },

  // Email templates metadata
  templates: {
    welcome: {
      title: 'Welcome to Our Training Platform!',
      icon: '🎉',
      priority: 'medium',
      category: 'onboarding'
    },
    training_reminder: {
      title: 'Training Reminder',
      icon: '⏰',
      priority: 'high',
      category: 'reminder'
    },
    new_training_notification: {
      title: 'New Training Scheduled!',
      icon: '🎓',
      priority: 'medium',
      category: 'notification'
    },
    training_data_share: {
      title: 'Training Data Report',
      icon: '📊',
      priority: 'low',
      category: 'report'
    }
  }
};

// Helper functions
const formatDate = (date, options = EMAIL_CONFIG.defaults.dateFormat) => {
  return new Date(date).toLocaleDateString('en-US', options);
};

const formatTime = (date, options = EMAIL_CONFIG.defaults.timeFormat) => {
  return new Date(date).toLocaleTimeString('en-US', options);
};

const formatDateTime = (date) => {
  return `${formatDate(date)} at ${formatTime(date)}`;
};

const getStatusStyle = (status) => {
  return EMAIL_CONFIG.statusStyles[status.toLowerCase()] || EMAIL_CONFIG.statusStyles.pending;
};

const getPriorityStyle = (priority) => {
  return EMAIL_CONFIG.priorities[priority.toLowerCase()] || EMAIL_CONFIG.priorities.medium;
};

const getThemeColor = (templateType) => {
  return EMAIL_CONFIG.themes[templateType] || EMAIL_CONFIG.themes.default;
};

// Email validation helper
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Format recipient list
const formatRecipients = (recipients) => {
  if (Array.isArray(recipients)) {
    return recipients.filter(email => email && validateEmail(email.trim())).join(',');
  }
  if (typeof recipients === 'string') {
    return recipients.split(',')
      .map(email => email.trim())
      .filter(email => validateEmail(email))
      .join(',');
  }
  return '';
};

module.exports = {
  EMAIL_CONFIG,
  formatDate,
  formatTime,
  formatDateTime,
  getStatusStyle,
  getPriorityStyle,
  getThemeColor,
  validateEmail,
  formatRecipients
};
