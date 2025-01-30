"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"
import { Menu } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { nanoid } from "nanoid";
import Link from "next/link";

import Web3 from 'web3';
import { useState, useEffect } from 'react';
import MedicalDataTransfer from '@/contracts/MedicalDataTransfer.json'
  
const Navbar = () => {

    const [web3, setWeb3] = useState(null)
	const [account, setAccount] = useState(null)
    const [ medicalContract, setMedicalContract ] = useState(null)
    

    const loadBlockchainData = async () => {
		if (typeof window.ethereum !== 'undefined') {
			const web3 = new Web3(window.ethereum)
			setWeb3(web3)

			const accounts = await web3.eth.getAccounts()

			if (accounts.length > 0) {
				setAccount(accounts[0])
			}

			const networkId = await web3.eth.net.getId()

			const medi = new web3.eth.Contract(MedicalDataTransfer.abi, MedicalDataTransfer.networks[networkId].address)
			setMedicalContract(medi)

			// Event listeners...
			window.ethereum.on('accountsChanged', function (accounts) {
				setAccount(accounts[0])
			})

			window.ethereum.on('chainChanged', (chainId) => {
				window.location.reload();
			})
		}
	}

  // MetaMask Login/Connect
	const web3Handler = async () => {
		if (web3) {
			const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
			setAccount(accounts[0])
		}
	}

    useEffect(() => {
		loadBlockchainData()
	}, [account])

    return (
      <Card className="container bg-card py-3 px-4 border-0 flex items-center justify-between gap-6 rounded-2xl m-5">
        <div className="text-blue-900 font-bold">MedDataChain</div>
        <ul className="hidden md:flex items-center gap-10 text-card-foreground">
          <li className="text-primary font-medium">
            <a href="/">Home</a>
          </li>
          <li>
            <a href="#features">Features</a>
          </li>
          <li>
            <a href="/patient">Patient</a>
          </li>
          <li>
            <a href="#faqs">FAQs</a>
          </li>
          <li>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <span className="cursor-pointer">Pages</span>
              </DropdownMenuTrigger>
  
              <DropdownMenuContent align="start">
                {landings.map((page) => (
                  <DropdownMenuItem key={page.id}>
                    <Link href={page.route}>{page.title}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        </ul>
  
        <div className="flex items-center">
          {/* <Button variant="secondary" className="hidden md:block px-2">
            Login
          </Button> */}
          {/* <div className="border-2 p-2 rounded-lg text-blue-900 font-semibold">{props.userRole}</div> */}
          {account ? (
                  <div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden md:block ml-2 mr-2 border-2 p-2 rounded-lg cursor-pointer"
                            >
                            {account.slice(0, 5) + '...' + account.slice(38, 42)}
                          </a>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-base">Address: {account}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    </div>
                    
                        ) : (
                            // <Button onClick={web3Handler} className="hidden md:block ml-2 mr-2">Connect Wallet</Button>
                            <div></div>
                        )}
  
          <div className="flex md:hidden mr-2 items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <span className="py-2 px-2 bg-gray-100 rounded-md cursor-pointer">Pages</span>
              </DropdownMenuTrigger>
  
              <DropdownMenuContent align="start">
                {landings.map((page) => (
                  <DropdownMenuItem key={page.id}>
                    <Link href={page.route}>{page.title}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
  
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5 rotate-0 scale-100" />
                </Button>
              </DropdownMenuTrigger>
  
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <a href="/">Home</a>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <a href="#features">Features</a>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <a href="/patient">Patient</a>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <a href="#faqs">FAQs</a>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  {/* <Button variant="secondary" className="w-full text-sm">
                    Login
                  </Button> */}
                  {/* <div className="border-2 p-2 rounded-lg text-blue-900 font-semibold">{props.userRole}</div> */}
                </DropdownMenuItem>
                <DropdownMenuItem>
                    {account ? (
                    <div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden md:block ml-2 mr-2 border-2 p-2 rounded-lg cursor-pointer"
                            >
                            {account.slice(0, 5) + '...' + account.slice(38, 42)}
                          </a>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-base">Address: {account}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    </div>
                        ) : (
                            // <Button onClick={web3Handler}>Connect Wallet</Button>
                            <div></div>
                        )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>
    );
  };
  
  const landings = [
    {
      id: nanoid(),
      title: "Admin",
      route: "/admin",
    },
    {
      id: nanoid(),
      title: "Hospital",
      route: "/hospital",
    },
    {
      id: nanoid(),
      title: "Patient",
      route: "/patient",
    },
  ];
  
export default Navbar;