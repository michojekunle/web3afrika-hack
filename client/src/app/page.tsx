'use client'

import { useState } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip } from "@/components/ui/tooltip"
import { TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { Moon, Sun } from "lucide-react"

// ABI and contract address would be imported from a separate file in a real application
const contractABI = [
  // ... (contract ABI would go here)
] as const

const contractAddress = "0x..." as const

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [eventId, setEventId] = useState<string>('')
  const [eventName, setEventName] = useState<string>('')
  const [eventDate, setEventDate] = useState<string>('')
  const [nftAddress, setNftAddress] = useState<string>('')
  const [maxCapacity, setMaxCapacity] = useState<string>('')
  const { address, isConnected } = useAccount()
  const { toast } = useToast()

  const { data: isOwner } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: 'owner',
  })

  const { writeContract: createEvent, data: createEventData } = useWriteContract()

  const { writeContract: register, data: registerData } = useWriteContract()

  const { data: eventDetails, isLoading: isLoadingEventDetails } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: 'getEventDetails',
    args: eventId ? [BigInt(eventId)] : undefined,
  })

  const { writeContract: toggleEventStatus, data: toggleEventStatusData } = useWriteContract()

  const { isLoading: isCreatingEvent } = useWaitForTransactionReceipt({
    hash: createEventData,
  })

  const { isLoading: isRegistering } = useWaitForTransactionReceipt({
    hash: registerData,
  })

  const { isLoading: isTogglingStatus } = useWaitForTransactionReceipt({
    hash: toggleEventStatusData,
  })

  const handleCreateEvent = () => {
    if (createEvent) {
      createEvent({
        address: contractAddress,
        abi: contractABI,
        functionName: 'createEvent',
        args: [eventName, BigInt(new Date(eventDate).getTime() / 1000), nftAddress, BigInt(maxCapacity)],
      })
      toast({
        title: "Creating Event",
        description: "Your event is being created. Please wait for confirmation.",
      })
    }
  }

  const handleRegister = () => {
    if (register && eventId) {
      register({
        address: contractAddress,
        abi: contractABI,
        functionName: 'registerForEvent',
        args: [BigInt(eventId)],
      })
      toast({
        title: "Registering",
        description: "Your registration is being processed. Please wait for confirmation.",
      })
    }
  }

  const handleToggleStatus = () => {
    if (toggleEventStatus && eventId) {
      toggleEventStatus({
        address: contractAddress,
        abi: contractABI,
        functionName: 'toggleEventStatus',
        args: [BigInt(eventId)],
      })
      toast({
        title: "Toggling Event Status",
        description: "The event status is being updated. Please wait for confirmation.",
      })
    }
  }

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="container mx-auto p-4">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">NFT Gated Event Manager</h1>
          <div className="flex items-center space-x-4">
            <ConnectButton />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={toggleTheme}>
                    {theme === 'light' ? <Moon className="h-[1.2rem] w-[1.2rem]" /> : <Sun className="h-[1.2rem] w-[1.2rem]" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle theme</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </header>

        {isConnected && isOwner === address && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Create Event</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="eventName">Event Name</Label>
                <Input id="eventName" value={eventName} onChange={(e: any) => setEventName(e.target.value)} placeholder="Enter event name" />
              </div>
              <div>
                <Label htmlFor="eventDate">Event Date</Label>
                <Input id="eventDate" type="datetime-local" value={eventDate} onChange={(e:any) => setEventDate(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="nftAddress">NFT Contract Address</Label>
                <Input id="nftAddress" value={nftAddress} onChange={(e:any) => setNftAddress(e.target.value)} placeholder="Enter NFT contract address" />
              </div>
              <div>
                <Label htmlFor="maxCapacity">Max Capacity</Label>
                <Input id="maxCapacity" type="number" value={maxCapacity} onChange={(e:any) => setMaxCapacity(e.target.value)} placeholder="Enter max capacity" />
              </div>
              <Button onClick={handleCreateEvent} disabled={isCreatingEvent}>
                {isCreatingEvent ? 'Creating...' : 'Create Event'}
              </Button>
            </div>
          </section>
        )}

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Register for Event</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="registerEventId">Event ID</Label>
              <Input id="registerEventId" type="number" value={eventId} onChange={(e: any) => setEventId(e.target.value)} placeholder="Enter event ID" />
            </div>
            <Button onClick={handleRegister} disabled={isRegistering}>
              {isRegistering ? 'Registering...' : 'Register'}
            </Button>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">View Event Details</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="viewEventId">Event ID</Label>
              <Input id="viewEventId" type="number" value={eventId} onChange={(e:any) => setEventId(e.target.value)} placeholder="Enter event ID" />
            </div>
            <Button onClick={() => {}} disabled={isLoadingEventDetails}>
              {isLoadingEventDetails ? 'Loading...' : 'View Details'}
            </Button>
            {eventDetails && (
              <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p><strong>Name:</strong> {eventDetails[0]}</p>
                <p><strong>Date:</strong> {new Date(Number(eventDetails[1]) * 1000).toLocaleString()}</p>
                <p><strong>Max Capacity:</strong> {eventDetails[2].toString()}</p>
                <p><strong>Registered Count:</strong> {eventDetails[3].toString()}</p>
                <p><strong>Status:</strong> {eventDetails[4] ? 'Active' : 'Inactive'}</p>
                {isOwner === address && (
                  <div className="mt-2">
                    <Label htmlFor="eventStatus">Event Status</Label>
                    <Switch
                      id="eventStatus"
                      checked={eventDetails[4]}
                      onCheckedChange={handleToggleStatus}
                      disabled={isTogglingStatus}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}