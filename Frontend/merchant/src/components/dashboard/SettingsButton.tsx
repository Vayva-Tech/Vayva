'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SettingsPanel } from '../settings-panel';
import { Gear } from '@phosphor-icons/react/ssr';

interface SettingsButtonProps {
  className?: string;
}

export function SettingsButton({ className }: SettingsButtonProps) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowSettings(true)}
        className={className}
        title="Settings"
      >
        <Gear className="h-4 w-4 mr-2" />
        Settings
      </Button>

      {showSettings && (
        <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
      )}
    </>
  );
}