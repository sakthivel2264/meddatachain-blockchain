"use client";

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Lock, Users, FileText, Zap, CheckCircle } from "lucide-react"
import Link from "next/link";
import Web3 from 'web3';
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

    const web3Handler = async (route) => {
      const web3 = new Web3(window.ethereum)
      if (web3) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if(accounts[0]){
          router.push(`/${route}`)
        }
      }
    }


  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold mb-4 text-blue-900">MedDataChain: Secure EMR Transfer</h1>
        <p className="text-xl mb-8 text-gray-600">
          Revolutionizing healthcare data management with blockchain technology
        </p>
          <Button className="btn-primary text-lg h-12 mb-8" onClick={()=>web3Handler("getstarted")}>Get Started</Button>
          <p className="text-xl mb-4 text-gray-600">
          Are You a Patient?
          </p>
          <Button onClick={()=>web3Handler("patient")}>Login</Button>
      </section>
      

      {/* Key Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-semibold mb-8 text-center text-blue-900">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Shield className="h-10 w-10 text-blue-600" />,
              title: "Blockchain Security",
              description: "Immutable storage of EMR hashes on a private blockchain",
            },
            {
              icon: <Lock className="h-10 w-10 text-blue-600" />,
              title: "AES-256 Encryption",
              description: "Off-chain storage of encrypted EMR data",
            },
            {
              icon: <Users className="h-10 w-10 text-blue-600" />,
              title: "Role-Based Access",
              description: "Smart contracts ensure compliance with RBAC",
            },
          ].map((feature, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <CardTitle className="flex justify-center">{feature.icon}</CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-blue-900 text-white py-16">
        <div className="container">
          <h2 className="text-3xl font-semibold mb-8 text-center">Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { icon: <FileText className="h-6 w-6" />, text: "Enhanced data integrity and confidentiality" },
              { icon: <Zap className="h-6 w-6" />, text: "Efficient and secure inter-hospital data transfer" },
              { icon: <CheckCircle className="h-6 w-6" />, text: "Patient-controlled access to medical records" },
              { icon: <Shield className="h-6 w-6" />, text: "Robust audit trail for improved transparency" },
            ].map((benefit, index) => (
              <div key={index} className="flex items-center space-x-4">
                {benefit.icon}
                <span>{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-semibold mb-8 text-center text-blue-900">How It Works</h2>
        <ol className="list-decimal list-inside space-y-4 text-gray-700">
          <li>EMRs are converted into secure hashes using cryptographic algorithms</li>
          <li>Hashes are stored immutably on a blockchain network</li>
          <li>Actual EMR data is encrypted with AES-256 and stored off-chain</li>
          <li>Smart contracts validate data transfer requests between hospitals</li>
          <li>Patients can grant or revoke access to their data through digital signatures</li>
        </ol>
      </section>

      {/* Call to Action Section */}
      <section className="bg-blue-100 py-16 text-center">
        <div className="container">
          <h2 className="text-3xl font-semibold mb-4 text-blue-900">Ready to Transform Your EMR Management?</h2>
          <p className="text-xl mb-8 text-gray-600">Join the healthcare revolution with MedDataChain</p>
          <button className="btn-primary text-lg">Request a Demo</button>
        </div>
      </section>
    </div>
  );
}
