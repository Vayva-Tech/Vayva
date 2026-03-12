import React from "react";
import { PayoutAccount } from "@vayva/shared";
import { Button, Icon } from "@vayva/ui";

interface BankCardProps {
  account?: PayoutAccount;
}

export const BankCard = ({ account }: BankCardProps) => {
  return (
    <div className="bg-background rounded-2xl border border-border p-6 flex flex-col h-full relative overflow-hidden hover:border-border transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Icon name="Landmark" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-text-primary">Payout Account</h3>
            <p className="text-xs text-text-tertiary">
              Where you receive funds
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1">
        {account ? (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Icon name="Landmark" size={64} />
            </div>
            <p className="text-xs text-text-tertiary font-bold uppercase tracking-widest mb-4">
              Linked Account
            </p>
            <p className="text-lg font-bold mb-1">{account.bankName}</p>
            <p className="font-mono text-text-tertiary tracking-wider text-sm mb-4">
              {account.accountNumber}
            </p>
            <div className="flex items-center gap-2 text-[10px] text-green-300 bg-green-900/30 w-fit px-2 py-1 rounded">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
              VERIFIED FOR PAYOUTS
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 text-sm">
            <p className="font-bold text-amber-900 mb-1 flex items-center gap-2">
              <Icon name="Info" size={14} /> No Account Linked
            </p>
            <p className="text-amber-800">
              You cannot withdraw funds until you link a valid bank account
              matching your KYC name.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6">
        <Button variant="outline" className="w-full gap-2 text-text-secondary">
          <Icon name="Settings" size={16} /> Manage Bank Details
        </Button>
      </div>
    </div>
  );
};
