"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2 } from "lucide-react"
import { determineUserRole } from '@/lib/contractFunctions';

const page = () => {
    const router = useRouter();

    useEffect(() => {
          const fetchData = async () =>{
            const { account } = await initializeContract();
            console.log("Contract Initialized");
            if(account){
              const response = await determineUserRole(account);
              console.log("DeterminedRole:", response)
              if(response){
                if(response === "Admin"){
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
    <main className="lg:-mx-36">
        <MedicalDataComponent/>
    </main>
  )
}

export default page;

import React, { useState, useEffect } from "react";
import {
  initializeContract,
  fetchHospitals,
  registerHospital,
  fetchPatients
} from "@/lib/contractFunctions"; // Import the functions
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"


const MedicalDataComponent = () => {
  const [hospitals, setHospitals] = useState([]);
  const [patients, setPatients] = useState([]);
  const [newHospital, setNewHospital] = useState({ name: "", addresskey: "", location: "" })
  const [loading, setLoading] = useState(false);

  // Fetch hospitals and doctors on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await initializeContract();
        const hospitalsList = await fetchHospitals();
        setHospitals(hospitalsList);
        console.log("Fetched Hospitals:", hospitalsList);
        const patientsList = await fetchPatients();
        setPatients(patientsList);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

    const addHospital = async (e) => {
      e.preventDefault()
      const { name, addresskey, location } = newHospital
      if (name && addresskey && location) {
         await registerHospital(name, addresskey, location).then(() => fetchHospitals())
      }
    }


  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Medical Data Management</h1>
      {loading && <p>Loading...</p>}
        <Card className="mb-8">
        <CardHeader>
          <CardTitle>Hospitals</CardTitle>
        </CardHeader>
        <CardContent>
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No.</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>AddressKey</TableHead>
                <TableHead>Location</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hospitals.map((hospital, index) => (
                <TableRow key={hospital.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{hospital.name}</TableCell>
                  <TableCell>{hospital.hospitalAddress}</TableCell>
                  <TableCell>{hospital.location}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </CardContent>
        <CardFooter>
        </CardFooter>
      </Card>
        <Card className="mb-8">
        <CardHeader>
          <CardTitle>Patients</CardTitle>
          <CardDescription>Total Patients in Different Hospitals</CardDescription>
        </CardHeader>
        <CardContent>
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No.</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>AddressKey</TableHead>
                <TableHead>HospitalAddress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient,index) => (
                <TableRow key={patient.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell>{patient.patientAddress}</TableCell>
                  <TableCell>{patient.hospitalAddress}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </CardContent>
        <CardFooter>
        </CardFooter>
      </Card>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add New Hospital</CardTitle>
          <CardDescription>Enter the details of the new hospital</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={addHospital} className="space-y-4">
            <div>
              <Label htmlFor="name">Hospital Name</Label>
              <Input
                id="name"
                value={newHospital.name}
                onChange={(e) => setNewHospital({ ...newHospital, name: e.target.value })}
                placeholder="Enter hospital name"
                required
              />
            </div>
            <div>
              <Label htmlFor="address">AddressKey</Label>
              <Input
                id="address"
                value={newHospital.addresskey}
                onChange={(e) => setNewHospital({ ...newHospital, addresskey: e.target.value })}
                placeholder="Enter hospital address"
                required
              />
            </div>
            <div>
              <Label htmlFor="phoneNumber">Location</Label>
              <Input
                id="phoneNumber"
                value={newHospital.location}
                onChange={(e) => setNewHospital({ ...newHospital, location: e.target.value })}
                placeholder="Enter Location"
                required
              />
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button onClick={addHospital} className="w-full">
            <Plus className="mr-2 h-4 w-4" /> Add Hospital
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

