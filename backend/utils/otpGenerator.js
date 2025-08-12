const crypto = require('crypto');

/**
 * Generate a 6-digit OTP
 * @returns {string} 6-digit OTP
 */
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate OTP expiry time (10 minutes from now)
 * @returns {Date} Expiry datetime
 */
function generateOTPExpiry() {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 10); // OTP valid for 10 minutes
    return now;
}

/**
 * Check if OTP has expired
 * @param {Date} expiryTime - The OTP expiry time
 * @returns {boolean} True if expired, false if still valid
 */
function isOTPExpired(expiryTime) {
    return new Date() > new Date(expiryTime);
}

module.exports = {
    generateOTP,
    generateOTPExpiry,
    isOTPExpired
};
