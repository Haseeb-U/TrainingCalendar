// Authentication utility functions
function logout() {
  // Clear the authentication token
  localStorage.removeItem('authToken');
  sessionStorage.removeItem('authToken');
  
  // Redirect to homepage
  window.location.href = 'homepage.html';
}

function isAuthenticated() {
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  return !!token;
}

function getAuthToken() {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
}

// Check if user is authenticated and redirect if not
function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = 'homepage.html';
    return false;
  }
  return true;
}

// Check token validity by making a test API call
async function verifyTokenValidity() {
  const token = getAuthToken();
  if (!token) {
    return false;
  }

  try {
    const response = await fetch('/api/users/profile', {
      method: 'GET',
      headers: {
        'x-auth-token': token
      }
    });

    if (response.status === 401) {
      // Token is invalid or expired
      logout();
      return false;
    }

    return response.ok;
  } catch (error) {
    console.error('Error verifying token:', error);
    return false;
  }
}

// Handle 401 responses in fetch calls
function handleAuthResponse(response) {
  if (response.status === 401) {
    logout();
    throw new Error('Authentication required');
  }
  return response;
}

// Enhanced fetch function that automatically handles auth
async function authenticatedFetch(url, options = {}) {
  const token = getAuthToken();
  
  if (!token) {
    logout();
    throw new Error('No authentication token found');
  }

  const defaultHeaders = {
    'x-auth-token': token,
    'Content-Type': 'application/json'
  };

  const finalOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };

  try {
    const response = await fetch(url, finalOptions);
    return handleAuthResponse(response);
  } catch (error) {
    console.error('Authenticated fetch error:', error);
    throw error;
  }
}
