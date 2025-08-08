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
        homepage.html
        main.js
        styles.css
        ...
      ...
    ...
  ```

---

## 2. Configure Environment Variables (.env)

Before running the backend, you need to create a `.env` file in the `backend/` folder. This file stores sensitive configuration like database credentials, JWT secret, and email settings.

**Important:**

- You must have a live MySQL database running and accessible with the credentials you provide in the `.env` file **before** starting the backend server. The backend will not work without a working database connection.

### **Step-by-Step Instructions:**

#### **Step 1: Create the .env file**

1. Navigate to the `backend/` folder in your project
2. Create a new file named exactly `.env` (with no filename before the dot)
   - **Windows:** Right-click in the folder → "New" → "Text Document" → Rename to `.env` (remove the .txt extension)
   - **Mac/Linux:** Use terminal: `touch .env` or create via text editor
3. Open the `.env` file in any text editor (VS Code, Notepad, etc.)

#### **Step 2: Add Configuration Variables**

Copy and paste the following template into your `.env` file:

```env
# Database Configuration
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_database_password
MYSQL_DB_NAME=TrainingCalendarDB

# Server Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
PORT=5000

# Email Configuration (Required for notifications and data sharing)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
```

#### **Step 3: Customize Each Variable**

**Database Settings:**
- `MYSQL_HOST`: Usually `localhost` if MySQL is on your computer, or your database server IP
- `MYSQL_USER`: Your MySQL username (default is often `root`)
- `MYSQL_PASSWORD`: Your MySQL password (leave empty if no password: `MYSQL_PASSWORD=`)
- `MYSQL_DB_NAME`: Keep as `TrainingCalendarDB` (the app will create this database automatically)

**Security Settings:**
- `JWT_SECRET`: **CRITICAL!** Create a long, random string (at least 32 characters)
  - Example: `JWT_SECRET=myApp2024SuperSecretKey987654321abcdef`
  - You can generate one at: https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx
- `PORT`: Keep as `5000` unless you need a different port

**Email Settings (Required for email features):**
- `EMAIL_USER`: Your Gmail address (e.g., `john.doe@gmail.com`)
- `EMAIL_PASS`: **NOT your regular Gmail password!** Use an App Password (see below)

#### **Step 4: Set Up Gmail App Password (Important!)**

For email functionality to work, you need a Gmail App Password:

1. **Enable 2-Factor Authentication on your Gmail account:**
   - Go to https://myaccount.google.com/security
   - Turn on "2-Step Verification" if not already enabled

2. **Generate an App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Google will generate a 16-character password like: `abcd efgh ijkl mnop`
   - Use this password (without spaces) in your `.env` file: `EMAIL_PASS=abcdefghijklmnop`

3. **Alternative: Use a different email provider**
   - If you don't want to use Gmail, modify `backend/mail/email.js`
   - Change the `service: 'gmail'` to your provider (Outlook, Yahoo, etc.)

#### **Step 5: Sample Complete .env File**

Here's what your completed `.env` file should look like:

```env
# Database Configuration
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=mySecretDBPassword123
MYSQL_DB_NAME=TrainingCalendarDB

# Server Configuration
JWT_SECRET=myTrainingApp2024SuperSecretJWTKey987654321randomString
PORT=5000

# Email Configuration
EMAIL_USER=john.doe@gmail.com
EMAIL_PASS=abcdefghijklmnop
```

### **Troubleshooting:**

**Database Connection Issues:**
- Make sure MySQL is installed and running
- Test your database credentials using MySQL Workbench or command line
- Check if the port is correct (MySQL default is 3306)

**Email Issues:**
- Verify your App Password is correct (16 characters, no spaces)
- Make sure 2-Factor Authentication is enabled on Gmail
- Check if "Less secure app access" is disabled (you should use App Passwords instead)

**File Not Found Errors:**
- Make sure the `.env` file is in the `backend/` folder, not the root folder
- The file should be named exactly `.env` with no extension
- The file should not be named `.env.txt` or `env`

### **Security Notes:**
- **Never commit your `.env` file to version control (Git)**
- Add `.env` to your `.gitignore` file
- Keep your JWT secret and email password private
- Use different JWT secrets for development and production

---

## 3. How to Run the Backend

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

## 4. How to Connect Frontend to Backend

- **Use relative URLs** for API calls.  
  Example:
  ```js
  fetch('/api/users/login', { ... })
  ```
- **Do NOT** use hardcoded URLs like `http://localhost:5000/api/...`  
  This ensures your code works in both development and production.

---

## 5. Using Backend Services (API Routes)

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
    "employee_no": 12345,
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
      employee_no: 12345, // Must be an integer
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

#### 4. Get My Profile

- **Endpoint:** `GET /api/users/profile`
- **Purpose:** Get your user profile (must be logged in).
- **Headers:** `'x-auth-token': <your token>`
- **Response Example:**
  ```json
  {
    "id": 1,
    "name": "Your Name",
    "email": "your@email.com",
    "employee_no": 12345
  }
  ```
- **Example:**
  ```js
  fetch('/api/users/profile', {
    headers: {
      'x-auth-token': localStorage.getItem('authToken')
    }
  })
  .then(res => res.json())
  .then(data => console.log(data));
  ```

---

### **B. Training Routes**

#### 1. Create a Training

- **Endpoint:** `POST /api/trainings/create`
- **Purpose:** Add a new training event (must be logged in).
- **Headers:** `'x-auth-token': <your token>`
- **Note:** `schedule_date` should be in DATETIME format (YYYY-MM-DD HH:MM:SS) or ISO string format
- **Request Body:**
  ```json
  {
    "name": "React Basics",
    "duration": 2,
    "number_of_participants": 10,
    "schedule_date": "2025-08-01 14:30:00",
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
      schedule_date: '2025-08-01 14:30:00',
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
      schedule_date: '2025-08-02 09:00:00',
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

#### 5. Get Single Training with Files

- **Endpoint:** `GET /api/trainings/:id`
- **Purpose:** Get details of a specific training including associated files.
- **Headers:** `'x-auth-token': <your token>`
- **URL Parameter:** `id` - The training ID
- **Response:** Returns training details with `files` array
- **Example:**
  ```js
  fetch('/api/trainings/1', {
    headers: {
      'x-auth-token': localStorage.getItem('authToken')
    }
  })
  .then(res => res.json())
  .then(data => {
    console.log('Training:', data.name);
    console.log('Files:', data.files);
  });
  ```

#### 6. Update Training Status

- **Endpoint:** `PATCH /api/trainings/status`
- **Purpose:** Change a training's status (pending/completed).
- **Headers:** `'x-auth-token': <your token>`
- **Important:** A training cannot be marked as "completed" unless at least one file has been uploaded for that training.
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
- **Purpose:** Email your training data as a CSV file to any email address, filtered by a date range.
- **Headers:** `'x-auth-token': <your token>`
- **Request Body:**
  ```json
  {
    "email": "recipient@email.com",
    "startDate": "13/Jul/2022",
    "endDate": "20/Jul/2022"
  }
  ```
  - `startDate` and `endDate` must be in `DD/MMM/YYYY` format (e.g., `13/Jul/2022`).
- **Example:**
  ```js
  fetch('/api/trainings/shareTrainingData', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': localStorage.getItem('authToken')
    },
    body: JSON.stringify({
      email: 'recipient@email.com',
      startDate: '13/Jul/2022',
      endDate: '20/Jul/2022'
    })
  })
  .then(res => res.json())
  .then(data => alert(data.msg || data.errors?.[0]?.msg));
  ```

---

### **D. Email Notifications**

#### Automatic Training Reminders

The system automatically sends email reminders for upcoming trainings:

- **When:** Every day at 9:00 AM (server time)
- **Who gets notified:** Recipients specified in the `notification_recipients` field when creating/updating a training
- **What trainings:** Only pending trainings scheduled within the next 2 days
- **Email content:** 
  - Subject: "Upcoming Training: [Training Name]"
  - Body: Reminder with training name and scheduled date
- **Setup Required:** 
  - Configure `EMAIL_USER` and `EMAIL_PASS` in your `.env` file
  - The system uses Gmail by default (you can modify `mail/email.js` for other providers)

**Immediate Notifications:** When creating a training scheduled within the next 2 days, notification emails are sent immediately in addition to the daily reminder schedule.

**Note:** You don't need to call any API for this - it happens automatically. Just make sure to include valid email addresses in the `notification_recipients` array when creating trainings.

---

### **E. File Upload & Management Routes**

#### 1. Upload a File

- **Endpoint:** `POST /api/files/upload`
- **Purpose:** Upload a file for the logged-in user.
- **Headers:** `'x-auth-token': <your token>`
- **Form Data:** Use `multipart/form-data` with fields:
  - `file` (required) - The file to upload
  - `training_id` (required) - The ID of the training this file belongs to
- **Response:** Returns file information including `fileUrl` for accessing the file and `training_id`
- **Example:**
  ```js
  const formData = new FormData();
  formData.append('file', fileInput.files[0]);
  formData.append('training_id', '1'); // Required
  fetch('/api/files/upload', {
    method: 'POST',
    headers: {
      'x-auth-token': localStorage.getItem('authToken')
    },
    body: formData
  })
  .then(res => res.json())
  .then(data => alert(data.msg || data.errors?.[0]?.msg));
  ```

#### 2. Get My Files

- **Endpoint:** `GET /api/files/my-files`
- **Purpose:** List all files uploaded by the logged-in user.
- **Headers:** `'x-auth-token': <your token>`
- **Response:** Returns an array of file objects with `id`, `file_path`, `uploaded_at`, `training_id`, `training_name`, and `fileUrl`
- **Example:**
  ```js
  fetch('/api/files/my-files', {
    headers: {
      'x-auth-token': localStorage.getItem('authToken')
    }
  })
  .then(res => res.json())
  .then(data => console.log(data));
  ```

#### 3. Delete a File

- **Endpoint:** `DELETE /api/files/delete/:fileId`
- **Purpose:** Delete a specific file uploaded by the logged-in user.
- **Headers:** `'x-auth-token': <your token>`
- **URL Parameter:** `fileId` - The ID of the file to delete
- **Example:**
  ```js
  fetch('/api/files/delete/1', {
    method: 'DELETE',
    headers: {
      'x-auth-token': localStorage.getItem('authToken')
    }
  })
  .then(res => res.json())
  .then(data => alert(data.msg || data.errors?.[0]?.msg));
  ```

#### 4. Get Files for Training

- **Endpoint:** `GET /api/files/training/:trainingId`
- **Purpose:** Get all files associated with a specific training.
- **Headers:** `'x-auth-token': <your token>`
- **URL Parameter:** `trainingId` - The ID of the training
- **Response:** Returns training information and array of associated files
- **Example:**
  ```js
  fetch('/api/files/training/1', {
    headers: {
      'x-auth-token': localStorage.getItem('authToken')
    }
  })
  .then(res => res.json())
  .then(data => {
    console.log('Training:', data.training);
    console.log('Files:', data.files);
  });
  ```

---

## 7. General Tips

- **Always check responses** for errors and show friendly messages to users.
- **Store the JWT token** (from login) in `localStorage` or `sessionStorage`.
- **Logout:** Remove the token from storage.
- **If you get a 401 error:** The token is missing or expired; ask the user to log in again.
- **Use try-catch** in async functions to handle network errors.

---

## 8. Where to Get More Info

- The backend API documentation is in [backend/README.md](backend/README.md).
- If you need new API features, ask the backend developer.

---

## 9. Summary

- Put all frontend files in the `backend/public/` folder.
- Start the backend before testing your frontend.
- Use relative URLs for all API calls.
- Include the JWT token for protected routes.
- Handle errors gracefully and provide user-friendly feedback.

---

## Happy Coding! 🚀

This guide should get you started with building your frontend. Remember to test your API calls and handle edge cases appropriately.