"use client";

import { Header } from "@/app/components/Header";
import {  useDisconnect } from "@reown/appkit/react";
import { useRef, useState, useEffect, useCallback } from "react";
import { Timer, AlertCircle } from "lucide-react";
import { useAccount } from "wagmi";

export default function Home() {
  const [isTimerSet, setIsTimerSet] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const { disconnect } = useDisconnect();
  const { isConnected } = useAccount();

  const startCountdown = useCallback((initialTime: number) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const endTime = Date.now() + initialTime;

    intervalRef.current = setInterval(() => {
      const remaining = endTime - Date.now();

      if (remaining <= 0) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        handleSessionEnd();
        return;
      }

      setTimeRemaining(remaining);
    }, 1000);
  }, []);

  // Check existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/session", {
          credentials: 'include'
        });
        const data = await response.json();

        if (data.active && data.remainingTime > 0) {
          setIsTimerSet(true);
          setTimeRemaining(data.remainingTime);
          startCountdown(data.remainingTime);
        }
      } catch (error) {
        console.error("Failed to check session:", error);
      }
    };

    checkSession();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [startCountdown]);

  const handleSetTimer = async () => {
    if (!isConnected) {
      setSessionError("Please connect your wallet first");
      return;
    }

    const minutes = inputRef.current?.value;
    if (!minutes || isNaN(Number(minutes)) || Number(minutes) <= 0) {
      setSessionError("Please enter a valid number of minutes");
      return;
    }

    try {
      setIsLoading(true);
      setSessionError(null);

      console.log("Starting session with minutes:", minutes);
      const response = await fetch("/api/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({ minutes: Number(minutes) }),
      });

      const data = await response.json();
      console.log("Session response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to start timer");
      }

      setTimeRemaining(data.remainingTime);
      setIsTimerSet(true);
      startCountdown(data.remainingTime);
    } catch (error: unknown) {
      console.error("Timer setup failed:", error);
      setSessionError(error instanceof Error ? error.message : "Failed to start timer");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionEnd = async () => {
    try {
      setIsLoading(true);
      setSessionError(null);

      const response = await fetch("/api/session", {
        method: "DELETE",
        credentials: 'include'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to end session");
      }

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      disconnect();
      setIsTimerSet(false);
      setTimeRemaining(null);
    } catch (error: unknown) {
      console.error("Session end failed:", error);
      setSessionError(error instanceof Error ? error.message : "Failed to end session");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeRemaining = () => {
    if (!timeRemaining) return "0:00";
    const minutes = Math.floor(timeRemaining / (60 * 1000));
    const seconds = Math.floor((timeRemaining % (60 * 1000)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Header />
      <div className="container mx-auto px-4 flex flex-col items-center justify-center mt-[120px] space-y-12">
        <div className="max-w-2xl text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Welcome to Test Project
          </h1>
          <p className="mt-6 text-xl text-gray-400">
            A place to create, mint, and shape your onchain identity.
          </p>
        </div>

        <div className="w-full max-w-md bg-[#111111] p-8 border border-[#1f1f1f] rounded-xl shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <Timer className="w-6 h-6 text-blue-500" />
            <h2 className="text-2xl font-semibold">Session Timer</h2>
          </div>

          <div className="space-y-6">
            {sessionError && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{sessionError}</span>
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <input
                  ref={inputRef}
                  type="number"
                  min="1"
                  placeholder="Enter minutes"
                  disabled={isTimerSet || isLoading || !isConnected}
                  className="flex-1 px-4 py-3 bg-[#1f1f1f] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <button
                  disabled={isLoading || (!isConnected && !isTimerSet)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    isLoading || (!isConnected && !isTimerSet) ? "opacity-50 cursor-not-allowed " : ""
                  }${
                    isTimerSet
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                  onClick={() => {
                    if (isTimerSet) {
                      handleSessionEnd();
                    } else {
                      handleSetTimer();
                    }
                  }}
                >
                  {isLoading
                    ? "Processing..."
                    : isTimerSet
                    ? "End Session"
                    : "Start Session"}
                </button>
              </div>

              {isTimerSet && timeRemaining !== null && (
                <div className="text-center p-4 bg-[#1f1f1f] rounded-lg">
                  <span className="text-2xl font-mono text-blue-500">
                    {formatTimeRemaining()}
                  </span>
                  <p className="text-sm text-gray-400 mt-2">
                    Session will end automatically
                  </p>
                </div>
              )}
            </div>

            <p className="text-sm text-gray-400">
              {!isConnected 
                ? "Please connect your wallet to start a session timer"
                : "Set a secure session timer to automatically disconnect your wallet. Your session is managed server-side with secure cookies."}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
