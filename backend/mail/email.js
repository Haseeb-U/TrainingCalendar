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
    case 'training_reminder':
      return baseTemplate(
        `Training Reminder: ${data.name}`,
        `
          <div class="header">
            <div class="icon">⏰</div>
            <h1>Training Reminder</h1>
          </div>
          <div class="content">
            <h2>🎯 Training is coming up soon!</h2>
            <p>Hello there! This is a friendly reminder for an important training session scheduled soon.</p>
            
            <div class="info-card">
              <div class="info-row">
                <span class="info-label">📚 Training Name:</span>
                <span class="info-value"><strong>${data.name}</strong></span>
              </div>
              <div class="info-row">
                <span class="info-label">📅 Scheduled Date:</span>
                <span class="info-value">${new Date(data.schedule_date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div class="info-row">
                <span class="info-label">⏰ Time:</span>
                <span class="info-value">${new Date(data.schedule_date).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
              <div class="info-row">
                <span class="info-label">📍 Venue:</span>
                <span class="info-value">${data.venue || 'TBA'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">⏱️ Duration:</span>
                <span class="info-value">${data.duration || 'TBA'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">👥 Total Participants:</span>
                <span class="info-value">${data.number_of_participants || 'TBA'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">📊 Status:</span>
                <span class="info-value"><span class="status-${data.status || 'pending'}">${(data.status || 'pending').toUpperCase()}</span></span>
              </div>
            </div>
            
          </div>
          <div class="footer">
            <p><strong>Training Calendar System</strong></p>
            <p>📧 This is an automated reminder. Please don't reply to this email.</p>
            <p>🕐 Generated on ${new Date().toLocaleString()}</p>
          </div>
        `,
        '#38b2ac'
      );

    case 'new_training_notification':
      return baseTemplate(
        `New Training: ${data.name}`,
        `
          <div class="header">
            <div class="icon">🎓</div>
            <h1>New Training Scheduled!</h1>
          </div>
          <div class="content">
            <h2>🚀 A new training has been scheduled</h2>
            <p>We're pleased to inform you that a new training session has been added to the calendar.</p>
            
            <div class="info-card">
              <div class="info-row">
                <span class="info-label">📚 Training Name:</span>
                <span class="info-value"><strong>${data.name}</strong></span>
              </div>
              <div class="info-row">
                <span class="info-label">📅 Scheduled Date:</span>
                <span class="info-value">${new Date(data.schedule_date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div class="info-row">
                <span class="info-label">⏰ Time:</span>
                <span class="info-value">${new Date(data.schedule_date).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
              <div class="info-row">
                <span class="info-label">📍 Venue:</span>
                <span class="info-value">${data.venue}</span>
              </div>
              <div class="info-row">
                <span class="info-label">⏱️ Duration:</span>
                <span class="info-value">${data.duration}</span>
              </div>
              <div class="info-row">
                <span class="info-label">👥 Total Participants:</span>
                <span class="info-value">${data.number_of_participants}</span>
              </div>
              <div class="info-row">
                <span class="info-label">📊 Status:</span>
                <span class="info-value"><span class="status-${data.status}">${data.status.toUpperCase()}</span></span>
              </div>
            </div>

            <div style="background: #fff5f5; border-left: 4px solid #e53e3e; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <h3 style="margin-top: 0; color: #c53030;">⚡ Important Notice:</h3>
              <p style="color: #2d3748; margin: 10px 0;">This training is scheduled within the next 2 days.</p>
            </div>
          </div>
          <div class="footer">
            <p><strong>Training Calendar System</strong></p>
            <p>📧 This is an automated notification. For questions, please contact your training coordinator.</p>
            <p>🕐 Training created on ${new Date().toLocaleString()}</p>
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
            <div class="icon">🎉</div>
            <h1>Welcome to Training Horizon!</h1>
          </div>
          <div class="content">
            <h2>🚀 Training Horizon makes training management easy!</h2>
            <p>Hello ${data.name}! We are excited to have you on board.</p>

            <div class="info-card">
              <h3 style="color: #4a90e2; margin-top: 0;">👤 Your Account Details</h3>
              <div class="info-row">
                <span class="info-label">👨‍💼 Name:</span>
                <span class="info-value"><strong>${data.name}</strong></span>
              </div>
              <div class="info-row">
                <span class="info-label">📧 Email:</span>
                <span class="info-value">${data.email}</span>
              </div>
              <div class="info-row">
                <span class="info-label">🆔 Employee ID:</span>
                <span class="info-value">${data.employee_no}</span>
              </div>
              <div class="info-row">
                <span class="info-label">📅 Joined:</span>
                <span class="info-value">${new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
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

          </div>
          <div class="footer">
            <p><strong>Training Calendar System</strong></p>
            <p>🎯 Your success is our priority. Let's achieve great things together!</p>
            <p>📞 Need help? Contact our support team anytime.</p>
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
  const subject = `🎉 Welcome to Training Calendar System, ${userData.name}!`;
  const htmlContent = getEmailTemplate('welcome', userData);
  return sendTrainingNotification(userData.email, subject, htmlContent);
};

const sendTrainingReminderEmail = async (recipients, trainingData) => {
  const subject = `⏰ Training Reminder: ${trainingData.name}`;
  const htmlContent = getEmailTemplate('training_reminder', trainingData);
  return sendTrainingNotification(recipients, subject, htmlContent);
};

const sendNewTrainingNotificationEmail = async (recipients, trainingData) => {
  const subject = `🎓 New Training : ${trainingData.name}`;
  const htmlContent = getEmailTemplate('new_training_notification', trainingData);
  return sendTrainingNotification(recipients, subject, htmlContent);
};

const sendTrainingDataShareEmail = async (recipient, reportData, csvAttachment) => {
  const subject = `📊 Training Report (${reportData.totalTrainings} trainings) - ${reportData.startDate} to ${reportData.endDate}`;
  const htmlContent = getEmailTemplate('training_data_share', reportData);
  return sendTrainingNotification(recipient, subject, htmlContent, csvAttachment);
};

module.exports = { 
  sendTrainingNotification, 
  getEmailTemplate,
  sendWelcomeEmail,
  sendTrainingReminderEmail,
  sendNewTrainingNotificationEmail,
  sendTrainingDataShareEmail
};