const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Enhanced email function with HTML support
async function sendTrainingNotification(to, subject, content, attachments = null, isHtml = true) {
  const mailOptions = {
    from: {
      name: 'Training Calendar System',
      address: process.env.EMAIL_USER
    },
    to,
    subject,
    [isHtml ? 'html' : 'text']: content,
    attachments: attachments ? (Array.isArray(attachments) ? attachments : [attachments]) : [],
  };
  return transporter.sendMail(mailOptions);
}

// Beautiful HTML email templates
const getEmailTemplate = (type, data) => {
  const baseTemplate = (title, content, primaryColor = '#4a90e2') => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
            * { box-sizing: border-box; }
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                margin: 0; 
                padding: 0; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .email-container { 
                max-width: 600px; 
                margin: 20px auto; 
                background: #ffffff; 
                border-radius: 15px; 
                overflow: hidden; 
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            }
            .header { 
                background: linear-gradient(135deg, ${primaryColor} 0%, #357abd 100%); 
                padding: 30px; 
                text-align: center; 
                color: white;
            }
            .header h1 { 
                margin: 0; 
                font-size: 28px; 
                font-weight: 300; 
                text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }
            .header .icon { 
                font-size: 48px; 
                margin-bottom: 15px; 
                display: block;
            }
            .content { 
                padding: 40px 30px; 
            }
            .content h2 { 
                color: ${primaryColor}; 
                margin-top: 0; 
                font-size: 24px; 
                font-weight: 400;
            }
            .info-card { 
                background: #f8fafc; 
                border-left: 4px solid ${primaryColor}; 
                padding: 20px; 
                margin: 20px 0; 
                border-radius: 0 8px 8px 0;
            }
            .info-row { 
                display: flex; 
                justify-content: space-between; 
                margin: 10px 0; 
                padding: 8px 0; 
                border-bottom: 1px solid #e2e8f0;
            }
            .info-row:last-child { border-bottom: none; }
            .info-label { 
                font-weight: 600; 
                color: #4a5568; 
                min-width: 120px;
            }
            .info-value { 
                color: #2d3748; 
                text-align: right; 
                flex: 1;
            }
            .cta-button { 
                display: inline-block; 
                background: linear-gradient(135deg, ${primaryColor} 0%, #357abd 100%); 
                color: white; 
                padding: 15px 30px; 
                text-decoration: none; 
                border-radius: 25px; 
                margin: 20px 0; 
                font-weight: 600; 
                box-shadow: 0 4px 15px rgba(74, 144, 226, 0.3);
                transition: transform 0.2s;
            }
            .cta-button:hover { 
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(74, 144, 226, 0.4);
            }
            .footer { 
                background: #f7fafc; 
                padding: 25px 30px; 
                text-align: center; 
                border-top: 1px solid #e2e8f0;
            }
            .footer p { 
                margin: 5px 0; 
                color: #718096; 
                font-size: 14px;
            }
            .priority-high { 
                color: #e53e3e; 
                font-weight: bold;
            }
            .priority-medium { 
                color: #dd6b20; 
                font-weight: bold;
            }
            .priority-low { 
                color: #38a169; 
                font-weight: bold;
            }
            .status-pending { 
                background: #fed7d7; 
                color: #c53030; 
                padding: 4px 12px; 
                border-radius: 20px; 
                font-size: 12px; 
                font-weight: bold;
            }
            .status-completed { 
                background: #c6f6d5; 
                color: #2f855a; 
                padding: 4px 12px; 
                border-radius: 20px; 
                font-size: 12px; 
                font-weight: bold;
            }
            @media (max-width: 600px) {
                .email-container { margin: 10px; border-radius: 10px; }
                .header { padding: 20px; }
                .content { padding: 20px; }
                .info-row { flex-direction: column; }
                .info-label { min-width: auto; margin-bottom: 5px; }
                .info-value { text-align: left; }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            ${content}
        </div>
    </body>
    </html>
  `;

  switch (type) {
    case 'otp_verification':
      return baseTemplate(
        `Email Verification Required - Training Calendar System`,
        `
          <div class="header">
            <div class="icon">🔐</div>
            <h1>Verify Your Email Address</h1>
          </div>
          <div class="content">
            <h2>Hello ${data.name}! 👋</h2>
            <p style="font-size: 16px; margin-bottom: 20px;">Thank you for signing up! To complete your registration and secure your account, please verify your email address using the OTP below:</p>
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 15px; margin: 30px 0;">
              <h2 style="color: white; margin: 0 0 10px 0; font-size: 18px;">Your Verification Code</h2>
              <div style="background: white; padding: 20px; border-radius: 10px; display: inline-block; margin: 10px;">
                <span style="font-size: 32px; font-weight: bold; color: #4a90e2; letter-spacing: 8px; font-family: 'Courier New', monospace;">${data.otp}</span>
              </div>
              <p style="color: white; margin: 15px 0 0 0; font-size: 14px;">⏰ This code expires in 10 minutes</p>
            </div>

            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <h3 style="margin-top: 0; color: #856404;">⚡ Quick Steps:</h3>
              <ol style="color: #2d3748; margin: 10px 0;">
                <li>Return to the signup page</li>
                <li>Enter the 6-digit code above</li>
                <li>Click "Verify Email" to complete registration</li>
              </ol>
            </div>

            <div style="background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <p style="margin: 0; color: #721c24; font-size: 14px;">
                <strong>🔒 Security Note:</strong> If you didn't request this verification, please ignore this email. The code will expire automatically.
              </p>
            </div>

          </div>
          <div class="footer">
            <p><strong>Training Calendar System</strong></p>
            <p>📧 Email Verification Service</p>
            <p style="font-size: 12px; color: #a0aec0;">🔒 This is an automated security message</p>
          </div>
        `,
        '#667eea'
      );

    case 'training_reminder':
      return baseTemplate(
        `Training Reminder – ${data.name}`,
        `
          <div class="header">
            <div class="icon">📌</div>
            <h1>Training Reminder – <span style="text-decoration: underline;">${data.name}</span></h1>
          </div>
          <div class="content">
            <p style="font-size: 16px; margin-bottom: 30px;">This is a friendly reminder for an upcoming training session. All concerned must note the details and ensure attendance.</p>
            
            <div class="info-card">
              <div class="info-row">
                <span class="info-label">📚 Title:</span>
                <span class="info-value">${data.name}</span>
              </div>
              <div class="info-row">
                <span class="info-label">📅 Date:</span>
                <span class="info-value">${new Date(data.schedule_date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div class="info-row">
                <span class="info-label">🕐 Time:</span>
                <span class="info-value">${new Date(data.schedule_date).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })} – ${new Date(new Date(data.schedule_date).getTime() + (parseInt(data.duration) || 1) * 60 * 60 * 1000).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })}</span>
              </div>
              <div class="info-row">
                <span class="info-label">� Venue:</span>
                <span class="info-value">${data.venue}</span>
              </div>
            </div>

            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
              <h3 style="margin-top: 0; color: #856404;">⚡ Important Note:</h3>
              <p style="color: #856404; margin: 0; font-size: 16px;">Attendance is mandatory; please prioritize and plan accordingly to ensure your presence for this scheduled training.</p>
            </div>
          </div>
          <div class="footer">
            <p style="color: #6c757d; font-size: 16px; margin-bottom: 10px;"><strong>Training Calendar System</strong></p>
            <p style="color: #6c757d; font-size: 14px; margin: 5px 0;">ℹ️ This is an automated reminder. For questions, please contact your training coordinator.</p>
            <p style="color: #6c757d; font-size: 14px; margin: 5px 0;">🕐 Reminder sent on ${new Date().toLocaleDateString('en-US', { 
              month: 'numeric', 
              day: 'numeric', 
              year: 'numeric' 
            })}, ${new Date().toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })}</p>
          </div>
        `,
        '#38b2ac'
      );

    case 'new_training_notification':
      return baseTemplate(
        `Training Schedule – ${data.name}`,
        `
          <div class="header">
            <div class="icon">📌</div>
            <h1>Training Schedule – <span style="text-decoration: underline;">${data.name}</span></h1>
          </div>
          <div class="content">
            <p style="font-size: 16px; margin-bottom: 30px;">A new training session has been added to the official calendar. All concerned must note the details and ensure attendance.</p>
            
            <div class="info-card">
              <div class="info-row">
                <span class="info-label">📚 Title:</span>
                <span class="info-value">${data.name}</span>
              </div>
              <div class="info-row">
                <span class="info-label">📅 Date:</span>
                <span class="info-value">${new Date(data.schedule_date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div class="info-row">
                <span class="info-label">🕐 Time:</span>
                <span class="info-value">${new Date(data.schedule_date).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })} – ${new Date(new Date(data.schedule_date).getTime() + (parseInt(data.duration) || 1) * 60 * 60 * 1000).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })}</span>
              </div>
              <div class="info-row">
                <span class="info-label">� Venue:</span>
                <span class="info-value">${data.venue}</span>
              </div>
            </div>

            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
              <h3 style="margin-top: 0; color: #856404;">⚡ Important Note:</h3>
              <p style="color: #856404; margin: 0; font-size: 16px;">Attendance is mandatory; please prioritize and plan accordingly to ensure your presence for this scheduled training.</p>
            </div>
          </div>
          <div class="footer">
            <p style="color: #6c757d; font-size: 16px; margin-bottom: 10px;"><strong>Training Calendar System</strong></p>
            <p style="color: #6c757d; font-size: 14px; margin: 5px 0;">ℹ️ This is an automated notification. For questions, please contact your training coordinator.</p>
            <p style="color: #6c757d; font-size: 14px; margin: 5px 0;">🕐 Training created on ${new Date().toLocaleDateString('en-US', { 
              month: 'numeric', 
              day: 'numeric', 
              year: 'numeric' 
            })}, ${new Date().toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })}</p>
          </div>
        `,
        '#4c51bf'
      );

    case 'training_data_share':
      return baseTemplate(
        'Your Training Data Report',
        `
          <div class="header">
            <div class="icon">📊</div>
            <h1>Training Data Report</h1>
          </div>
          <div class="content">
            <h2>📈 Comprehensive Training Report</h2>
            <p>This report provides an overview of training sessions by ${data.userName}.</p>

            <div class="info-card">
              <h3 style="color: #4a90e2; margin-top: 0;">👤 Trainer Information</h3>
              <div class="info-row">
                <span class="info-label">👨‍💼 Name:</span>
                <span class="info-value"><strong>${data.userName}</strong></span>
              </div>
              <div class="info-row">
                <span class="info-label">📧 Email:</span>
                <span class="info-value">${data.userEmail}</span>
              </div>
            </div>

            <div class="info-card">
              <h3 style="color: #4a90e2; margin-top: 0;">📅 Report Period</h3>
              <div class="info-row">
                <span class="info-label">📅 From:</span>
                <span class="info-value">${data.startDate}</span>
              </div>
              <div class="info-row">
                <span class="info-label">📅 To:</span>
                <span class="info-value">${data.endDate}</span>
              </div>
              <div class="info-row">
                <span class="info-label">📊 Total Trainings:</span>
                <span class="info-value"><strong>${data.totalTrainings}</strong></span>
              </div>
            </div>



            <div style="background: #fff5f5; border-left: 4px solid #e53e3e; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <h3 style="margin-top: 0; color: #c53030;">🔒 Privacy & Security:</h3>
              <p style="color: #2d3748; margin: 10px 0;">This report contains confidential training information. Please handle it securely and do not share it with unauthorized personnel. The attached CSV file should be stored safely and deleted when no longer needed.</p>
            </div>

          </div>
          <div class="footer">
            <p><strong>Training Calendar System - Data Analytics</strong></p>
            <p>📧 Report generated automatically. For support, contact your system administrator.</p>
            <p>🕐 Generated on ${new Date().toLocaleString()}</p>
            <p style="font-size: 12px; color: #a0aec0;">📁 CSV Report: ${data.fileName || 'training_data.csv'}</p>
            ${data.hasFiles ? `<p style="font-size: 12px; color: #a0aec0;">🗂️ Training Files: Included in ZIP archive (${data.totalFiles} files)</p>` : '<p style="font-size: 12px; color: #a0aec0;">📁 No training files found for this period</p>'}
          </div>
        `,
        '#805ad5'
      );



    case 'welcome':
      return baseTemplate(
        'Welcome to Training Calendar System!',
        `
          <div class="header">
            <h1>Welcome to Training Horizon!</h1>
          </div>
          <div class="content">
            <h2>Training Horizon makes training management easy!</h2>
            
            <div style="background: #f0fff4; border-left: 4px solid #48bb78; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <h3 style="margin-top: 0; color: #2f855a;">👤 Your Account Details</h3>
              <ul style="color: #2d3748; margin: 10px 0;">
                <li>👨‍💼 Name: <strong>${data.name}</strong></li>
                <li>📧 Email: ${data.email}</li>
                <li>🆔 Employee ID: ${data.employee_no}</li>
                <li>📅 Joined: ${new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</li>
              </ul>
            </div>

            <div style="background: #f0fff4; border-left: 4px solid #48bb78; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <h3 style="margin-top: 0; color: #2f855a;">🎯 What You Can Do:</h3>
              <ul style="color: #2d3748; margin: 10px 0;">
                <li>📅 Create training sessions</li>
                <li>🎓 Track your training progress and achievements</li>
                <li>📊 Generate and share comprehensive training reports</li>
                <li>🔔 Receive timely reminders and notifications</li>
                <li>📚 Access training materials and resources</li>
                <li>🤝 Connect with fellow learners and instructors</li>
              </ul>
            </div>

            <div style="background: #e6fffa; border-left: 4px solid #38b2ac; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <h3 style="margin-top: 0; color: #2c7a7b;">💡 Getting Started Tips:</h3>
              <ul style="color: #2d3748; margin: 10px 0;">
                <li>🔐 Keep your login credentials secure</li>
                <li>🔔 Enable notifications to stay updated</li>
                <li>❓ Don't hesitate to contact support if you need help</li>
              </ul>
            </div>

          
        `,
        '#48bb78'
      );

    default:
      return baseTemplate(
        'Training System Notification',
        `
          <div class="header">
            <div class="icon">📧</div>
            <h1>Training System</h1>
          </div>
          <div class="content">
            <h2>Notification</h2>
            <p>You have received a notification from the Training Calendar System.</p>
          </div>
          <div class="footer">
            <p><strong>Training Calendar System</strong></p>
            <p>📧 Automated notification</p>
          </div>
        `
      );
  }
};

// Utility functions for sending specific email types
const sendWelcomeEmail = async (userData) => {
  const subject = `Welcome to Training Calendar System, ${userData.name}!`;
  const htmlContent = getEmailTemplate('welcome', userData);
  return sendTrainingNotification(userData.email, subject, htmlContent);
};

const sendTrainingReminderEmail = async (recipients, trainingData) => {
  const subject = `⏰ Training Reminder: ${trainingData.name}`;
  const htmlContent = getEmailTemplate('training_reminder', trainingData);
  return sendTrainingNotification(recipients, subject, htmlContent);
};

const sendNewTrainingNotificationEmail = async (recipients, trainingData) => {
  const subject = `🎓 Upcoming Training : ${trainingData.name}`;
  const htmlContent = getEmailTemplate('new_training_notification', trainingData);
  return sendTrainingNotification(recipients, subject, htmlContent);
};

const sendTrainingDataShareEmail = async (recipient, reportData, csvAttachment) => {
  const subject = `📊 Training Report (${reportData.totalTrainings} trainings) - ${reportData.startDate} to ${reportData.endDate}`;
  const htmlContent = getEmailTemplate('training_data_share', reportData);
  return sendTrainingNotification(recipient, subject, htmlContent, csvAttachment);
};

const sendOTPVerificationEmail = async (userData) => {
  const subject = `🔐 Email Verification Code - Training Calendar System`;
  const htmlContent = getEmailTemplate('otp_verification', userData);
  return sendTrainingNotification(userData.email, subject, htmlContent);
};

module.exports = { 
  sendTrainingNotification, 
  getEmailTemplate,
  sendWelcomeEmail,
  sendTrainingReminderEmail,
  sendNewTrainingNotificationEmail,
  sendTrainingDataShareEmail,
  sendOTPVerificationEmail
};