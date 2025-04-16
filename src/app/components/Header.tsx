"use client";

import { Github, Wallet, LogOut } from "lucide-react";
import { useAppKit } from "@reown/appkit/react";
import { useAccount } from "wagmi";
import { useDisconnect } from "@reown/appkit/react";


export function Header() {
  const { disconnect } = useDisconnect();

  const { open } = useAppKit();
  const { address, isConnected } = useAccount();

  return (
    <header className="border-b border-[#1f1f1f] bg-[#0a0a0a]/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-semibold">Test Project</span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://github.com/chiragbadhe/test-project"
            target="_blank"
            rel="noopener noreferrer"
            className="items-center hidden sm:flex gap-2 text-sm px-4 py-2 rounded-lg border border-[#1f1f1f] hover:bg-[#1f1f1f] transition-colors"
          >
            <Github className="h-4 w-4" />
            <span>View on GitHub</span>
          </a>

          {isConnected ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => open()}
                className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-[#1f1f1f] hover:bg-[#1f1f1f] transition-colors"
              >
                <Wallet className="h-4 w-4" />
                <span>
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              </button>
              <button
                onClick={() => disconnect()}
                className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-[#1f1f1f] hover:bg-[#1f1f1f] transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Disconnect</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => open()}
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-[#1f1f1f] hover:bg-[#1f1f1f] transition-colors"
            >
              <Wallet className="h-4 w-4" />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
