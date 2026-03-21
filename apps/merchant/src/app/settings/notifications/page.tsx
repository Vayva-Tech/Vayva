'use client';

import React, { useState, useEffect } from 'react';
import { GlassPanel } from '@vayva/ui/components/fashion';
import { Button, Input, Switch, Select } from '@vayva/ui/components';
import { useNotification } from '@/context/notification.context';

const NotificationSettingsPage = () => {
  const { preferences, updatePreferences, rules, addRule, updateRule, deleteRule, fetchRules } = useNotification();
  const [activeTab, setActiveTab] = useState<'channels' | 'categories' | 'quietHours' | 'rules'>('channels');
  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    triggerType: 'event' as 'event' | 'threshold' | 'schedule',
    event: '',
    thresholdMetric: '',
    thresholdOperator: 'greater-than' as 'greater-than' | 'less-than' | 'equals',
    thresholdValue: 0,
    scheduleFrequency: 'daily' as 'daily' | 'weekly' | 'monthly',
    scheduleTime: '09:00'
  });

  const tabs = [
    { id: 'channels', label: 'Channels', icon: '📢' },
    { id: 'categories', label: 'Categories', icon: '🏷️' },
    { id: 'quietHours', label: 'Quiet Hours', icon: '🌙' },
    { id: 'rules', label: 'Rules', icon: '⚡' }
  ];

  const handleChannelToggle = async (channel: string, enabled: boolean) => {
    await updatePreferences({
      channels: {
        ...preferences.channels,
        [channel]: enabled
      }
    });
  };

  const handleCategoryToggle = async (category: string, enabled: boolean) => {
    await updatePreferences({
      categories: {
        ...preferences.categories,
        [category]: enabled
      }
    });
  };

  const handleQuietHoursUpdate = async (field: string, value: string | boolean) => {
    await updatePreferences({
      quietHours: {
        ...preferences.quietHours,
        [field]: value
      }
    });
  };

  const handleAddRule = async () => {
    if (!newRule.name.trim()) return;

    const rulePayload: any = {
      name: newRule.name,
      description: newRule.description,
      trigger: {
        type: newRule.triggerType
      },
      conditions: [],
      actions: [{
        type: 'in-app',
        template: 'custom-rule',
        variables: {}
      }],
      enabled: true
    };

    if (newRule.triggerType === 'event' && newRule.event) {
      rulePayload.trigger.event = newRule.event;
    } else if (newRule.triggerType === 'threshold') {
      rulePayload.trigger.threshold = {
        metric: newRule.thresholdMetric,
        operator: newRule.thresholdOperator,
        value: newRule.thresholdValue
      };
    } else if (newRule.triggerType === 'schedule') {
      rulePayload.trigger.schedule = {
        frequency: newRule.scheduleFrequency,
        time: newRule.scheduleTime
      };
    }

    await addRule(rulePayload);
    setNewRule({
      name: '',
      description: '',
      triggerType: 'event',
      event: '',
      thresholdMetric: '',
      thresholdOperator: 'greater-than',
      thresholdValue: 0,
      scheduleFrequency: 'daily',
      scheduleTime: '09:00'
    });
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Notification Settings</h1>
          <p className="text-white/60">Manage how and when you receive notifications</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white/5 p-1 rounded-lg w-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                activeTab === tab.id
                  ? "bg-white text-black shadow-sm"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {/* Channels Tab */}
          {activeTab === 'channels' && (
            <GlassPanel variant="elevated" className="p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Notification Channels</h2>
              <div className="space-y-4">
                {Object.entries(preferences.channels).map(([channel, enabled]) => (
                  <label key={channel} className="flex items-center justify-between p-4 bg-white/3 rounded-lg border border-white/8">
                    <div>
                      <span className="text-sm font-medium text-white capitalize">
                        {channel.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <p className="text-xs text-white/50 mt-1">
                        {channel === 'email' && 'Receive notifications via email'}
                        {channel === 'sms' && 'Get text message alerts'}
                        {channel === 'push' && 'Mobile push notifications'}
                        {channel === 'inApp' && 'In-application notifications'}
                        {channel === 'slack' && 'Slack workspace notifications'}
                        {channel === 'whatsapp' && 'WhatsApp Business messages'}
                      </p>
                    </div>
                    <Switch checked={enabled} onChange={(checked) => handleChannelToggle(channel, checked)} />
                  </label>
                ))}
              </div>
            </GlassPanel>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <GlassPanel variant="elevated" className="p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Notification Categories</h2>
              <div className="space-y-4">
                {Object.entries(preferences.categories).map(([category, enabled]) => (
                  <label key={category} className="flex items-center justify-between p-4 bg-white/3 rounded-lg border border-white/8">
                    <div>
                      <span className="text-sm font-medium text-white capitalize">
                        {category}
                      </span>
                      <p className="text-xs text-white/50 mt-1">
                        {category === 'orders' && 'New orders, order updates, and fulfillment'}
                        {category === 'inventory' && 'Stock alerts, low inventory warnings'}
                        {category === 'payments' && 'Payment confirmations, failed transactions'}
                        {category === 'appointments' && 'Booking confirmations, reminders'}
                        {category === 'system' && 'System maintenance, updates, and alerts'}
                      </p>
                    </div>
                    <Switch checked={enabled} onChange={(checked) => handleCategoryToggle(category, checked)} />
                  </label>
                ))}
              </div>
            </GlassPanel>
          )}

          {/* Quiet Hours Tab */}
          {activeTab === 'quietHours' && (
            <GlassPanel variant="elevated" className="p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Quiet Hours</h2>
              
              <div className="space-y-6">
                {/* Enable Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white">Enable Quiet Hours</h3>
                    <p className="text-sm text-white/60">Pause non-critical notifications during specified hours</p>
                  </div>
                  <Switch 
                    checked={preferences.quietHours.enabled} 
                    onChange={(checked) => handleQuietHoursUpdate('enabled', checked)} 
                  />
                </div>

                {preferences.quietHours.enabled && (
                  <>
                    {/* Time Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-3">
                          Start Time
                        </label>
                        <Input
                          type="time"
                          value={preferences.quietHours.startTime}
                          onChange={(e) => handleQuietHoursUpdate('startTime', e.target.value)}
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-3">
                          End Time
                        </label>
                        <Input
                          type="time"
                          value={preferences.quietHours.endTime}
                          onChange={(e) => handleQuietHoursUpdate('endTime', e.target.value)}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Timezone */}
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-3">
                        Timezone
                      </label>
                      <Select
                        value={preferences.quietHours.timezone}
                        onValueChange={(value) => handleQuietHoursUpdate('timezone', value)}
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                      </Select>
                    </div>

                    {/* Priority Override Info */}
                    <div className="p-4 bg-amber-400/10 border border-amber-400/20 rounded-lg">
                      <div className="flex items-start gap-3">
                        <span className="text-amber-400 mt-0.5">⚠️</span>
                        <div>
                          <h4 className="text-sm font-medium text-amber-400 mb-1">Priority Override</h4>
                          <p className="text-xs text-amber-300">
                            Critical and urgent notifications will still be delivered during quiet hours. 
                            Only normal, high, and low priority notifications are affected.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </GlassPanel>
          )}

          {/* Rules Tab */}
          {activeTab === 'rules' && (
            <div className="space-y-6">
              {/* Add New Rule */}
              <GlassPanel variant="elevated" className="p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Create New Rule</h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Rule Name *
                      </label>
                      <Input
                        value={newRule.name}
                        onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                        placeholder="e.g., High Value Order Alert"
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Description
                      </label>
                      <Input
                        value={newRule.description}
                        onChange={(e) => setNewRule({...newRule, description: e.target.value})}
                        placeholder="Brief description of when this rule triggers"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Trigger Type
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['event', 'threshold', 'schedule'] as const).map(type => (
                        <button
                          key={type}
                          onClick={() => setNewRule({...newRule, triggerType: type})}
                          className={cn(
                            "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                            newRule.triggerType === type
                              ? "bg-purple-500 text-white"
                              : "bg-white/5 text-white/60 hover:bg-white/10"
                          )}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Trigger Configuration */}
                  {newRule.triggerType === 'event' && (
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Event Type
                      </label>
                      <Select
                        value={newRule.event}
                        onValueChange={(value) => setNewRule({...newRule, event: value})}
                      >
                        <option value="">Select event...</option>
                        <option value="order.created">Order Created</option>
                        <option value="order.fulfilled">Order Fulfilled</option>
                        <option value="inventory.low">Low Inventory</option>
                        <option value="appointment.booked">Appointment Booked</option>
                        <option value="payment.failed">Payment Failed</option>
                      </Select>
                    </div>
                  )}

                  {newRule.triggerType === 'threshold' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          Metric
                        </label>
                        <Input
                          value={newRule.thresholdMetric}
                          onChange={(e) => setNewRule({...newRule, thresholdMetric: e.target.value})}
                          placeholder="e.g., order.amount"
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          Operator
                        </label>
                        <Select
                          value={newRule.thresholdOperator}
                          onValueChange={(value) => setNewRule({...newRule, thresholdOperator: value as any})}
                        >
                          <option value="greater-than">Greater Than</option>
                          <option value="less-than">Less Than</option>
                          <option value="equals">Equals</option>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          Value
                        </label>
                        <Input
                          type="number"
                          value={newRule.thresholdValue}
                          onChange={(e) => setNewRule({...newRule, thresholdValue: Number(e.target.value)})}
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}

                  {newRule.triggerType === 'schedule' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          Frequency
                        </label>
                        <Select
                          value={newRule.scheduleFrequency}
                          onValueChange={(value) => setNewRule({...newRule, scheduleFrequency: value as any})}
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          Time
                        </label>
                        <Input
                          type="time"
                          value={newRule.scheduleTime}
                          onChange={(e) => setNewRule({...newRule, scheduleTime: e.target.value})}
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button 
                      onClick={handleAddRule}
                      disabled={!newRule.name.trim()}
                      className="bg-purple-500 hover:bg-purple-600"
                    >
                      Create Rule
                    </Button>
                  </div>
                </div>
              </GlassPanel>

              {/* Existing Rules */}
              <GlassPanel variant="elevated" className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">Existing Rules</h2>
                  <span className="text-sm text-white/60">{rules.length} rules</span>
                </div>
                
                <div className="space-y-3">
                  {rules.map(rule => (
                    <div key={rule.id} className="p-4 bg-white/3 rounded-lg border border-white/8">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-white">{rule.name}</h3>
                          <p className="text-sm text-white/60">{rule.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs px-2 py-1 bg-purple-400/20 text-purple-300 rounded-full">
                              {rule.trigger.type}
                            </span>
                            <span className="text-xs text-white/40">
                              {rule.enabled ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={rule.enabled} 
                            onChange={(checked) => updateRule(rule.id, { enabled: checked })}
                          />
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteRule(rule.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {rules.length === 0 && (
                    <div className="text-center py-8 text-white/40">
                      No custom rules created yet
                    </div>
                  )}
                </div>
              </GlassPanel>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsPage;