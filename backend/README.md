# Training Calendar Backend API Documentation

This document provides step-by-step instructions for frontend developers on how to use all the API routes available in the Training Calendar backend.

## Table of Contents
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Authentication](#authentication)
- [User Routes](#user-routes)
- [Error Handling](#error-handling)
- [Example Usage](#example-usage)

## Getting Started

### Base URL
```
Development: http://localhost:5000
Production: Use relative URLs (/api/...)
```

### Headers Required
For protected routes, include the JWT token in headers:
```javascript
headers: {
  'Content-Type': 'application/json',
  'x-auth-token': 'your-jwt-token-here'
}
```

## Configuration

### Recommended Approach
Use relative URLs for API calls when your frontend and backend are served from the same domain:

```javascript
// Good - works in all environments
fetch('/api/users/login')

// Avoid - hardcoded URLs
fetch('http://localhost:5000/api/users/login')
```

## Authentication

### How JWT Works
1. Register or login to get a JWT token
2. Store the token (localStorage/sessionStorage)
3. Include the token in the `x-auth-token` header for protected routes
4. Token expires in 1 hour

## User Routes

### 1. User Registration
**Endpoint:** `POST /api/users/register`  
**Access:** Public  
**Purpose:** Create a new user account

**Request Body:**
```javascript
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Example JavaScript Code:**
```javascript
async function registerUser(name, email, password) {
  try {
    const response = await fetch('/api/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name,
        email: email,
        password: password
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('Success:', data.msg);
      // Registration successful
      return { success: true, message: data.msg };
    } else {
      console.log('Error:', data.errors);
      // Handle validation errors
      return { success: false, errors: data.errors };
    }
  } catch (error) {
    console.error('Network error:', error);
    return { success: false, error: 'Network error occurred' };
  }
}

// Usage
registerUser('John Doe', 'john@example.com', 'password123');
```

**Validation Rules:**
- Name: Required, cannot be empty
- Email: Must be a valid email format
- Password: Minimum 8 characters

**Success Response (201):**
```javascript
{
  "msg": "User registered successfully"
}
```

**Error Response (400):**
```javascript
{
  "errors": [
    {
      "msg": "Name is required"
    }
  ]
}
```

### 2. User Login
**Endpoint:** `POST /api/users/login`  
**Access:** Public  
**Purpose:** Authenticate user and get JWT token

**Request Body:**
```javascript
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Example JavaScript Code:**
```javascript
async function loginUser(email, password) {
  try {
    const response = await fetch('/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      // Store token for future requests
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userName', data.user.name);
      
      console.log('Login successful:', data.user.name);
      return { success: true, token: data.token, user: data.user };
    } else {
      console.log('Login failed:', data.errors);
      return { success: false, errors: data.errors };
    }
  } catch (error) {
    console.error('Network error:', error);
    return { success: false, error: 'Network error occurred' };
  }
}

// Usage
loginUser('john@example.com', 'password123');
```

**Success Response (200):**
```javascript
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "name": "John Doe"
  }
}
```

**Error Response (400):**
```javascript
{
  "errors": [
    {
      "msg": "Invalid Credentials"
    }
  ]
}
```

### 3. Change Password
**Endpoint:** `PATCH /api/users/change-password`  
**Access:** Private (requires JWT token)  
**Purpose:** Change user's current password

**Request Body:**
```javascript
{
  "password": "oldpassword123",
  "newPassword": "newpassword456"
}
```

**Example JavaScript Code:**
```javascript
async function changePassword(currentPassword, newPassword) {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      return { success: false, error: 'No authentication token found' };
    }

    const response = await fetch('/api/users/change-password', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify({
        password: currentPassword,
        newPassword: newPassword
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('Password changed successfully');
      return { success: true, message: data.msg };
    } else {
      console.log('Password change failed:', data.errors);
      return { success: false, errors: data.errors };
    }
  } catch (error) {
    console.error('Network error:', error);
    return { success: false, error: 'Network error occurred' };
  }
}

// Usage
changePassword('oldpassword123', 'newpassword456');
```

**Validation Rules:**
- Current password: Required
- New password: Minimum 8 characters

**Success Response (200):**
```javascript
{
  "msg": "Password changed successfully"
}
```

**Error Responses:**
- **401 Unauthorized:** Token missing or invalid
- **400 Bad Request:** Invalid credentials or validation errors

## Error Handling

### Common Error Status Codes
- **400 Bad Request:** Validation errors or invalid data
- **401 Unauthorized:** Missing or invalid authentication token
- **403 Forbidden:** Access denied
- **404 Not Found:** Resource not found
- **500 Internal Server Error:** Server error

### Example Error Handler
```javascript
function handleApiError(response, data) {
  switch (response.status) {
    case 400:
      console.log('Validation errors:', data.errors);
      return 'Please check your input data';
    case 401:
      console.log('Authentication error:', data.error);
      localStorage.removeItem('authToken');
      window.location.href = '/login';
      return 'Please log in again';
    case 403:
      console.log('Access denied:', data.msg);
      return 'You do not have permission to perform this action';
    case 404:
      console.log('Not found:', data.msg);
      return 'Resource not found';
    case 500:
      console.log('Server error');
      return 'Server error occurred. Please try again later';
    default:
      return 'An unexpected error occurred';
  }
}
```

## Example Usage

### Complete Login Flow
```javascript
// Login form handler
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  const result = await loginUser(email, password);
  
  if (result.success) {
    // Redirect to dashboard
    window.location.href = '/dashboard';
  } else {
    // Display error messages
    displayErrors(result.errors || [result.error]);
  }
});

function displayErrors(errors) {
  const errorDiv = document.getElementById('errors');
  errorDiv.innerHTML = '';
  
  errors.forEach(error => {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = error.msg || error;
    errorDiv.appendChild(errorElement);
  });
}
```



## Notes for Frontend Developers

1. **Use relative URLs** when possible - they work across all environments without modification.

2. **Always validate input on the frontend** before sending requests to reduce server load and improve user experience.

3. **Store JWT tokens securely** - consider using httpOnly cookies for better security in production.

4. **Handle token expiration** - tokens expire in 1 hour. Implement automatic refresh or redirect to login.

5. **Implement loading states** - API calls may take time, show loading indicators to users.

6. **Handle network errors gracefully** - Always wrap API calls in try-catch blocks and provide meaningful error messages to users.

7. **Environment configuration** - Use environment variables only when frontend and backend are on different domains.