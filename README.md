# Training Calendar Management System

A comprehensive web-based training calendar management system built with Node.js, Express, and MySQL. This system allows organizations to schedule, manage, and track training sessions with automated email notifications and file management capabilities.

## 🎯 Project Overview

The Training Calendar Management System is designed to streamline the process of organizing corporate training sessions. It provides a complete solution for scheduling trainings, managing participants, sending automated reminders, and tracking completion status.

### Key Features

- **User Management**: Secure user registration and authentication with JWT tokens
- **Training Scheduling**: Create, edit, and manage training sessions with detailed information
- **Automated Notifications**: Cron-job based email reminders sent 2 days before training
- **File Management**: Upload and manage training-related documents
- **Real-time Status Tracking**: Track training status (pending/completed)
- **Participant Management**: Manage training participants and notification recipients
- **Data Export**: Export training data and reports

## 🏗️ System Architecture

### Backend Stack
- **Framework**: Node.js with Express.js
- **Database**: MySQL with connection pooling
- **Authentication**: JWT (JSON Web Tokens) with bcrypt password hashing
- **Email Service**: Nodemailer for automated notifications
- **File Handling**: Multer for file uploads
- **Task Scheduling**: Node-cron for automated reminders
- **Validation**: Express-validator for input validation

### Frontend Stack
- **Core Technologies**: HTML5, CSS3, JavaScript (ES6+)
- **UI Components**: Custom responsive design
- **File Management**: Browser-based file upload and download
- **Authentication**: Client-side JWT token management

## 📁 Project Structure

```
TrainingCalendar/
├── README.md                          # Main project documentation
└── backend/                           # Backend application root
    ├── .env                          # Environment variables (not in repo)
    ├── package.json                  # Node.js dependencies and scripts
    ├── server.js                     # Main application entry point
    ├── README.md                     # Backend-specific documentation
    ├── DB/
    │   └── mysql.js                  # Database connection and initialization
    ├── mail/
    │   ├── email.js                  # Email service configuration
    │   ├── emailConfig.js            # Email templates and settings
    │   └── sendTrainingReminders.js  # Automated reminder system
    ├── middleware/
    │   └── jwtTokenDecoder.js        # JWT authentication middleware
    ├── public/                       # Frontend static files
    │   ├── homepage.html             # Landing page
    │   ├── Login.html                # User login interface
    │   ├── signup.html               # User registration interface
    │   ├── main.html                 # Main dashboard
    │   ├── profile.html              # User profile management
    │   ├── session.html              # Training session creation
    │   ├── edit.html                 # Training session editing
    │   ├── table.html                # Training sessions overview
    │   ├── records.html              # Training records and reports
    │   └── view-files.html           # File management interface
    ├── routes/
    │   └── api/
    │       ├── users.js              # User authentication and management
    │       ├── trainings.js          # Training session CRUD operations
    │       ├── shareTrainingData.js  # Data sharing and export
    │       └── files.js              # File upload and management
    └── userFiles/                    # Uploaded training files (created at runtime)
```

## 🗄️ Database Schema

### Users Table
```sql
users (
    id: INT AUTO_INCREMENT PRIMARY KEY,
    name: VARCHAR(100) NOT NULL,
    email: VARCHAR(100) UNIQUE NOT NULL,
    employee_no: INT NOT NULL,
    password: VARCHAR(255) NOT NULL,    -- bcrypt hashed
    date: DATE DEFAULT (CURRENT_DATE)
)
```

### Trainings Table
```sql
Trainings (
    id: INT AUTO_INCREMENT PRIMARY KEY,
    name: VARCHAR(100) NOT NULL,
    duration: INT NOT NULL,             -- Duration in minutes
    number_of_participants: INT NOT NULL,
    schedule_date: DATETIME NOT NULL,
    created_at: DATE DEFAULT (CURRENT_DATE),
    venue: VARCHAR(100) NOT NULL,
    status: ENUM('pending', 'completed') DEFAULT 'pending',
    training_hours: INT NOT NULL,
    notification_recipients: JSON NOT NULL,  -- Array of email addresses
    user_id: INT,                       -- Foreign key to users table
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)
```

### User Files Table
```sql
user_files (
    id: INT AUTO_INCREMENT PRIMARY KEY,
    user_id: INT NOT NULL,
    training_id: INT NOT NULL,
    file_path: VARCHAR(255) NOT NULL,
    uploaded_at: DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (training_id) REFERENCES Trainings(id) ON DELETE CASCADE
)
```

## 🚀 Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL Server (v8.0 or higher)
- SMTP email service (Gmail, Outlook, etc.)

### Step-by-Step Setup

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd TrainingCalendar
```

#### 2. Backend Setup
```bash
cd backend
npm install
```

#### 3. Database Configuration
1. Install and start MySQL server
2. Create a database user with appropriate privileges
3. The application will automatically create the database and tables on first run

#### 4. Environment Variables Setup
Create a `.env` file in the `backend/` directory with the following variables:

```env
# Database Configuration
MYSQL_HOST=localhost
MYSQL_USER=your_mysql_username
MYSQL_PASSWORD=your_mysql_password
MYSQL_DB_NAME=TrainingCalendarDB

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here

# Server Configuration
PORT=5000

# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Application Settings
NODE_ENV=development
```

#### 5. Start the Application
```bash
# Development mode with nodemon (auto-restart)
npm run dev

# Production mode
npm start
```

The application will be available at `http://localhost:5000`

## 📋 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/users/register
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john@example.com",
    "employee_no": 12345,
    "password": "securepassword123"
}
```

#### Login User
```http
POST /api/users/login
Content-Type: application/json

{
    "email": "john@example.com",
    "password": "securepassword123"
}
```

### Training Management Endpoints

#### Create Training Session
```http
POST /api/trainings/create
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
    "name": "Advanced JavaScript Training",
    "duration": 240,
    "number_of_participants": 25,
    "schedule_date": "2025-08-15 09:00:00",
    "venue": "Conference Room A",
    "training_hours": 4,
    "notification_recipients": ["trainer@company.com", "hr@company.com"],
    "status": "pending"
}
```

#### Get All Trainings
```http
GET /api/trainings
Authorization: Bearer <jwt_token>
```

#### Update Training Session
```http
PUT /api/trainings/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Delete Training Session
```http
DELETE /api/trainings/:id
Authorization: Bearer <jwt_token>
```

### File Management Endpoints

#### Upload Training Files
```http
POST /api/files/upload/:trainingId
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

Form data: files (multiple files supported)
```

#### Download Training Files
```http
GET /api/files/download/:trainingId
Authorization: Bearer <jwt_token>
```

## 🔧 Key Features Explained

### 1. User Authentication System
- **Registration**: Users register with name, email, employee number, and password
- **Password Security**: Passwords are hashed using bcrypt with salt rounds
- **JWT Tokens**: Secure authentication using JSON Web Tokens
- **Middleware Protection**: Protected routes require valid JWT tokens

### 2. Training Management
- **CRUD Operations**: Complete Create, Read, Update, Delete functionality
- **Validation**: Input validation using express-validator
- **Status Tracking**: Training sessions have pending/completed status
- **Participant Management**: Track number of participants and notification recipients

### 3. Automated Notification System
- **Cron Jobs**: Automated daily checks at 9:00 AM using node-cron
- **Smart Filtering**: Identifies trainings scheduled within next 2 days
- **Email Reminders**: Sends detailed reminder emails to specified recipients
- **Template System**: Structured email templates with training details

### 4. File Management System
- **Multiple File Upload**: Support for multiple file uploads per training
- **Secure Storage**: Files stored in dedicated userFiles directory
- **Access Control**: File access tied to user authentication
- **Download Archive**: Bulk download of training files as ZIP archives

### 5. Frontend Interface
- **Responsive Design**: Mobile-friendly responsive layouts
- **Multiple Pages**: Dedicated pages for different functionalities
- **Real-time Updates**: Dynamic content updates without page refresh
- **Form Validation**: Client-side and server-side validation

## 📧 Email Notification System

### Automated Reminders
The system automatically sends training reminders using the following schedule:
- **Frequency**: Daily at 9:00 AM
- **Trigger**: Trainings scheduled within the next 2 days
- **Recipients**: Email addresses specified in `notification_recipients` field
- **Content**: Detailed training information including date, venue, duration, etc.

### Email Templates
1. **Welcome Email**: Sent upon successful user registration
2. **Training Reminder**: Sent before scheduled trainings
3. **New Training Notification**: Sent when new training is created

### Configuration
Email service uses Nodemailer with support for:
- Gmail SMTP
- Outlook/Hotmail SMTP
- Custom SMTP servers
- OAuth2 authentication

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication with secure token generation
- Password hashing using bcrypt with salt rounds
- Protected API routes requiring valid authentication
- Automatic token expiration and refresh mechanisms

### Data Protection
- SQL injection prevention using prepared statements
- Input validation and sanitization
- CORS configuration for cross-origin requests
- Environment variable protection for sensitive data

### File Security
- Restricted file upload locations
- File type validation and size limits
- Secure file serving with access control
- Protection against directory traversal attacks

## 🎨 Frontend Features

### User Interface Pages
1. **Homepage** (`homepage.html`): Landing page with project overview
2. **Authentication**: Login and registration forms with validation
3. **Dashboard** (`main.html`): Main user dashboard with navigation
4. **Training Management**: Create, edit, and view training sessions
5. **Profile Management**: User profile and account settings
6. **File Manager**: Upload, view, and download training files
7. **Reports**: Training records and completion tracking

### Interactive Features
- Dynamic form validation
- Real-time status updates
- Responsive table displays
- File drag-and-drop upload
- Modal dialogs for confirmations
- Loading indicators for async operations

## 📊 Development Scripts

```json
{
    "scripts": {
        "start": "node server",           // Production mode
        "server": "nodemon server.js",    // Development with auto-restart
        "dev": "npm run server",          // Development alias
        "install-server": "npm install"   // Dependency installation
    }
}
```

### Development Workflow
1. **Development**: Use `npm run dev` for auto-restarting development server
2. **Testing**: Test API endpoints using tools like Postman or curl
3. **Production**: Use `npm start` for production deployment
4. **Database**: Monitor MySQL logs for query performance

## 🔄 Automated Tasks

### Cron Job Schedule
```javascript
// Runs every day at 9:00 AM
cron.schedule('0 9 * * *', () => {
    sendReminders();
});
```

### Reminder Logic
1. Query database for pending trainings within next 2 days
2. Parse notification recipients from JSON field
3. Generate detailed email content with training information
4. Send emails to all specified recipients
5. Log success/failure for monitoring

## 📈 Monitoring and Logging

### Server Logging
- Application startup and initialization logs
- Database connection status
- Email sending success/failure logs
- Error tracking and debugging information

### Database Monitoring
- Connection pool status
- Query performance metrics
- Auto-reconnection on connection loss
- Transaction logging for data integrity

## 🚀 Deployment Considerations

### Production Environment
1. **Environment Variables**: Secure storage of sensitive configuration
2. **Database**: Production MySQL server with proper backup strategy
3. **Email Service**: Reliable SMTP service with appropriate rate limits
4. **File Storage**: Secure file storage with backup and recovery
5. **SSL/TLS**: HTTPS encryption for secure data transmission

### Performance Optimization
- Database connection pooling for efficient resource usage
- Static file serving with proper caching headers
- Email queue management for bulk notifications
- File upload size limits and validation

## 🤝 Contributing

### Development Guidelines
1. Follow existing code structure and naming conventions
2. Add proper error handling and validation
3. Include appropriate logging for debugging
4. Test API endpoints thoroughly
5. Update documentation for new features

### Code Quality
- Use consistent indentation and formatting
- Add comments for complex business logic
- Implement proper error handling
- Follow security best practices

## 📄 License

This project is licensed under the ISC License - see the package.json file for details.

## 👨‍💻 Author

**Haseeb** - Backend Developer

## 📞 Support

For technical support or questions about the Training Calendar Management System:
1. Check the backend README.md for detailed developer documentation
2. Review API documentation for endpoint specifications
3. Examine log files for troubleshooting information
4. Contact the development team for additional support

---

*Last Updated: August 7, 2025*