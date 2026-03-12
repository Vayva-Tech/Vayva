"use client";

import { useState } from "react";
import { Badge, Button, Input, Label, Select } from "@vayva/ui";
import { Plus, Trash, Share, ArrowSquareOut as ExternalLink, CheckCircle, Globe, Building, House as Home, Copy } from "@phosphor-icons/react/ssr";
import { toast } from "sonner";

export interface SyndicationChannel {
  id: string;
  name: string;
  type: "portal" | "social" | "mls" | "website";
  url?: string;
  isConnected: boolean;
  lastSyncedAt?: string;
  listingCount: number;
}

export interface PropertyListing {
  id: string;
  title: string;
  propertyId: string;
  channels: string[]; // channel IDs
  status: "draft" | "published" | "expired" | "archived";
  publishedAt?: string;
  expiresAt?: string;
  views: number;
  inquiries: number;
}

interface PropertySyndicationProps {
  channels: SyndicationChannel[];
  listings: PropertyListing[];
  onChannelsChange: (channels: SyndicationChannel[]) => void;
  onListingsChange: (listings: PropertyListing[]) => void;
}

const CHANNEL_TYPES = [
  { value: "portal", label: "Property Portal", icon: Building },
  { value: "social", label: "Social Media", icon: Globe },
  { value: "mls", label: "MLS", icon: Home },
  { value: "website", label: "Website", icon: Globe },
] as const;

export function PropertySyndication({
  channels,
  listings,
  onChannelsChange,
  onListingsChange,
}: PropertySyndicationProps) {
  const [showAddChannel, setShowAddChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelType, setNewChannelType] = useState<SyndicationChannel["type"]>("portal");
  const [newChannelUrl, setNewChannelUrl] = useState("");

  const addChannel = () => {
    if (!newChannelName.trim()) {
      toast.error("Channel name is required");
      return;
    }

    const newChannel: SyndicationChannel = {
      id: crypto.randomUUID(),
      name: newChannelName.trim(),
      type: newChannelType,
      url: newChannelUrl.trim() || undefined,
      isConnected: false,
      listingCount: 0,
    };

    onChannelsChange([...channels, newChannel]);
    setNewChannelName("");
    setNewChannelUrl("");
    setShowAddChannel(false);
    toast.success("Channel added");
  };

  const removeChannel = (id: string) => {
    onChannelsChange(channels.filter((c) => c.id !== id));
    // Remove channel from all listings
    onListingsChange(
      listings.map((l) => ({
        ...l,
        channels: l.channels.filter((c) => c !== id),
      })),
    );
  };

  const toggleConnection = (channelId: string) => {
    onChannelsChange(
      channels.map((c) =>
        c.id === channelId
          ? { ...c, isConnected: !c.isConnected }
          : c,
      ),
    );
  };

  const syndicateListing = (listingId: string, channelId: string) => {
    const listing = listings.find((l) => l.id === listingId);
    if (!listing) return;

    const isOnChannel = listing.channels.includes(channelId);

    onListingsChange(
      listings.map((l) =>
        l.id === listingId
          ? {
              ...l,
              channels: isOnChannel
                ? l.channels.filter((c) => c !== channelId)
                : [...l.channels, channelId],
            }
          : l,
      ),
    );

    // Update channel listing count
    onChannelsChange(
      channels.map((c) =>
        c.id === channelId
          ? {
              ...c,
              listingCount: isOnChannel
                ? c.listingCount - 1
                : c.listingCount + 1,
            }
          : c,
      ),
    );

    toast.success(isOnChannel ? "Removed from channel" : "Added to channel");
  };

  const getChannelIcon = (type: SyndicationChannel["type"]) => {
    const t = CHANNEL_TYPES.find((t) => t.value === type);
    const Icon = t?.icon || Globe;
    return <Icon className="h-4 w-4" />;
  };

  const getStatusBadge = (status: PropertyListing["status"]) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800",
      published: "bg-green-100 text-green-800",
      expired: "bg-yellow-100 text-yellow-800",
      archived: "bg-red-100 text-red-800",
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Share className="h-5 w-5 text-text-secondary" />
          <h3 className="font-semibold text-text-primary">Property Syndication</h3>
        </div>
        <Button size="sm" onClick={() => setShowAddChannel(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Channel
        </Button>
      </div>

      {/* Channels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {channels.map((channel) => (
          <div
            key={channel.id}
            className={`p-4 rounded-lg border transition-colors ${
              channel.isConnected
                ? "border-green-400 bg-green-50/50"
                : "border-border/40 bg-background/50"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  {getChannelIcon(channel.type)}
                </div>
                <div>
                  <h4 className="font-medium text-sm">{channel.name}</h4>
                  <p className="text-xs text-text-tertiary capitalize">
                    {channel.type.replace("_", " ")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => toggleConnection(channel.id)}
                className={`p-1.5 h-auto w-auto rounded transition-colors ${
                  channel.isConnected
                    ? "text-green-600 hover:bg-green-100"
                    : "text-text-tertiary hover:bg-background"
                }`}
                title={channel.isConnected ? "Connected" : "Disconnected"}
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeChannel(channel.id)}
                className="p-1.5 h-auto w-auto text-text-tertiary hover:text-red-500 rounded transition-colors"
              >
                <Trash className="h-4 w-4" />
              </Button>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-text-tertiary">
                {channel.listingCount} listings
              </span>
              {channel.url && (
                <a
                  href={channel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  Visit
                </a>
              )}
            </div>
          </div>
        ))}

        {channels.length === 0 && (
          <div className="col-span-full text-center py-8 text-text-tertiary border-2 border-dashed border-border/40 rounded-lg">
            <Globe className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No syndication channels configured</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAddChannel(true)}
              className="mt-2"
            >
              Add your first channel
            </Button>
          </div>
        )}
      </div>

      {/* Listings Syndication */}
      {listings.length > 0 && channels.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium text-sm mb-3">Active Listings</h4>
          <div className="space-y-2">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="p-3 bg-background/50 rounded-lg border border-border/40"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="font-medium">{listing.title}</h5>
                      {getStatusBadge(listing.status)}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-text-tertiary">
                      <span>{listing.views} views</span>
                      <span>{listing.inquiries} inquiries</span>
                    </div>
                  </div>
                </div>

                {/* Channel Toggles */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {channels.map((channel) => {
                    const isActive = listing.channels.includes(channel.id);
                    return (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        key={channel.id}
                        onClick={() => syndicateListing(listing.id, channel.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "bg-background border border-border/40 text-text-secondary hover:bg-background/80"
                        }`}
                      >
                        {isActive && <CheckCircle className="h-3 w-3" />}
                        {channel.name}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Channel Modal */}
      {showAddChannel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 w-full max-w-md space-y-4">
            <h4 className="font-medium text-lg">Add Syndication Channel</h4>

            <div>
              <Label className="text-xs">Channel Type</Label>
              <Select
                value={newChannelType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setNewChannelType(e.target.value as SyndicationChannel["type"])
                }
                className="w-full h-10 mt-1 px-3 border border-border rounded-lg text-sm bg-background"
              >
                {CHANNEL_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label className="text-xs">Channel Name</Label>
              <Input
                value={newChannelName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewChannelName(e.target.value)}
                placeholder="e.g., PropertyPro, Facebook Marketplace"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">URL (Optional)</Label>
              <Input
                value={newChannelUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewChannelUrl(e.target.value)}
                placeholder="https://..."
                className="mt-1"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowAddChannel(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={addChannel} className="flex-1">
                Add Channel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
