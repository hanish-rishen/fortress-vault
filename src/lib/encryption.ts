import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.ENCRYPTION_KEY || 'your-secret-key';

// Text encryption/decryption
export const encrypt = (text: string): string => {
  try {
    const encrypted = CryptoJS.AES.encrypt(text, SECRET_KEY);
    return encrypted.toString();
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt text');
  }
};

export const decrypt = (ciphertext: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) throw new Error('Decryption failed');
    return decrypted;
  } catch (error) {
    throw new Error('Failed to decrypt text');
  }
};

// New binary-based file encryption
export const encryptFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const base64 = reader.result as string;
        const encrypted = CryptoJS.AES.encrypt(base64, SECRET_KEY);
        resolve(encrypted.toString());
      } catch (error) {
        console.error('File encryption error:', error);
        reject(new Error('Failed to encrypt file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

export const decryptFile = (ciphertext: string): string => {
  try {
    const fileData = JSON.parse(ciphertext);
    
    // Decrypt the binary data
    const decrypted = CryptoJS.AES.decrypt(fileData.content, SECRET_KEY);
    
    // Convert to Base64
    const base64String = decrypted.toString(CryptoJS.enc.Base64);
    
    if (!base64String) {
      throw new Error('Decryption resulted in empty data');
    }
    
    return `data:${fileData.type};base64,${base64String}`;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt file');
  }
};