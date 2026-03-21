import React from "react";
import { Button, Icon, Switch } from "@vayva/ui";

interface WhatsAppSettingsCardProps {
  isConnected: boolean;
  number?: string;
}

export const WhatsAppSettingsCard = ({
  isConnected,
  number,
}: WhatsAppSettingsCardProps) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col h-full relative overflow-hidden hover:border-gray-100 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center">
            <Icon name="MessageCircle" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">WhatsApp Agent</h3>
            <p className="text-xs text-gray-400">Automation settings</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400 uppercase">
            {isConnected ? "On" : "Off"}
          </span>
          <Switch
            checked={isConnected}
            onCheckedChange={() => {}}
            disabled={!isConnected}
          />
        </div>
      </div>

      <div className="flex-1">
        {isConnected ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white/40 rounded-xl">
              <span className="text-sm font-medium text-gray-500">
                Connected Number
              </span>
              <span className="text-sm font-mono font-bold text-gray-900">
                {number}
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Your AI agent is active and handling customer inquiries.
              <span className="block mt-1 text-green-600 font-bold">
                128 messages handled this week.
              </span>
            </p>
          </div>
        ) : (
          <div className="bg-white/40 rounded-xl p-4 text-sm">
            <p className="font-bold text-gray-900 mb-1">
              Agent Disconnected
            </p>
            <p className="text-gray-500">
              Connect your WhatsApp Business number to enable automated order
              updates and support.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6">
        {isConnected ? (
          <Button
            variant="ghost"
            className="w-full gap-2 text-gray-400 hover:text-red-600 hover:bg-red-50"
          >
            Disconnect Agent
          </Button>
        ) : (
          <Button className="w-full gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white border-none">
            <Icon name="Link" size={16} /> Connect WhatsApp
          </Button>
        )}
      </div>
    </div>
  );
};
