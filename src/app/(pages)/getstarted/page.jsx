"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { initializeContract, registerHospital, fetchHospitals } from '@/lib/contractFunctions'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'


const page = () => {
    const [newHospital, setNewHospital] = useState({ name: "", addresskey: "", location: "" })
    const router = useRouter();

    useEffect( () =>{
        const fetchcontract = async () =>{
            await initializeContract();
            console.log("Contract Initialized");
        }
        fetchcontract();
    }, [])

    const addHospital = async (e) => {
          e.preventDefault()
          const { name, addresskey, location } = newHospital
          if (name && addresskey && location) {
             await registerHospital(name, addresskey, location).then(
                router.push("/hospital")
             )
          }
        }

  return (
    <div className='flex justify-center m-12 mt-20'>
        <Card className="mb-8 w-[50vw]">
        <CardHeader>
          <CardTitle>Hospital Registeration</CardTitle>
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
  )
}

export default page