"use client";

import { useEffect, useState } from "react";
import { initializeContract, determineUserRole, fetchPatients, fetchHospitals, fetchConsents, grantConsent, checkConsent, viewMyRecord, revokeConsent  } from "@/lib/contractFunctions";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button";
import { CheckCircle, Copy, Trash2 } from "lucide-react";
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
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea";
import {decryptPatientDataAES} from "@/lib/cryptoEncryption"
import { useRouter } from 'next/navigation';


const page = () => {
  const[name, setName] = useState('')
  const[account, setAccount] = useState('')
  const [consentStatus, setConsentStatus] = useState([])
  const [hospitals, setHospitals] = useState([])
  const [recordData, setRecordData] = useState([])
  const [status, setStatus] = useState([])
  const [decrypted, setDecrypted] = useState("")
  const [copied, setCopied] = useState(false);
  const { router } = useRouter();

  useEffect(() => {
      const init = async () => {
        try {
          const { account } = await initializeContract(); // Step 1: Initialize contract
          console.log("Contract Initialized");
          setAccount(account);
          if(account){
          const response = await determineUserRole(account);
          console.log("DeterminedRole:", response)
          if(response){
             if(response === "Patient"){
              console.log("Welcome")
              }else{
                 router.push("/")
                  alert("You Dont have Access")
                   }
               }
            }

          const patientData = await fetchPatients();
          console.log("fetched Patients:", patientData)
          await new Promise((resolve) => setTimeout(resolve, 0));
          if(patientData.length > 0){
             processPatientData(patientData, account)
          }
    
          // Step 3: Fetch hospitals
          const hospitalData = await fetchHospitals();
          console.log("Fetched Hospitals:", hospitalData);
          setHospitals(hospitalData);
          await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for state update
    
          // Step 4: Fetch consents
          const consentData = await fetchConsents();
          console.log("Consents:", consentData);
          setConsentStatus(consentData);
          await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for state update
    
          // Step 5: Process patient consents only if consentData is available
          if (consentData.length > 0) {
            const response = await processPatientConsents(consentData, account);
            console.log("Processed Consent Status:", response);
          }

          const response = await viewMyRecord(account)
          console.log("Record Data", response)
          setRecordData(response);

        } catch (error) {
          console.error(error);
        }
      };
    
      init();
    }, []);


    const processPatientData = (patientDatas, account) => {
      console.log("from for loop",account)

      const patientItem = patientDatas.find(item => item.patientAddress === account);
      if (patientItem) {
        setName(patientItem.name);
        console.log(patientItem.name);
      } else {
        console.log("No matching patient found for account:", account);
      }
    };


    const processPatientConsents = async (patientArray, account) => {
      if (!Array.isArray(patientArray) || patientArray.length === 0) {
          console.error("Invalid consent array or empty array.");
          return;
      }
  
      console.log("Account in processPatientConsents:", account);
      
      // Collect all statuses before updating state
      const statusUpdates = [];
  
      for (let i = 0; i < patientArray.length; i++) {
          const consentItem = patientArray[i];
          console.log(consentItem);
  
          if (consentItem.patientAddress === account) {
              console.log("Found matching consent:", consentItem);
              
              const resultStatus = await checkConsent(account, consentItem.hospitalAddress);
              console.log(`Status ${consentItem.hospitalAddress}:`, resultStatus);
              
              statusUpdates.push({ hospitalAddress: consentItem.hospitalAddress, status: resultStatus });
          }
      }
  
      // Update the state once with all statuses
      if (statusUpdates.length > 0) {
          setStatus((prevStatus) => [...prevStatus, ...statusUpdates]);
      }
  };
  

  const handleGrantConsent = async (hospitalAddress) => {
    console.log("Granting consent to hospital:", hospitalAddress);
    try {
      const response = await grantConsent(hospitalAddress);
      console.log("Consent granted:", response);
    } catch (error) {
      console.error("Consent grant error:", error);
    }
  }

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

  const handleRevokeConsent = async (hospitalAddress) =>{
    try{
      await revokeConsent(hospitalAddress);
      alert("Revoked Access!")
    }catch(error){
      console.log("Revoked!")
    }
  }


  return (
    <div className="min-h-screen m-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
          <h1 className="text-2xl md:text-3xl font-bold text-blue-900 mb-2">
              Hi {name},
            </h1>
            <h1 className="text-blue-900 font-bold">
              Your Address: {account}
            </h1>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            <p className="text-sm text-gray-600">
              Your medical records are stored securely on the blockchain.
            </p>
          </CardDescription>
        </CardContent>
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
                          <TableHead>Decryption Key</TableHead>
                        </TableRow>
                  </TableHeader>
       
        <TableBody>
          {
            recordData.length > 0 ? (
              recordData.map((record, index) =>(
                <TableRow key={record.encryptedData}>
                  <TableCell>{index +1}</TableCell>
                  <TableCell>{(() => {
                                const matchingPatient = hospitals.find(
                                  (patient) => patient.hospitalAddress === record.hospitalAddress
                                );
                                
                                return matchingPatient ? matchingPatient.name : "No Match";
                              })()}</TableCell>
                  <TableCell>{record.hospitalAddress}</TableCell>
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
                  <TableCell>{record.encryptionKey}</TableCell>
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
            <Card>
              <CardHeader>
                <CardTitle>Consent Requests</CardTitle>
              </CardHeader>
              <Table>
                  <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>AddressKey</TableHead>
                          <TableHead>Request Message</TableHead>
                          <TableHead>Request</TableHead>
                          <TableHead>Revoke</TableHead>
                        </TableRow>
                  </TableHeader>
                  <TableBody>
                    {consentStatus.length > 0 ? (
                      consentStatus.map((consent) => (
                        <TableRow key={consent.message}>
                          <TableCell>
                            {(() => {
                              const index = consentStatus.findIndex((item) => item.message === consent.message);
                              return index + 1;
                            })()}
                          </TableCell>
                          <TableCell>
                            {(() => {
                              const matchingPatient = hospitals.find(
                                (patient) => patient.hospitalAddress === consent.hospitalAddress
                              );
                              console.log(consent.patientAddress);
                              return matchingPatient ? matchingPatient.name : "No Match";
                            })()}
                          </TableCell>
                          <TableCell>{consent.hospitalAddress}</TableCell>
                          <TableCell>{consent.message}</TableCell>
                          <TableCell>
                            {status.some(item => item.hospitalAddress === consent.hospitalAddress && item.status === true) ? (
                              <span>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                Approved
                              </span>
                            ) : (
                              <Button size="sm" className="mr-2" onClick={() => handleGrantConsent(consent.hospitalAddress)}>
                                <span>Approve</span>
                              </Button>
                            )}
                          </TableCell>
                          <TableCell>
                            {status.some(item => item.hospitalAddress === consent.hospitalAddress && item.status === true) ? (
                              <Button variant="destructive" onClick={() => handleRevokeConsent(consent.hospitalAddress)}>
                                <span><Trash2 /> Revoke</span>
                              </Button>
                            ) : (
                              ""
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6}>No Consent Request</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
              </Table>
            </Card>
    </div>
  )
}

export default page;