
import crypto from 'crypto';

const SECRET_KEY = "mysecretkey123457891234567894561"

// Encrypt patient data using AES-256-CBC
export const encryptPatientDataAES = (patientDetails) => {
  const iv = crypto.randomBytes(16); // Generate a random initialization vector
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(SECRET_KEY), iv);
  let encrypted = cipher.update(JSON.stringify(patientDetails), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return { iv: iv.toString('hex'), encryptedData: encrypted };
};

// const patientDetails = {
//     name: "John Doe",
//     age: 45,
//     disease: "Hypertension"
//   };
  
//   const encryptedData = encryptPatientDataAES(patientDetails);
//   console.log('Encrypted Patient Data:', encryptedData);



export const decryptPatientDataAES = (encryptedData, iv) => {
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(SECRET_KEY), Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted); // Return the original patient data
  };


//   const decryptedData = decryptPatientDataAES(encryptedData.encryptedData, encryptedData.iv);
//   console.log('Decrypted Patient Data:', decryptedData);

export const generateKey32 = () => {
  return crypto.randomBytes(32).toString('hex'); // Generate 32 random bytes and convert to hex
};