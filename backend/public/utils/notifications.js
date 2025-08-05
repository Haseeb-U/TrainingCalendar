/**
 * Centralized Notification System
 * Replaces browser alerts with styled toast notifications
 */

class NotificationManager {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        // Create notification container if it doesn't exist
        if (!document.getElementById('notification-container')) {
            this.container = document.createElement('div');
            this.container.id = 'notification-container';
            this.container.className = 'notification-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.getElementById('notification-container');
        }

        // Add CSS styles
        this.addStyles();
    }

    addStyles() {
        if (document.getElementById('notification-styles')) return;

        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                max-width: 400px;
            }

            .notification {
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                margin-bottom: 10px;
                padding: 16px;
                border-left: 4px solid;
                animation: slideIn 0.3s ease-out;
                position: relative;
                overflow: hidden;
            }

            .notification.success {
                border-left-color: #10b981;
                background-color: #f0fdf4;
            }

            .notification.error {
                border-left-color: #ef4444;
                background-color: #fef2f2;
            }

            .notification.warning {
                border-left-color: #f59e0b;
                background-color: #fffbeb;
            }

            .notification.info {
                border-left-color: #3b82f6;
                background-color: #eff6ff;
            }

            .notification-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            }

            .notification-title {
                font-weight: 600;
                font-size: 14px;
                margin: 0;
            }

            .notification.success .notification-title {
                color: #065f46;
            }

            .notification.error .notification-title {
                color: #991b1b;
            }

            .notification.warning .notification-title {
                color: #92400e;
            }

            .notification.info .notification-title {
                color: #1e40af;
            }

            .notification-close {
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                color: #6b7280;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .notification-close:hover {
                color: #374151;
            }

            .notification-message {
                font-size: 13px;
                line-height: 1.4;
                margin: 0;
            }

            .notification.success .notification-message {
                color: #047857;
            }

            .notification.error .notification-message {
                color: #7f1d1d;
            }

            .notification.warning .notification-message {
                color: #78350f;
            }

            .notification.info .notification-message {
                color: #1d4ed8;
            }

            .notification-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background-color: rgba(0, 0, 0, 0.1);
                animation: progress linear;
            }

            .notification.success .notification-progress {
                background-color: #10b981;
            }

            .notification.error .notification-progress {
                background-color: #ef4444;
            }

            .notification.warning .notification-progress {
                background-color: #f59e0b;
            }

            .notification.info .notification-progress {
                background-color: #3b82f6;
            }

            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }

            @keyframes progress {
                from {
                    width: 100%;
                }
                to {
                    width: 0%;
                }
            }

            .notification.removing {
                animation: slideOut 0.3s ease-out forwards;
            }

            /* Mobile responsiveness */
            @media (max-width: 480px) {
                .notification-container {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    max-width: none;
                }

                .notification {
                    padding: 12px;
                }

                .notification-title {
                    font-size: 13px;
                }

                .notification-message {
                    font-size: 12px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    show(message, type = 'info', title = '', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        const defaultTitles = {
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Information'
        };

        const notificationTitle = title || defaultTitles[type] || 'Notification';

        notification.innerHTML = `
            <div class="notification-header">
                <h4 class="notification-title">${notificationTitle}</h4>
                <button class="notification-close">&times;</button>
            </div>
            <p class="notification-message">${message}</p>
            <div class="notification-progress" style="animation-duration: ${duration}ms;"></div>
        `;

        // Add close functionality
        const closeButton = notification.querySelector('.notification-close');
        closeButton.addEventListener('click', () => {
            this.remove(notification);
        });

        // Add to container
        this.container.appendChild(notification);

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                this.remove(notification);
            }, duration);
        }

        return notification;
    }

    remove(notification) {
        if (notification && notification.parentNode) {
            notification.classList.add('removing');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }

    success(message, title = '', duration = 4000) {
        return this.show(message, 'success', title, duration);
    }

    error(message, title = '', duration = 7000) {
        return this.show(message, 'error', title, duration);
    }

    warning(message, title = '', duration = 5000) {
        return this.show(message, 'warning', title, duration);
    }

    info(message, title = '', duration = 5000) {
        return this.show(message, 'info', title, duration);
    }

    clear() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Create global instance
const notify = new NotificationManager();

// Enhanced alert replacement function
function showAlert(message, type = 'info', title = '', duration = 5000) {
    return notify.show(message, type, title, duration);
}

// Convenience functions to replace alert() calls
function showSuccess(message, title = 'Success') {
    return notify.success(message, title);
}

function showError(message, title = 'Error') {
    return notify.error(message, title);
}

function showWarning(message, title = 'Warning') {
    return notify.warning(message, title);
}

function showInfo(message, title = 'Information') {
    return notify.info(message, title);
}

// Override the native alert function (optional)
window.originalAlert = window.alert;
window.alert = function(message) {
    // Check if message suggests an error or success
    const msgLower = message.toLowerCase();
    if (msgLower.includes('success') || msgLower.includes('successfully') || msgLower.includes('updated') || msgLower.includes('uploaded')) {
        return showSuccess(message);
    } else if (msgLower.includes('error') || msgLower.includes('failed') || msgLower.includes('invalid') || msgLower.includes('wrong')) {
        return showError(message);
    } else if (msgLower.includes('warning') || msgLower.includes('please')) {
        return showWarning(message);
    } else {
        return showInfo(message);
    }
};

// Make it available globally
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NotificationManager, notify, showAlert, showSuccess, showError, showWarning, showInfo };
} else {
    window.notify = notify;
    window.showAlert = showAlert;
    window.showSuccess = showSuccess;
    window.showError = showError;
    window.showWarning = showWarning;
    window.showInfo = showInfo;
}
