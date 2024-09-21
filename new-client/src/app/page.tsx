// @ts-nocheck
"use client";

import { useState } from "react";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useBalance,
} from "wagmi";
import { parseEther } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import { AlertCircle, Zap, PlusCircle, User, Wallet } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/alert";

const CONTRACT_ADDRESS = "0x...";
const CONTRACT_ABI: any = [
  /* ... */
];

export default function Home() {
  const { address, isConnected } = useAccount();
  const [topUpAmount, setTopUpAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { data: balance } = useBalance({
    address: address,
  });

  const { data: isRegistered } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "isRegistered",
    args: [address],
  });

  const { data: isOwner } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "owner",
  });

  const { writeAsync: registerUser, isPending: isRegisterLoading } =
    useContractWrite({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "registerUser",
    });

  const { writeAsync: topUp, isPending: isTopUpLoading } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "topUp",
  });

  const { writeAsync: withdraw, isPending: isWithdrawLoading } =
    useContractWrite({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "withdraw",
    });

  const handleRegister = async () => {
    try {
      await registerUser();
      setSuccess("Registration successful!");
    } catch (err) {
      setError("Registration failed. Please try again.");
    }
  };

  const handleTopUp = async () => {
    try {
      await topUp({
        args: [],
        value: parseEther(topUpAmount),
      });
      setSuccess("Top-up successful!");
      setTopUpAmount("");
    } catch (err) {
      setError("Top-up failed. Please try again.");
    }
  };

  const handleWithdraw = async () => {
    try {
      await withdraw();
      setSuccess("Withdrawal successful!");
    } catch (err) {
      setError("Withdrawal failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Pay-As-You-Go Electricity dApp
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <ConnectButton />
          </div>
          {isConnected && !isRegistered && (
            <Alert>
              <User className="h-4 w-4" />
              <AlertTitle>Register your account</AlertTitle>
              <AlertDescription>
                You need to register before using the dApp.
                <Button
                  onClick={handleRegister}
                  disabled={isRegisterLoading}
                  className="mt-2"
                >
                  {isRegisterLoading ? "Registering..." : "Register Now"}
                </Button>
              </AlertDescription>
            </Alert>
          )}
          {isConnected && isRegistered && (
            <Tabs defaultValue="dashboard">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                {isOwner === address && (
                  <TabsTrigger value="admin">Admin Panel</TabsTrigger>
                )}
              </TabsList>
              <TabsContent value="dashboard">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Dashboard</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Current Balance:</span>
                        <span className="text-2xl font-bold">
                          {balance?.formatted} {balance?.symbol}
                        </span>
                      </div>
                      <div>
                        <Input
                          type="number"
                          placeholder="Amount to top up (ETH)"
                          value={topUpAmount}
                          onChange={(e) => setTopUpAmount(e.target.value)}
                        />
                        <Button
                          onClick={handleTopUp}
                          disabled={isTopUpLoading || !topUpAmount}
                          className="mt-2 w-full"
                        >
                          {isTopUpLoading ? "Processing..." : "Top Up"}
                          <PlusCircle className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              {isOwner === address && (
                <TabsContent value="admin">
                  <Card>
                    <CardHeader>
                      <CardTitle>Admin Panel</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={handleWithdraw}
                        disabled={isWithdrawLoading}
                        className="w-full"
                      >
                        {isWithdrawLoading ? "Processing..." : "Withdraw Funds"}
                        <Wallet className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          )}
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert variant="default" className="mt-4">
              <Zap className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
