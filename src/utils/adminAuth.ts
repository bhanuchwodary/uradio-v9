
import * as crypto from 'crypto-js';

// The salt increases security of the hashed password
const SALT = "StreamifyRadioSalt2025";
// Storage key for the hashed admin password
const ADMIN_PASSWORD_KEY = "streamify_admin_hash";

/**
 * Hash a password with SHA-256 and a salt
 */
export const hashPassword = (password: string): string => {
  const hashedValue = crypto.SHA256(password + SALT).toString();
  console.log("Password hashed successfully");
  return hashedValue;
};

/**
 * Check if the provided password matches the stored hash
 */
export const verifyPassword = (password: string): boolean => {
  console.log("Verifying password...");
  try {
    const storedHash = localStorage.getItem(ADMIN_PASSWORD_KEY);
    const currentHash = hashPassword(password);
    
    // If no password set yet, check against the hardcoded one
    if (!storedHash) {
      console.log("No stored hash found, setting default");
      const hardcodedHash = hashPassword("J@b1tw$tr3@w");
      localStorage.setItem(ADMIN_PASSWORD_KEY, hardcodedHash);
      const isValid = currentHash === hardcodedHash;
      console.log("Default password validation:", isValid);
      return isValid;
    }
    
    const isValid = currentHash === storedHash;
    console.log("Password validation result:", isValid);
    return isValid;
  } catch (error) {
    console.error("Error during password verification:", error);
    return false;
  }
};

/**
 * Change the admin password
 */
export const changeAdminPassword = (newPassword: string): void => {
  const newHash = hashPassword(newPassword);
  localStorage.setItem(ADMIN_PASSWORD_KEY, newHash);
  console.log("Admin password updated");
};
