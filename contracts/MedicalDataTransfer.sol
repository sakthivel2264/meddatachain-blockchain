// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MedicalDataTransfer is AccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant HOSPITAL_ROLE = keccak256("HOSPITAL_ROLE");
    bytes32 public constant PATIENT_ROLE = keccak256("PATIENT_ROLE");

    address public Admin = 0xa500301371167FefBf7161B4b8Ae5dcAE6B7C11D;

    Counters.Counter private _hospitalCounter;
    Counters.Counter private _patientCounter;
    Counters.Counter private _recordCounter;

    mapping(address => Hospital) public hospitals;
    mapping(address => Patient[]) public patients;
    mapping(address => Record[]) private records;

    mapping(address => mapping(address => bool)) public hospitalInterconnections;
    mapping(address => mapping(address => bool)) public patientConsents;
    mapping(address => address[]) private patientConsentHospitals;

    address[] public hospitalAddresses;
    address[] public patientAddresses;
    address[] public recordses;

    event HospitalRegistered(address indexed hospitalAddress, string name);
    event PatientRegistered(address indexed patientAddress, string name);
    event HospitalRemoved(address indexed addresskey);
    event RecordStored(uint256 indexed recordId, address indexed patientAddress, address indexed hospitalAddress);
    event ConsentGranted(address indexed patientAddress, address indexed hospitalAddress);
    event ConsentRevoked(address indexed patientAddress, address indexed hospitalAddress);
    event RecordRetrieved(address indexed patientAddress, uint256 recordCount);

    struct Hospital {
        uint256 id;
        string name;
        string location;
        address hospitalAddress;
    }

    struct Patient {
        uint256 id;
        string name;
        address patientAddress;
        address hospitalAddress;
        string dob;
        string gender;
        string bloodGroup;
        string govId;
        string phone;
        string email;
    }

    struct Record {
        uint256 id;
        address patientAddress;
        address hospitalAddress;
        string encryptedData;
        string encryptionKey;
    }

    struct Consent {
        address hospitalAddress;
        address patientAddress;
        bool consentGiven;
        string message;
    }

    Consent[] public consents;

    constructor() {
        _setupRole(ADMIN_ROLE, Admin);
    }

    //working
    function registerHospital(string memory name, address addresskey, string memory location) public {
        require(hospitals[addresskey].id == 0, "Hospital already registered");
        _hospitalCounter.increment();
        uint256 hospitalId = _hospitalCounter.current();
        hospitals[addresskey] = Hospital(hospitalId, name, location, addresskey);
        hospitalAddresses.push(addresskey);
        _setupRole(HOSPITAL_ROLE, addresskey);
        emit HospitalRegistered(addresskey, name);
    }

    //working
    function registerPatient(string memory name, address addresskey, address hospitalAddress,string memory dob,
    string memory gender,
    string memory bloodGroup,
    string memory govId,
    string memory phone,
    string memory email ) public {
        _patientCounter.increment();
        uint256 patientId = _patientCounter.current();
        
        Patient memory newPatient = Patient(
            patientId,
            name,
            addresskey,
            hospitalAddress,
            dob,
            gender,
            bloodGroup,
            govId,
            phone,
            email
        );
        
        patients[addresskey].push(newPatient);
        
        if (patients[addresskey].length == 1) {
            patientAddresses.push(addresskey);
        }
        
        _setupRole(PATIENT_ROLE, addresskey);
        emit PatientRegistered(addresskey, name);
    }
    

    //working
    function storeRecord(address patientAddress, string memory encryptedData, string memory encryptionKey) 
    public onlyRole(HOSPITAL_ROLE) 
    {
        _recordCounter.increment();
        uint256 recordId = _recordCounter.current();
        address hospitalAddress = msg.sender;

        // Store multiple records per patient
        records[patientAddress].push(Record(recordId, patientAddress, hospitalAddress, encryptedData, encryptionKey));

        recordses.push(patientAddress);
        emit RecordStored(recordId, patientAddress, hospitalAddress);
    }

    //working
    function getAllHospitals() public view returns (Hospital[] memory) {
        Hospital[] memory allHospitals = new Hospital[](hospitalAddresses.length);
        for (uint256 i = 0; i < hospitalAddresses.length; i++) {
            allHospitals[i] = hospitals[hospitalAddresses[i]];
        }
        return allHospitals;
    }

    //working
    function getAllPatients() public view returns (Patient[] memory) {
        uint256 totalRegistrations = 0;
        for (uint256 i = 0; i < patientAddresses.length; i++) {
            totalRegistrations += patients[patientAddresses[i]].length;
        }
        Patient[] memory allPatients = new Patient[](totalRegistrations);
        uint256 currentIndex = 0;
    
        for (uint256 i = 0; i < patientAddresses.length; i++) {
            Patient[] memory patientRegistrations = patients[patientAddresses[i]];
            for (uint256 j = 0; j < patientRegistrations.length; j++) {
                allPatients[currentIndex] = patientRegistrations[j];
                currentIndex++;
            }
        }
        
        return allPatients;
    }

    //working
    function addConsent(address patientAddress, address hospitalAddress, bool consentGiven, string memory message) public onlyRole(HOSPITAL_ROLE) {
        require(consentGiven == true, "Consent value must be true");
        consents.push(Consent(hospitalAddress, patientAddress, consentGiven, message));
    }

    //working
    function getConsents() public view returns (Consent[] memory) {
        return consents;
    }

    //working
     function grantConsent(address hospitalAddress) public onlyRole(PATIENT_ROLE) {
        require(hasRole(HOSPITAL_ROLE, hospitalAddress), "Invalid hospital address");
        require(!patientConsents[msg.sender][hospitalAddress], "Consent already given");
        patientConsents[msg.sender][hospitalAddress] = true;
        emit ConsentGranted(msg.sender, hospitalAddress);
    }

    //working
    function revokeConsent(address hospitalAddress) public onlyRole(PATIENT_ROLE) {
        require(hasRole(HOSPITAL_ROLE, hospitalAddress), "Invalid hospital address");
        require(patientConsents[msg.sender][hospitalAddress], "No consent given to this hospital");
        patientConsents[msg.sender][hospitalAddress] = false;
        emit ConsentRevoked(msg.sender, hospitalAddress);
    }

    //working
    function getPatientConsent(address patientAddress, address hospitalAddress) 
    public 
    view 
    returns (bool) 
    {
        return patientConsents[patientAddress][hospitalAddress];
    }

    //working
    function viewMyRecord(address patientAddress) 
        public 
        view 
        onlyRole(PATIENT_ROLE) 
        returns (Record[] memory) 
    {
        require(msg.sender == patientAddress, "Can only view own records");
        require(records[patientAddress].length > 0, "No records found");
        return records[patientAddress];
    }

    //working
    function viewPatientData(address patientAddress) 
        public 
        view 
        onlyRole(HOSPITAL_ROLE) 
        returns (Record[] memory) 
    {
        require(patientConsents[patientAddress][msg.sender], "Access denied");
        require(records[patientAddress].length > 0, "No records found");
        return records[patientAddress];
    }


}
