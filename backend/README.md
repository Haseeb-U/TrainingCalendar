# Training Calendar Frontend Developer Guide

Welcome! This guide will help you set up the frontend for the Training Calendar project and connect it to the backend services. No backend experience is needed.

---

## 1. Where to Put Your Frontend Files

- **All your frontend code (HTML, CSS, JS, React, etc.) should go in a folder named `public/` inside the `backend/` folder.**
- Example structure:
  ```
  TrainingCalendar/
    backend/
      public/
        index.html
        main.js
        styles.css
        ...
      ...
    ...
  ```

---

## 2. How to Run the Backend

1. **Install Node.js** if you don't have it: [Download Node.js](https://nodejs.org/)
2. **Install backend dependencies:**
   - Open a terminal and run:
     ```
     cd backend
     npm install
     ```
3. **Start the backend server:**
   - In the same terminal, run:
     ```
     npm run dev
     ```
   - The backend will run at [http://localhost:5000](http://localhost:5000)

---

## 3. How to Connect Frontend to Backend

- **Use relative URLs** for API calls.  
  Example:
  ```js
  fetch('/api/users/login', { ... })
  ```
- **Do NOT** use hardcoded URLs like `http://localhost:5000/api/...`  
  This ensures your code works in both development and production.

---

## 4. Using Backend Services (API Routes)

Below are the main backend routes you will use, with simple explanations and code examples.

---

### **A. User Routes**

#### 1. Register a New User

- **Endpoint:** `POST /api/users/register`
- **Purpose:** Create a new user account.
- **Request Body:**
  ```json
  {
    "name": "Your Name",
    "email": "your@email.com",
    "password": "yourpassword"
  }
  ```
- **Example:**
  ```js
  fetch('/api/users/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Your Name',
      email: 'your@email.com',
      password: 'yourpassword'
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.msg) alert('Registered!');
    else alert(data.errors[0].msg);
  });
  ```

#### 2. Login

- **Endpoint:** `POST /api/users/login`
- **Purpose:** Authenticate and get a JWT token.
- **Request Body:**
  ```json
  {
    "email": "your@email.com",
    "password": "yourpassword"
  }
  ```
- **Example:**
  ```js
  fetch('/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'your@email.com',
      password: 'yourpassword'
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.token) {
      localStorage.setItem('authToken', data.token);
      alert('Login successful!');
    } else {
      alert(data.errors[0].msg);
    }
  });
  ```

#### 3. Change Password

- **Endpoint:** `PATCH /api/users/change-password`
- **Purpose:** Change your password (must be logged in).
- **Headers:** Add `'x-auth-token': <your token>`
- **Request Body:**
  ```json
  {
    "password": "oldpassword",
    "newPassword": "newpassword"
  }
  ```
- **Example:**
  ```js
  fetch('/api/users/change-password', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': localStorage.getItem('authToken')
    },
    body: JSON.stringify({
      password: 'oldpassword',
      newPassword: 'newpassword'
    })
  })
  .then(res => res.json())
  .then(data => alert(data.msg || data.errors[0].msg));
  ```

---

### **B. Training Routes**

#### 1. Create a Training

- **Endpoint:** `POST /api/trainings/create`
- **Purpose:** Add a new training event (must be logged in).
- **Headers:** `'x-auth-token': <your token>`
- **Request Body:**
  ```json
  {
    "name": "React Basics",
    "duration": 2,
    "number_of_participants": 10,
    "schedule_date": "2025-08-01",
    "venue": "Room 101",
    "training_hours": 4,
    "notification_recipients": "[\"someone@email.com\"]",
    "status": "pending"
  }
  ```
- **Example:**
  ```js
  fetch('/api/trainings/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': localStorage.getItem('authToken')
    },
    body: JSON.stringify({
      name: 'React Basics',
      duration: 2,
      number_of_participants: 10,
      schedule_date: '2025-08-01',
      venue: 'Room 101',
      training_hours: 4,
      notification_recipients: JSON.stringify(['someone@email.com']),
      status: 'pending'
    })
  })
  .then(res => res.json())
  .then(data => alert(data.msg || data.errors[0].msg));
  ```

#### 2. Update a Training

- **Endpoint:** `PATCH /api/trainings/update`
- **Purpose:** Edit an existing training (must be logged in).
- **Headers:** `'x-auth-token': <your token>`
- **Request Body:** Same as create, but add `"training_id": <id>`
- **Example:**
  ```js
  fetch('/api/trainings/update', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': localStorage.getItem('authToken')
    },
    body: JSON.stringify({
      training_id: 1,
      name: 'React Advanced',
      duration: 3,
      number_of_participants: 12,
      schedule_date: '2025-08-02',
      venue: 'Room 102',
      training_hours: 6,
      notification_recipients: JSON.stringify(['another@email.com']),
      status: 'completed'
    })
  })
  .then(res => res.json())
  .then(data => alert(data.msg || data.errors[0].msg));
  ```

#### 3. Delete a Training

- **Endpoint:** `DELETE /api/trainings/:training_id`
- **Purpose:** Remove a training (must be logged in).
- **Headers:** `'x-auth-token': <your token>`
- **Example:**
  ```js
  fetch('/api/trainings/1', {
    method: 'DELETE',
    headers: {
      'x-auth-token': localStorage.getItem('authToken')
    }
  })
  .then(res => res.json())
  .then(data => alert(data.msg || data.errors[0].msg));
  ```

#### 4. Get My Trainings

- **Endpoint:** `GET /api/trainings/my-trainings`
- **Purpose:** List all trainings you created (must be logged in).
- **Headers:** `'x-auth-token': <your token>`
- **Example:**
  ```js
  fetch('/api/trainings/my-trainings', {
    headers: {
      'x-auth-token': localStorage.getItem('authToken')
    }
  })
  .then(res => res.json())
  .then(data => console.log(data));
  ```

#### 5. Update Training Status

- **Endpoint:** `PATCH /api/trainings/status`
- **Purpose:** Change a training's status (pending/completed).
- **Headers:** `'x-auth-token': <your token>`
- **Request Body:**
  ```json
  {
    "training_id": 1,
    "status": "completed"
  }
  ```
- **Example:**
  ```js
  fetch('/api/trainings/status', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': localStorage.getItem('authToken')
    },
    body: JSON.stringify({
      training_id: 1,
      status: 'completed'
    })
  })
  .then(res => res.json())
  .then(data => alert(data.msg || data.errors[0].msg));
  ```

---

### **C. Share Training Data**

- **Endpoint:** `POST /api/trainings/shareTrainingData`
- **Purpose:** Email your training data as a CSV file to any email address.
- **Headers:** `'x-auth-token': <your token>`
- **Request Body:**
  ```json
  {
    "email": "recipient@email.com"
  }
  ```
- **Example:**
  ```js
  fetch('/api/trainings/shareTrainingData', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': localStorage.getItem('authToken')
    },
    body: JSON.stringify({
      email: 'recipient@email.com'
    })
  })
  .then(res => res.json())
  .then(data => alert(data.msg || data.errors[0].msg));
  ```

---

## 5. General Tips

- **Always check responses** for errors and show friendly messages to users.
- **Store the JWT token** (from login) in `localStorage` or `sessionStorage`.
- **Logout:** Remove the token from storage.
- **If you get a 401 error:** The token is missing or expired; ask the user to log in again.
- **Use try-catch** in async functions to handle network errors.

---

## 6. Where to Get More Info

- The backend API documentation is in [backend/README.md](backend/README.md).
- If you need new API features, ask the backend developer.

---

## 7. Summary

- Put all frontend files in the `backend/public/` folder.
- Start the backend before testing your frontend.
- Use relative URLs for all API calls.
- Include the JWT token for protected routes.
- Handle errors gracefully.

Happy coding!