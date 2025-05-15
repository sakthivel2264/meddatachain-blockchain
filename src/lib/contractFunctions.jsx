import Web3 from "web3";
import MedicalDataTransferContract from "@/contracts/MedicalDataTransfer.json";

let web3;
let contract;
let account;

/**
 * Initialize Web3 and the contract instance.
 */
export const initializeContract = async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = MedicalDataTransferContract.networks[networkId];
      contract = new web3.eth.Contract(
        MedicalDataTransferContract.abi,
        deployedNetwork && deployedNetwork.address
      );
      const accounts = await web3.eth.getAccounts();
      account = accounts[0];
      localStorage.setItem('account', account);
      return { account, contract };
    } catch (error) {
      console.error("Error initializing contract:", error);
      throw new Error("Failed to initialize contract");
    }
  } else {
    throw new Error("Ethereum provider not found");
  }
};

/**
 * Determine the user's role based on their address.
 * @param {string} userAddress - The address of the user.
 * @returns {Promise<string>} The role of the user.
 */
export const determineUserRole = async (userAddress) => {
  if (!contract) throw new Error("Contract not initialized");

  try {
    const ADMIN_ROLE = await contract.methods.ADMIN_ROLE().call();
    const HOSPITAL_ROLE = await contract.methods.HOSPITAL_ROLE().call();
    const PATIENT_ROLE = await contract.methods.PATIENT_ROLE().call();

    if (await contract.methods.hasRole(ADMIN_ROLE, userAddress).call()) {
      return "Admin";
    } else if (await contract.methods.hasRole(HOSPITAL_ROLE, userAddress).call()) {
      return "Hospital";
    } else if (await contract.methods.hasRole(PATIENT_ROLE, userAddress).call()) {
      return "Patient";
    } else {
      return "Unregistered";
    }
  } catch (error) {
    console.error("Error determining user role:", error);
    throw error;
  }
};

/**
 * Register a hospital.
 * @param {string} name - The name of the hospital.
 * @param {string} addresskey - The address of the hospital.
 * @param {string} location - The location of the hospital.
 */
export const registerHospital = async (name, addresskey, location) => {
  if (!contract || !account) throw new Error("Contract or account not initialized");

  try {
    await contract.methods.registerHospital(name, addresskey, location).send({ from: account });
    alert("Hospital registered successfully!");
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};


/**
 * Register a patient.
 * @param {string} name - The name of the patient.
 * @param {string} addresskey - The address of the patient.
 * @param {string} hospitalAddress
 */
export const registerPatient = async (name, addresskey, hospitalAddress, dob, gender, bloodGroup, govId, phone, email) => {
  if (!contract || !account) throw new Error("Contract or account not initialized");

  try {
    await contract.methods.registerPatient(name, addresskey, hospitalAddress, dob, gender, bloodGroup, govId, phone, email).send({ from: account });
    alert("Patient registered successfully!");
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

/**
 * Store a record for a patient.
 * @param {string} patientAddress - The patient's address.
 * @param {string} encryptedData - The encrypted data.
 * @param {string} encryptionKey - The encryption key.
 */
export const storeRecord = async (patientAddress, encryptedData, encryptionKey) => {
  if (!contract || !account) throw new Error("Contract or account not initialized");

  try {
    await contract.methods.storeRecord(patientAddress, encryptedData, encryptionKey).send({ from: account });
    alert("Record stored successfully!");
  } catch (error) {
    console.error("Record storage error:", error);
    throw error;
  }
};

/**
 * Fetch all hospitals.
 * @returns {Promise<Array>} The list of hospitals.
 */
export const fetchHospitals = async () => {
  if (!contract) throw new Error("Contract not initialized");

  try {
    const hospitalsList = await contract.methods.getAllHospitals().call();
    return hospitalsList;
  } catch (error) {
    console.error("Error fetching hospitals:", error);
    throw error;
  }
};


/**
 * Remove a hospital.
 * @param {string} addressKey - The address of the hospital to remove.
 * @returns {Promise<void>} Resolves when the hospital is removed successfully.
 */
export const removeHospital = async (addressKey) => {
  if (!contract|| !account) throw new Error("Contract not initialized and Account not initialized");

  try {
    // Call the removeHospital method from the contract
    await contract.methods.removeHospital(addressKey).send({ from: account });
    console.log(`Hospital with address ${addressKey} removed successfully`);
  } catch (error) {
    console.error("Error removing hospital:", error);
    throw error;
  }
};


/**
 * get all patients.
 * @returns {Promise<Array>} The list of patients.
 */

export const fetchPatients = async () => {
  if (!contract) throw new Error("Contract not initialized");

  try {
    const patientsList = await contract.methods.getAllPatients().call();
    return patientsList;
  } catch (error) {
    console.error("Error fetching patients:", error);
    throw error;
  }
}



/**
 * Interconnect two hospitals for data sharing.
 * @param {string} hospitalB - Address of the hospital to connect with.
 * @returns {Promise<void>} Resolves when hospitals are interconnected.
 */
export const interconnectHospitals = async (hospitalB) => {
  if (!contract) throw new Error("Contract not initialized");

  try {
    await contract.methods.interconnectHospitals(hospitalB).send({ from: account });
    alert("Hospitals interconnected successfully!");
    console.log(`Hospitals interconnected with ${hospitalB} successfully!`);
  } catch (error) {
    console.error("Error interconnecting hospitals:", error);
    throw error;
  }
};

/**
 * Share a medical record with another hospital
 * @param {string} recordId - ID of the record to share
 * @param {string} receivingHospital - Address of the receiving hospital
 * @returns {Promise<void>}
 */
export const shareRecord = async (recordId, receivingHospital) => {
  if (!contract) throw new Error('Contract not initialized');

  try {
    const result = await contract.methods
      .shareRecord(recordId, receivingHospital)
      .send({ from: account });
    
    console.log('Record shared successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sharing record:', error);
    throw error;
  }
};

/**
 * Grant consent to a hospital
 * @param {string} hospitalAddress - Address of the hospital to grant consent to
 * @returns {Promise<void>}
 */
export const grantConsent = async (hospitalAddress) => {
  if (!contract) throw new Error('Contract not initialized');

  try {
    const result = await contract.methods
      .grantConsent(hospitalAddress)
      .send({ from: account });
    
    console.log('Consent granted successfully:', result);
    return result;
  } catch (error) {
    console.error('Error granting consent:', error);
    throw error;
  }
};

/**
 * Revoke consent from a hospital
 * @param {string} hospitalAddress - Address of the hospital to revoke consent from
 * @returns {Promise<void>}
 */
export const revokeConsent = async (hospitalAddress) => {
  if (!contract) throw new Error('Contract not initialized');

  try {
    const result = await contract.methods
      .revokeConsent(hospitalAddress)
      .send({ from: account });
    
    console.log('Consent revoked successfully:', result);
    return result;
  } catch (error) {
    console.error('Error revoking consent:', error);
    throw error;
  }
};

/**
 * Check if hospitals are interconnected.
 * @param {string} hospitalA - Address of the first hospital.
 * @param {string} hospitalB - Address of the second hospital.
 * @returns {Promise<boolean>} True if hospitals are interconnected.
 */
export const checkInterconnection = async (hospitalA, hospitalB) => {
  if (!contract) throw new Error("Contract not initialized");

  try {
    const isInterconnected = await contract.methods.hospitalInterconnections(hospitalA, hospitalB).call();
    return isInterconnected;
  } catch (error) {
    console.error("Error checking interconnection:", error);
    throw error;
  }
};



/**
 * AddConsent to a patient.
 * @param {string} patientAddress - Address of the patient.
 * @param {string} HospitalAddress - Address of the doctor.
 * @param {string} consentGiven - The consent.
 * @param {string} message - The message.
 * @@returns {Promise<void>}
 */
export const AskforConsent = async (patientAddress, HospitalAddress, consentGiven, message) => {
  if (!contract) throw new Error("Contract not initialized");

  try {
    await contract.methods.addConsent(patientAddress, HospitalAddress, consentGiven, message).send({ from: account });
    alert("Consent asked successfully!");
    console.log(`Consent asked successfully!`);
  } catch (error) {
    console.error("Error asking consent:", error);
    throw error;
  }
}

/**
 * Fetch all consents.
 * @returns {Promise<Array>} The list of consents.
 */
export const fetchConsents = async () => {
  if (!contract) throw new Error("Contract not initialized");

  try {
    const consentsList = await contract.methods.getConsents().call();
    return consentsList;
  } catch (error) {
    console.error("Error fetching consents:", error);
    throw error;
  }
}

/**
 * @param {string} patientAddress - Address of the patient.
 * @param {string} hospitalAddress - Address of the hospital.
 * @returns {Promise<boolean>} True if the consent is given.
 */
export const checkConsent = async (patientAddress, hospitalAddress) => {
  if (!contract) throw new Error("Contract not initialized");

  if (!web3.utils.isAddress(patientAddress)) {
    throw new Error("Invalid patient address");
  }
  if (!web3.utils.isAddress(hospitalAddress)) {
    throw new Error("Invalid hospital address");
  }
  
  try {
    const isConsent = await contract.methods.getPatientConsent(patientAddress, hospitalAddress).call();
    console.log("Consentstatus:", isConsent);
    return isConsent;
  } catch (error) {
    console.error("Error checking consent:", error);
    throw error;
  }
}


/**
 * Fetch all records.
 * @param {string} hospitalAddress - Address of the hospital.
 * @returns {Promise<Array>} The list of records.
 */

// export const getInterconnectedHospitals = async (hospitalAddress) => {
//   if (!contract) throw new Error("Contract not initialized");

//   try {
//     const interconnectedHospitals = await contract.methods.getInterconnectedHospitals(hospitalAddress).send({ from: account });
//     return interconnectedHospitals;
//   } catch (error) {
//     console.error("Error fetching interconnected hospitals:", error);
//     throw error;
//   }
// }

export const getInterconnectedHospitals = async (hospitalAddress) => {
  try {
    const [addresses, names] = await contract.methods.getInterconnectedHospitals(hospitalAddress).send({ from: account });
    
    // const hospitals = addresses.map((address, index) => ({
    //   address,
    //   name: names[index]
    // }));

    // console.log("Interconnected Hospitals:", hospitals);
    // return hospitals;
  } catch (error) {
    console.error("Error fetching interconnected hospitals:", error);
    return [];
  }
}



/**
 * @param {string} patientAddress
 * @returns {Promise<any>}
 */

export const viewMyRecord = async (patientAddress) =>{
  if(!contract) throw new Error("Contract not initialized");

  try {
    const record = await contract.methods.viewMyRecord(patientAddress).call({ from: account });
    console.log('Record', record);

    return record;
  } catch (error) {
    console.error("Error fetching ViewMy Record:", error);
    throw error;
  }
}

/**
 * @param {string} patientAddress
 * @param {string} hospitalAddress
 * @returns {Promise<any>}
 */

export const viewPatientRecord = async (patientAddress) =>{
  if(!contract) throw new Error("Contract not initialized");

  try {
    const record = await contract.methods.viewPatientData(patientAddress).call({ from: account });
    console.log("Patient Record", record)
    return record;
  } catch (error) {
    console.error("Error fetching Patient Record:", error);
    throw error;
  }
}