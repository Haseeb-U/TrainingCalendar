# Training Calendar Management System

A comprehensive web-based training calendar management system built with Node.js, Express, and MySQL. This system allows organizations to schedule, manage, and track training sessions with automated email notifications and file management capabilities.

## 📖 Table of Contents

1. [🎯 Project Overview](#-project-overview)
   - [Key Features](#key-features)
2. [🏗️ System Architecture](#️-system-architecture)
   - [Backend Stack](#backend-stack)
   - [Frontend Stack](#frontend-stack)
3. [📁 Project Structure](#-project-structure)
4. [🚀 How To Run This Project](#-how-to-run-this-project)
   - [Step 1: Prerequisites Installation](#step-1-prerequisites-installation)
   - [Step 2: Download and Setup Project](#step-2-download-and-setup-project)
   - [Step 3: Database Configuration](#step-3-database-configuration)
   - [Step 4: Environment Configuration](#step-4-environment-configuration)
   - [Step 5: Start the Application](#step-5-start-the-application)
   - [Step 6: Verify Everything is Working](#step-6-verify-everything-is-working)
   - [Step 7: Test Core Functionality](#step-7-test-core-functionality)
   - [Step 8: Troubleshooting Common Issues](#step-8-troubleshooting-common-issues)
   - [Step 9: Optional - Production Setup](#step-9-optional---production-setup)
   - [Quick Start Summary](#quick-start-summary)
   - [Next Steps](#next-steps)
5. [🗄️ Database Schema](#️-database-schema)
   - [Users Table](#users-table)
   - [Trainings Table](#trainings-table)
   - [User Files Table](#user-files-table)
6. [🚀 Installation and Setup](#-installation-and-setup)
7. [📋 API Documentation](#-api-documentation)
   - [Authentication Endpoints](#authentication-endpoints)
   - [Training Management Endpoints](#training-management-endpoints)
   - [File Management Endpoints](#file-management-endpoints)
   - [Data Export Endpoints](#data-export-endpoints)
8. [🔧 Key Features Explained](#-key-features-explained)
   - [User Authentication System](#1-user-authentication-system)
   - [Training Management](#2-training-management)
   - [Automated Notification System](#3-automated-notification-system)
   - [File Management System](#4-file-management-system)
   - [Frontend Interface](#5-frontend-interface)
   - [Data Export and Reporting](#6-data-export-and-reporting)
9. [📧 Email Notification System](#-email-notification-system)
   - [Automated Reminders](#automated-reminders)
   - [Email Templates](#email-templates)
   - [Configuration](#configuration)
10. [🔒 Security Features](#-security-features)
    - [Authentication & Authorization](#authentication--authorization)
    - [Data Protection](#data-protection)
    - [File Security](#file-security)
11. [🎨 Frontend Features](#-frontend-features)
    - [User Interface Pages](#user-interface-pages)
    - [Interactive Features](#interactive-features)
12. [📊 Development Scripts](#-development-scripts)
    - [Development Workflow](#development-workflow)
13. [🔄 Automated Tasks](#-automated-tasks)
    - [Cron Job Schedule](#cron-job-schedule)
    - [Reminder Logic](#reminder-logic)
    - [OTP Management](#otp-management)
14. [📈 Monitoring and Logging](#-monitoring-and-logging)
    - [Server Logging](#server-logging)
    - [Database Monitoring](#database-monitoring)
    - [Email System Monitoring](#email-system-monitoring)
15. [🚀 Deployment Considerations](#-deployment-considerations)
    - [Production Environment](#production-environment)
    - [Performance Optimization](#performance-optimization)
    - [Security Hardening](#security-hardening)
16. [🤝 Contributing](#-contributing)
    - [Development Guidelines](#development-guidelines)
    - [Code Quality Standards](#code-quality-standards)
    - [Git Workflow](#git-workflow)
17. [📄 License](#-license)
18. [👨‍💻 Author](#-author)
19. [📞 Support](#-support)
    - [Getting Help](#getting-help)
    - [Common Issues and Solutions](#common-issues-and-solutions)
    - [Development Support](#development-support)
    - [Contact Information](#contact-information)
20. [📋 Additional Features & Technical Details](#-additional-features--technical-details)
    - [Advanced Authentication](#advanced-authentication)
    - [Database Features](#database-features)
    - [File Management](#file-management)
    - [Email System](#email-system)

---

## 🎯 Project Overview

The Training Calendar Management System is designed to streamline the process of organizing corporate training sessions. It provides a complete solution for scheduling trainings, managing participants, sending automated reminders, and tracking completion status.

### Key Features

- **User Management**: Secure user registration and authentication with JWT tokens and OTP email verification
- **Training Scheduling**: Create, edit, and manage training sessions with detailed information
- **Automated Notifications**: Cron-job based email reminders sent 2 days before training
- **File Management**: Upload and manage training-related documents with ZIP download support
- **Real-time Status Tracking**: Track training status (pending/completed)
- **Participant Management**: Manage training participants and notification recipients
- **Data Export**: Export training data and reports to CSV format with email delivery
- **OTP Verification**: Two-factor authentication system for secure user registration
- **Email Templates**: Rich HTML email templates for various notifications
- **Report Generation**: Generate and email training reports with date range filtering

## 🏗️ System Architecture

### Backend Stack
- **Framework**: Node.js with Express.js
- **Database**: MySQL with connection pooling
- **Authentication**: JWT (JSON Web Tokens) with bcrypt password hashing and OTP verification
- **Email Service**: Nodemailer for automated notifications with HTML templates
- **File Handling**: Multer for file uploads and Archiver for ZIP file creation
- **Task Scheduling**: Node-cron for automated reminders
- **Validation**: Express-validator for input validation
- **CSV Processing**: Fast-CSV for data export functionality
- **OTP Generation**: Custom OTP generator with expiry management

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
    ├── utils/
    │   └── otpGenerator.js              # OTP generation and validation utilities
    └── userFiles/                    # Uploaded training files (created at runtime)
```

## � How To Run This Project

Follow these step-by-step instructions to get the Training Calendar Management System up and running on your local machine.

### Step 1: Prerequisites Installation

Before you begin, make sure you have the following installed on your system:

#### Install Node.js
1. Visit [https://nodejs.org/](https://nodejs.org/)
2. Download and install Node.js version 14 or higher
3. Verify installation by opening terminal/command prompt and running:
   ```bash
   node --version
   npm --version
   ```

#### Install MySQL Server
1. Visit [https://dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/)
2. Download and install MySQL Server version 8.0 or higher
3. During installation, remember the root password you set
4. Verify MySQL is running by connecting to it:
   ```bash
   mysql -u root -p
   ```

#### Set Up Email Service (Gmail Example)
1. Go to your Gmail account settings
2. Enable 2-factor authentication
3. Generate an App Password:
   - Go to [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and your device
   - Copy the generated 16-character password

### Step 2: Download and Setup Project

#### Clone or Download the Project
```bash
# If using Git
git clone <your-repository-url>
cd TrainingCalendar

# Or download ZIP file and extract it
```

#### Install Dependencies
```bash
# Navigate to backend directory
cd backend

# Install all required packages
npm install
```

### Step 3: Database Configuration

#### Use Default Settings (Recommended for beginners)
1. Make sure MySQL is running with default settings:
   - Host: localhost
   - Port: 3306
   - Root user with password

### Step 4: Environment Configuration

Create a `.env` file in the `backend` folder/directory and configure it with your settings:

```bash
# Navigate to backend directory (if not already there)
cd backend

# Create .env file
# On Windows:
type nul > .env
# On Mac/Linux:
touch .env
```

Open the `.env` file in any text editor and add the following configuration:

```env
# Database Configuration
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_root_password
MYSQL_DB_NAME=TrainingCalendarDB

# JWT Configuration (use any random secure string)
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# Server Configuration
PORT=5000

# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_character_app_password

```

**Important Notes:**
- Replace `your_mysql_root_password` with your actual MySQL root password
- Replace `your_email@gmail.com` with your Gmail address
- Replace `your_16_character_app_password` with the App Password from Gmail
- Create a long, random string for `JWT_SECRET` (e.g., `myapp2025secretkey12345randomstring`)

### Step 5: Start the Application

#### Development Mode (Recommended for testing)
```bash
# Make sure you're in the backend directory
cd backend

# Start the server with auto-restart
npm run dev
```

#### Production Mode
```bash
# Start the server normally
npm start
```

### Step 6: Verify Everything is Working

#### Check Server Status
You should see output similar to:
```
Server is running on http://localhost:5000
```

#### Test Database Connection
The application will automatically:
- Create the database if it doesn't exist
- Create all required tables
- Set up the database schema

#### Access the Application
1. Open your web browser
2. Go to: `http://localhost:5000`
3. You should see the homepage of the Training Calendar Management System

### Step 7: Test Core Functionality

#### Test User Registration
1. Click on "Sign Up" or navigate to `http://localhost:5000/signup.html`
2. Fill in the registration form
3. Check your email for the OTP verification code
4. Enter the OTP to complete registration

#### Test Login
1. Go to `http://localhost:5000/Login.html`
2. Login with your registered credentials
3. You should be redirected to the main dashboard

#### Test Training Creation
1. After logging in, navigate to "Create Training"
2. Fill in training details
3. Add notification recipients
4. Save the training

### Step 8: Troubleshooting Common Issues

#### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Solution:** Make sure MySQL server is running and credentials in `.env` are correct

#### Email Not Sending
```
Error: Invalid login
```
**Solutions:**
- Verify your Gmail App Password is correct (16 characters, no spaces)
- Make sure 2-factor authentication is enabled on your Gmail account
- Check if "Less secure app access" is disabled (use App Password instead)

#### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Either stop the process using port 5000 or change PORT in `.env` file to a different number (e.g., 3000)

#### OTP Email Not Received
- Check spam/junk folder
- Verify EMAIL_USER and EMAIL_PASS in `.env` file
- Make sure Gmail App Password is generated correctly

### Next Steps

After successfully running the project:
1. **Explore the Interface**: Navigate through different pages to understand the system
2. **Create Test Data**: Add some training sessions and test file uploads
3. **Test Email Notifications**: Schedule a training for tomorrow to test reminder emails
4. **Review Logs**: Check the console output for any warnings or errors
5. **Customize Settings**: Modify email templates or add new features as needed

## �🗄️ Database Schema

### Users Table
```sql
users (
    id: INT AUTO_INCREMENT PRIMARY KEY,
    name: VARCHAR(100) NOT NULL,
    email: VARCHAR(100) UNIQUE NOT NULL,
    employee_no: INT UNIQUE NOT NULL,
    password: VARCHAR(255) NOT NULL,    -- bcrypt hashed
    is_verified: BOOLEAN DEFAULT FALSE, -- Email verification status
    otp: VARCHAR(6),                   -- Current OTP for verification
    otp_expires_at: DATETIME,          -- OTP expiration timestamp
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
# Get your Gmail app password from: https://myaccount.google.com/apppasswords
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

#### Register User (Step 1 - Send OTP)
```http
POST /api/users/register
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john@example.com",
    "employee_no": 12345,
    "password": "securepassword123"
}

Response: Returns registration pending status and sends OTP to email
```

#### Verify OTP (Step 2 - Complete Registration)
```http
POST /api/users/verify-otp
Content-Type: application/json

{
    "email": "john@example.com",
    "otp": "123456"
}

Response: Creates user account and sends welcome email
```

#### Resend OTP
```http
POST /api/users/resend-otp
Content-Type: application/json

{
    "email": "john@example.com"
}

Response: Sends new OTP to email
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

Response: ZIP file containing all training files
```

### Data Export Endpoints

#### Generate Training Report
```http
POST /api/trainings/generate-report
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
    "start_date": "2025-01-01",
    "end_date": "2025-12-31",
    "delivery_method": "email"  // or "download"
}

Response: Generates CSV report and emails it to user
```

## 🔧 Key Features Explained

### 1. User Authentication System
- **Two-Step Registration**: Users register with name, email, employee number, and password, then verify via OTP
- **OTP Verification**: 6-digit OTP sent to email with 10-minute expiry and 3-attempt limit
- **Password Security**: Passwords are hashed using bcrypt with salt rounds
- **JWT Tokens**: Secure authentication using JSON Web Tokens
- **Middleware Protection**: Protected routes require valid JWT tokens
- **Welcome Emails**: Automated welcome emails sent after successful verification

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
- **Multiple File Upload**: Support for multiple file uploads per training using Multer
- **Secure Storage**: Files stored in dedicated userFiles directory with organized structure
- **Access Control**: File access tied to user authentication and training ownership
- **ZIP Download**: Bulk download of training files as compressed ZIP archives using Archiver
- **File Validation**: File type and size validation for security

### 5. Frontend Interface
- **Responsive Design**: Mobile-friendly responsive layouts with modern CSS
- **Multiple Pages**: Dedicated pages for different functionalities (10+ HTML pages)
- **Real-time Updates**: Dynamic content updates without page refresh using JavaScript
- **Form Validation**: Client-side and server-side validation with user feedback
- **File Upload Interface**: Drag-and-drop file upload with progress indicators

### 6. Data Export and Reporting
- **CSV Export**: Generate training reports in CSV format using Fast-CSV library
- **Date Range Filtering**: Filter reports by custom date ranges
- **Email Delivery**: Automatically email generated reports to users
- **Custom Headers**: Human-readable column names in exported data
- **Comprehensive Data**: Include all training details, participants, and metadata

## 📧 Email Notification System

### Automated Reminders
The system automatically sends training reminders using the following schedule:
- **Frequency**: Daily at 9:00 AM
- **Trigger**: Trainings scheduled within the next 2 days
- **Recipients**: Email addresses specified in `notification_recipients` field
- **Content**: Detailed training information including date, venue, duration, etc.

### Email Templates
1. **Welcome Email**: Sent upon successful user registration and OTP verification
2. **OTP Verification Email**: Sent during registration process with 6-digit code
3. **Training Reminder**: Sent before scheduled trainings with full details
4. **Report Delivery Email**: Sent with CSV training reports as attachments
5. **New Training Notification**: Sent when new training is created (optional)

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
1. **Homepage** (`homepage.html`): Landing page with project overview and navigation
2. **Authentication**: 
   - Login form (`Login.html`) with JWT token management
   - Registration form (`signup.html`) with OTP verification workflow
3. **Dashboard** (`main.html`): Main user dashboard with quick actions and overview
4. **Training Management**: 
   - Create new training (`session.html`) with comprehensive form validation
   - Edit existing training (`edit.html`) with pre-populated data
   - View all trainings (`table.html`) with sorting and filtering
5. **Profile Management** (`profile.html`): User profile and account settings
6. **File Manager** (`view-files.html`): Upload, view, and download training files
7. **Reports** (`records.html`): Training records, completion tracking, and export functionality

### Interactive Features
- **Dynamic Form Validation**: Real-time validation with error messages and success indicators
- **Real-time Status Updates**: Live training status updates without page refresh
- **Responsive Table Displays**: Sortable and filterable data tables with pagination
- **File Drag-and-Drop Upload**: Modern file upload interface with preview and progress bars
- **Modal Dialogs**: User-friendly confirmation dialogs and popup forms
- **Loading Indicators**: Visual feedback for asynchronous operations
- **Toast Notifications**: Non-intrusive success/error message system
- **Auto-save Functionality**: Automatic saving of form data to prevent data loss

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

```json
{
    "dependencies": {
        "archiver": "^7.0.1",           // ZIP file creation for bulk downloads
        "bcryptjs": "^3.0.2",           // Password hashing and verification
        "csv-parser": "^3.2.0",         // CSV file parsing capabilities
        "dotenv": "^16.5.0",            // Environment variable management
        "express": "^5.1.0",            // Web framework for Node.js
        "express-validator": "^7.2.1",   // Input validation middleware
        "fast-csv": "^5.0.2",           // Fast CSV generation and parsing
        "jsonwebtoken": "^9.0.2",       // JWT token creation and verification
        "multer": "^2.0.2",             // File upload handling
        "mysql2": "^3.14.2",            // MySQL database driver with promise support
        "node-cron": "^4.2.1",          // Task scheduling for automated reminders
        "nodemailer": "^7.0.5"          // Email sending functionality
    },
    "devDependencies": {
        "nodemon": "^3.1.10"            // Development server with auto-restart
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
1. **Database Query**: Query database for pending trainings within next 2 days
2. **Recipient Parsing**: Parse notification recipients from JSON field in database
3. **Email Generation**: Generate detailed email content with training information using HTML templates
4. **Batch Sending**: Send emails to all specified recipients with error handling
5. **Logging**: Log success/failure for monitoring and debugging purposes
6. **Rate Limiting**: Respect email provider rate limits to prevent blocking

### OTP Management
1. **Generation**: Create secure 6-digit OTP codes using crypto randomization
2. **Expiry**: Set 10-minute expiry time for each OTP
3. **Attempts**: Track and limit OTP verification attempts (max 3)
4. **Cleanup**: Automatic cleanup of expired OTP data from memory
5. **Resend Logic**: Allow OTP resending with new codes and reset attempt counter

## 📈 Monitoring and Logging

### Server Logging
- **Application Startup**: Detailed logging of server initialization and port binding
- **Database Connection**: Connection pool status, query performance, and error tracking
- **Email Operations**: Success/failure logs for all email sending operations including OTP delivery
- **File Operations**: Upload/download logs with file sizes and user tracking
- **Authentication Events**: Login attempts, token validation, and OTP verification logs
- **Error Tracking**: Comprehensive error logging with stack traces for debugging

### Database Monitoring
- **Connection Pool**: Active connections, queue length, and connection lifecycle
- **Query Performance**: Slow query detection and performance metrics
- **Auto-reconnection**: Automatic database reconnection on connection loss
- **Transaction Logging**: All CRUD operations logged for audit trail
- **Data Integrity**: Foreign key constraints and referential integrity monitoring

### Email System Monitoring
- **Delivery Status**: Track email delivery success/failure rates
- **Queue Management**: Monitor email queue length and processing time
- **Provider Limits**: Track against SMTP provider rate limits
- **Template Rendering**: Monitor HTML email template generation performance

## 🚀 Deployment Considerations

### Production Environment
1. **Environment Variables**: Secure storage of sensitive configuration in `.env` file
2. **Database**: Production MySQL server with proper backup strategy and replication
3. **Email Service**: Reliable SMTP service (Gmail, SendGrid, etc.) with appropriate rate limits
4. **File Storage**: Secure file storage with backup, recovery, and cleanup policies
5. **SSL/TLS**: HTTPS encryption for secure data transmission
6. **Process Management**: Use PM2 or similar for process monitoring and auto-restart
7. **Load Balancing**: Configure load balancer for high availability
8. **Reverse Proxy**: Use Nginx or Apache for static file serving and request routing

### Performance Optimization
- **Database Connection Pooling**: Efficient resource usage with configurable pool size
- **Static File Serving**: Proper caching headers and CDN integration for static assets
- **Email Queue Management**: Implement email queuing for bulk notifications and rate limiting
- **File Upload Optimization**: Streaming uploads, file size limits, and validation
- **Caching Strategy**: Implement Redis or Memcached for session and data caching
- **Database Indexing**: Optimize database queries with proper indexing
- **Compression**: Enable gzip compression for HTTP responses

### Security Hardening
- **Rate Limiting**: Implement request rate limiting to prevent abuse
- **Input Sanitization**: Comprehensive input validation and sanitization
- **CORS Configuration**: Proper CORS setup for cross-origin requests
- **Security Headers**: Implement security headers (HSTS, CSP, etc.)
- **File Upload Security**: Virus scanning and file type validation
- **Database Security**: Use connection encryption and least privilege access

## 🤝 Contributing

### Development Guidelines
1. **Code Structure**: Follow existing code structure and naming conventions
2. **Error Handling**: Add proper error handling with try-catch blocks and user-friendly messages
3. **Input Validation**: Include appropriate validation for all user inputs using express-validator
4. **Documentation**: Update API documentation and code comments for new features
5. **Testing**: Test all API endpoints thoroughly using tools like Postman or Insomnia
6. **Security**: Follow security best practices and validate all inputs
7. **Database**: Use prepared statements and handle database connections properly
8. **Email**: Test email functionality in development and staging environments

### Code Quality Standards
- **Consistent Formatting**: Use consistent indentation (2 spaces) and formatting
- **Meaningful Comments**: Add comments for complex business logic and algorithms
- **Error Messages**: Provide clear, actionable error messages for users
- **Logging**: Include appropriate logging for debugging and monitoring
- **Constants**: Use constants for configuration values and magic numbers
- **Modular Code**: Keep functions small and focused on single responsibilities

### Git Workflow
1. **Feature Branches**: Create feature branches from main/master
2. **Commit Messages**: Use descriptive commit messages with proper formatting
3. **Pull Requests**: Submit pull requests with detailed descriptions
4. **Code Review**: Conduct thorough code reviews before merging
5. **Testing**: Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the ISC License - see the package.json file for details.

## 👨‍💻 Author

**Haseeb**

## 📞 Support

For technical support or questions about the Training Calendar Management System:

### Getting Help
1. **Documentation**: Check this README.md and backend README.md for detailed developer documentation
2. **API Documentation**: Review API endpoint specifications in this document
3. **Log Files**: Examine server logs for troubleshooting information and error details
4. **Database Issues**: Check database connection and query logs
5. **Email Problems**: Verify SMTP configuration and check email logs
6. **File Upload Issues**: Check file permissions and storage directory setup

### Common Issues and Solutions
- **Database Connection Errors**: Verify MySQL credentials and server status
- **Email Not Sending**: Check SMTP settings and app password configuration
- **File Upload Failures**: Verify userFiles directory permissions and disk space
- **JWT Token Issues**: Check JWT_SECRET environment variable and token expiry
- **OTP Not Received**: Check email spam folder and SMTP rate limits

### Development Support
- **Environment Setup**: Ensure all dependencies are installed and .env file is configured
- **Database Schema**: Verify all tables are created with proper relationships
- **API Testing**: Use tools like Postman with the provided endpoint documentation
- **Frontend Issues**: Check browser console for JavaScript errors

### Contact Information
**Developer**: Haseeb  
**Project Repository**: Training Calendar Management System  
**Last Updated**: August 12, 2025  

For urgent issues or feature requests, contact the development team with:
- Detailed error descriptions
- Steps to reproduce the issue
- Server logs and error messages
- Environment details (OS, Node.js version, MySQL version)

---

## 📋 Additional Features & Technical Details

### Advanced Authentication
- **Session Management**: Secure JWT token handling with automatic renewal
- **Password Policies**: Enforced strong password requirements
- **Account Lockout**: Automatic lockout after multiple failed attempts
- **Email Verification**: Two-factor authentication via email OTP

### Database Features
- **Automatic Migrations**: Database schema automatically created on startup
- **Data Validation**: Server-side validation for all database operations  
- **Foreign Key Constraints**: Referential integrity maintained across all tables
- **Connection Resilience**: Auto-reconnection and connection pooling

### File Management
- **Storage Organization**: Files organized by training ID and user
- **File Type Validation**: Security validation for uploaded files
- **Bulk Operations**: ZIP compression for multiple file downloads
- **Storage Cleanup**: Automatic cleanup of orphaned files

### Email System
- **Rich HTML Templates**: Professional email templates with inline CSS
- **Delivery Tracking**: Monitor email delivery success rates
- **Error Handling**: Robust error handling for email failures
- **Template Customization**: Easy customization of email content and branding

---

*Last Updated: August 12, 2025*