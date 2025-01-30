"use client";

import React from 'react'
import { useRouter } from 'next/navigation';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import {decryptPatientDataAES} from "@/lib/cryptoEncryption"
import { Copy } from "lucide-react"
import { initializeContract, determineUserRole } from '@/lib/contractFunctions';

const page = () => {

  const [selectedItem, setSelectedItem] = useState("")
    const router = useRouter();

    useEffect(() => {
      const fetchData = async () =>{
        const { account } = await initializeContract();
        console.log("Contract Initialized");
        if(account){
          const response = await determineUserRole(account);
          console.log("DeterminedRole:", response)
          if(response){
            if(response === "Hospital"){
              console.log("Welcome")
            }else{
              router.push("/")
              alert("You Dont have Access")
            }
          }
        }
      }
      fetchData();
  }, []);


  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <AppSidebar onSelectItem={setSelectedItem} />
        <SidebarInset className="flex-1 p-4 lg:p-8 bg-transparent">
        <div className="min-w-screen mx-auto">
          <div className='flex flex-col items-center'>
          <h1 className="text-2xl md:text-3xl font-bold text-blue-900 mb-6">
              Hospital
            </h1>
            <div className="w-full">
              <RecordSharing selectedItem={selectedItem} />
            </div>
          </div>
        </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

export default page;


import { Home, FileText, Settings, HelpCircle, Plus, FileJson, Share2, CheckCircle } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

const menuItems = [
  { id: "patientdetails", label: "Patient Details", icon: Home },
  { id: "addnewpatient", label: "AddNew Patient", icon: Plus },
  { id: "addpatientrecord", label: "AddPatient Record", icon: Settings },
  { id: "requestrecord", label: "Request Record", icon: HelpCircle },
  {id: "viewpatientrecord", label: "View Patient Record", icon: FileText},

]

export function AppSidebar({ onSelectItem }) {
  return (
    <Sidebar className="w-32 bg-white border-r h-[70vh] top-32 rounded-tr-lg rounded-br-lg ">
      <SidebarHeader>
        <h2 className="text-xl font-bold p-4">Menu</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id} className="h-14">
                  <SidebarMenuButton onClick={() => onSelectItem(item.id)} className="flex items-center justify-center w-full h-full hover:bg-blue-300">  
                    <item.icon className="mr-1 h-8 w-4 " />
                    <div className="break-words inline-block w-[12ch]">
                      {item.label}
                    </div>

                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}



import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { registerPatient, fetchPatients, fetchHospitals, storeRecord, AskforConsent, fetchConsents, checkConsent, viewPatientRecord } from '@/lib/contractFunctions';
import { Textarea } from '@/components/ui/textarea';
import { encryptPatientDataAES } from '@/lib/cryptoEncryption';


function RecordSharing({ selectedItem }) {
  const [hospitals, setHospitals] = useState([])
  const [patients, setPatients] = useState([])
  const [consentStatus, setConsentStatus] = useState([])
  const [status, setStatus] = useState(false)
  const [message, setMessage] = useState("")
  const [account, setAccount] = useState("")
  const [selectedPatient, setSelectedPatient] = useState("")
  const [newPatient, setNewPatient] = useState({ name: "", addresskey: "" })
  const [PatientData, setPatientData] = useState({ addresskey: "", encryptedData: "", encryptionKey: "" })
  const [diagnosisData, setDiagnosisData] = useState("")
  const [ encryptedData, setEncryptedData] = useState("")
  const [recordData, setRecordData] = useState([])
  const [decrypted, setDecrypted] = useState("")
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const {account} = await initializeContract(); // Step 1: Initialize contract
        console.log("Contract Initialized");
        setAccount(account);
        // Step 2: Fetch patients
        const patientData = await fetchPatients();
        console.log("Patients:", patientData);
        if (patientData && Array.isArray(patientData)) {
          const matchedPatients = patientData.filter(patient => patient.hospitalAddress === account);
          
          if (matchedPatients.length > 0) {
            setPatients(matchedPatients);
            console.log(matchedPatients);
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for state update
  
        // Step 3: Fetch hospitals
        const hospitalData = await fetchHospitals();
        console.log("Fetched Hospitals:", hospitalData);
        setHospitals(hospitalData);
        await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for state update
  
        // Step 4: Fetch consents
        const consentData = await fetchConsents();
        console.log("Consents:", consentData);

        if (consentData && Array.isArray(consentData)) {
          const matchedPatients = consentData.filter(patient => patient.hospitalAddress === account);
          
          if (matchedPatients.length > 0) {
            setConsentStatus(matchedPatients);
            console.log(matchedPatients);
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for state update
  
        // Step 5: Process patient consents only if consentData is available
        if (consentData.length > 0) {
          const response = await processPatientConsents(consentData, account);
          console.log("Processed Consent Status:", response);
          setStatus(response);
          await new Promise((resolve) => setTimeout(resolve, 0));
        }

      } catch (error) {
        console.error(error);
      }
    };
  
    init();
  }, []);
  

        const processPatientConsents = async (consentArray, account) => {
          if (!Array.isArray(consentArray) || consentArray.length === 0) {
            console.error("Invalid consent array or empty array.");
            return;
          }
        
          for (let i = 0; i < consentArray.length; i++) {
            const consentItem = consentArray[i];
            const { patientAddress } = consentItem;
        
            if (!patientAddress) {
              console.error(`Invalid data at index ${i}:`, consentItem);
              continue;
            }
            
        
            try {
              const result = await checkConsent(patientAddress, account);
              console.log(`Consent result for patient ${patientAddress}:`, result);
              return result;
            } catch (error) {
              console.error(`Error processing consent for patient ${patientAddress}:`, error);
            }
          }
        };
        

          const handleDecryption = async (data, key) =>{
            const response = await decryptPatientDataAES(data, key)
            setDecrypted(response)
          }

          const handleCopy = async () => {
            try {
              await navigator.clipboard.writeText(decrypted);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            } catch (err) {
              console.error("Failed to copy:", err);
            }
          };

  const addPatient = async (e) => {
    e.preventDefault()
    const { name, addresskey } = newPatient
    if (name && addresskey) {
      const added = await registerPatient(name, addresskey, account)
    }
  }

  const addPatientData = async (e) => {
    e.preventDefault()
    console.log("Submitting",PatientData)
    const encryptedData1 = encryptedData.encryptedData;
    const { addresskey, encryptionKey } = PatientData
    if (addresskey && encryptedData1 && encryptionKey) {
      const added = await storeRecord(addresskey, encryptedData1, encryptionKey)
      console.log("Patient Data", PatientData)
    }
  }

 
  const handleEncryption = async (e) => {
    e.preventDefault()
    console.log(PatientData.addresskey)
    if (PatientData.addresskey && diagnosisData) {
      
      const encryptedData = encryptPatientDataAES(diagnosisData)
      setEncryptedData(encryptedData);
      setPatientData({ ...PatientData, encryptedData: encryptedData.encryptedData })
      setPatientData({ ...PatientData, encryptionKey: encryptedData.iv })
      console.log("Encrypted Data", encryptedData)
    }
  }

  const requestPatientConsent = async (e) => {
    e.preventDefault()
    if (selectedPatient && message) {
      await AskforConsent( selectedPatient, account, true, message)
      alert("Request sent successfully!");
    }
  }

  const viewOurPatientRecord = async () => {
    try{
      const record = await viewPatientRecord(selectedPatient)
      setRecordData(record);
    }catch(error){
      console.log("cannot able to view Record", error)
    }
  }
  

  const renderContent = () => {
    switch (selectedItem) {
      case "addnewpatient":
        return (<Card className="mb-8 w-[70vw]">
        <CardHeader>
          <CardTitle>Add New Patient</CardTitle>
          <CardDescription>Enter the details of the new patient</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={addPatient} className="space-y-4">
            <div>
              <Label htmlFor="name">Patient Name</Label>
              <Input
                id="name"
                value={newPatient.name}
                onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                placeholder="Enter patient name"
                required
              />
            </div>
            <div>
              <Label htmlFor="addresskey">Address Key</Label>
              <Input
                id="addressKey"
                value={newPatient.addresskey}
                onChange={(e) => setNewPatient({ ...newPatient, addresskey: e.target.value })}
                placeholder="Enter Address key"
                required
              />
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button onClick={addPatient} className="w-full">
            <Plus className="mr-2 h-4 w-4" /> Add Patient
          </Button>
        </CardFooter>
      </Card>);

    case "addpatientrecord":
      return (
        <div>
      <Card className="mb-8 w-[70vw]">
        <CardHeader>
          <CardTitle>Add Patient Record</CardTitle>
          <CardDescription> add diagnosis data for a patient</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="patientForDiagnosis">Select Patient</Label>
              <Select onValueChange={(value) => setPatientData({ addresskey: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.patientAddress} onChange={(e) => setPatientData({ ...PatientData, addresskey: e.target.value })}>
                      {patient.name}{patient.patientAddress
                      }
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="diagnosisData">Diagnosis Data (JSON)</Label>
              <Textarea
                id="diagnosisData"
                value={diagnosisData}
                onChange={(e) => setDiagnosisData(e.target.value)}
                placeholder="Enter diagnosis data in JSON format"
              />
              <Button onClick={handleEncryption} className="w-full">
            <FileJson className="mr-2 h-4 w-4" /> Encrypt
          </Button>
            </div>
            <div>
                <Label htmlFor="encryptedData">Encrypted Data</Label>
                <Input
                  id="encryptedData"
                  defaultValue={encryptedData.encryptedData }
                  placeholder="Enter encrypted data"
                  readOnly
                />
              </div>

          </div>
        </CardContent>
        <CardFooter>
            <Button onClick={addPatientData} className="w-full">
              <Plus className="mr-2 h-4 w-4" /> Add Patient Data
            </Button>
          </CardFooter>
      </Card>
      </div>);



      case "requestrecord":
        return (
          <div>
          <Card className="mb-8">
        <CardHeader>
          <CardTitle>Request Patient Consent for Record or Sharing Record</CardTitle>
          <CardDescription>Select a hospital and patient to request a record</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="patient">Select Patient</Label>
              <Select onValueChange={setSelectedPatient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.patientAddress}>
                      {patient.name}<br/>
                      {patient.patientAddress}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* <div>or</div>
            <div>
                  <Label htmlFor="patientaddress">Patient Address</Label>
                  <Input
                  id="patientAdress"
                  placeholder="Enter Patient Adress"
                  value={selectedPatient?? ""}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  />
            </div> */}
            <div>
              <Label htmlFor="hospital">Add Request Message</Label>
              <Textarea
                id="message"
                placeholder="Enter a message for the patient"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={requestPatientConsent} className="w-full">
            <Share2 className="mr-2 h-4 w-4" /> Request Permission
          </Button>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Consent Requests Status</CardTitle>
        </CardHeader>
        <Table>
            <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>AddressKey</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
            </TableHeader>
            <TableBody>
              {consentStatus.length > 0 ?(
                consentStatus.map((consent) => (
                <TableRow key={consent.message}>
                      <TableCell>{(()=>{
                        const index = consentStatus.findIndex((item) => item.message === consent.message);
                          return index + 1;
                      }) ()}</TableCell>
                      <TableCell>
                        {(() => {
                          const matchingPatient = patients.find(
                            (patient) => patient.patientAddress === consent.patientAddress
                          );
                          console.log(consent.patientAddress)
                          return matchingPatient ? matchingPatient.name : "No Match";
                        })()}
                      </TableCell>
                      <TableCell>{consent.patientAddress}</TableCell>
                      <TableCell>{consent.message}</TableCell>
                      <TableCell>{status?<span><CheckCircle className="h-4 w-4 text-green-500"/>Approved</span>:"Pending..."}</TableCell>
                </TableRow>
                ))
              ): (
                <TableRow>
                <TableCell colSpan={3}>No Consent Request</TableCell>
              </TableRow>
              )}
            </TableBody>
        </Table>
      </Card>
      </div>
  )

        case "viewpatientrecord":
          return(
            <div>
            <Card>
                <CardHeader>
                  <CardTitle>Patient Records</CardTitle>
                </CardHeader>
                <CardContent>
                <div>
                  <Label htmlFor="patient">Select Patient</Label>
                  <Select onValueChange={setSelectedPatient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.patientAddress}>
                          {patient.name}<br/>
                          {patient.patientAddress}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={viewOurPatientRecord} className="w-full">
                     View Record
                  </Button>
                </CardFooter>
            </Card>
            <Card className="mb-6">
        <CardHeader>
          <CardTitle>MyRecords</CardTitle>
        </CardHeader>
        <Table>
        <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Hospital Name</TableHead>
                          <TableHead>Hospital Address</TableHead>
                          <TableHead>Encrypted Data</TableHead>
                        </TableRow>
                  </TableHeader>
       
        <TableBody>
          {
            recordData.length > 0 ? (
              recordData.map((record, index) =>(
                <TableRow key={record.encryptedData}>
                  <TableCell>{index +1}</TableCell>
                  <TableCell>{(() => {
                                const matchingPatient = patients.find(
                                  (patient) => patient.patientAddress === record.patientAddress
                                );
                                
                                return matchingPatient ? matchingPatient.name : "No Match";
                              })()}</TableCell>
                  <TableCell>{record.patientAddress}</TableCell>
                  <TableCell>{record.encryptedData?.slice(0, 30)}
                  <Dialog>
                        <DialogTrigger asChild>
                          <Button onClick={() => handleDecryption(record.encryptedData, record.encryptionKey)} className="ml-2">View Record</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Your Decrypted Record</DialogTitle>
                            <DialogDescription>
                              Anyone who has this link will be able to view this.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex items-center space-x-2">
                            <div className="grid flex-1 gap-2">
                              <Label htmlFor="link" className="sr-only">
                                Link
                              </Label>
                              <Textarea
                                id="link"
                                defaultValue={decrypted}
                                className="h-96"
                                readOnly
                              />
                            </div>
                            <Button type="button" size="sm" className="px-3" onClick={handleCopy}>
                              <span className="sr-only">Copy</span>
                              <Copy />
                            </Button>
                            {copied && <span className="text-green-500 text-sm">Copied!</span>}
                          </div>
                          <DialogFooter className="sm:justify-start">
                            <DialogClose asChild>
                              <Button type="button" variant="secondary">
                                Close
                              </Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                  </TableCell>
                </TableRow>
                  ))
                ) : (
                    <TableRow>
                            <TableCell colSpan={3}>No Record Found</TableCell>
                    </TableRow>
                  )}
              </TableBody>
              </Table>
            </Card>
            </div>
          )

        default:
          return (
            <Card className="mb-8 w-[70vw]">
            <CardHeader>
              <CardTitle>Patient Details</CardTitle>
              <CardDescription>Manage incoming Patients</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>AddressKey</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.length > 0 ? (
                    patients.map((patient, index) => (
                      <TableRow key={index}>
                        <TableCell>{index+1}</TableCell>
                        <TableCell>{patient.name}</TableCell>
                        <TableCell>{patient.patientAddress}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3}>No patients available</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>)
    }
  }
    return <div className="h-full">{renderContent()}</div>;

  }