"use client";

import React, { useState, useEffect } from "react";
import { MarketShell } from "@/components/market/market-shell";
import { Icon, Button, Input } from "@vayva/ui";
import { apiJson } from "@/lib/api-client-shared";
import { toast } from "sonner";

interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
}

interface Profile {
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

export default function MarketAccountProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  useEffect(() => {
    void fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const [profileData, addressesData] = await Promise.all([
        apiJson<Profile>("/api/market/account/profile"),
        apiJson<Address[]>("/api/market/account/addresses"),
      ]);
      setProfile(profileData);
      setAddresses(addressesData || []);
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const saveAddress = async (address: Partial<Address>) => {
    try {
      if (address.id) {
        await apiJson(`/api/market/account/addresses/${address.id}`, {
          method: "PUT",
          body: JSON.stringify(address),
        });
        toast.success("Address updated");
      } else {
        await apiJson("/api/market/account/addresses", {
          method: "POST",
          body: JSON.stringify(address),
        });
        toast.success("Address added");
      }
      setEditingAddress(null);
      setIsAddingAddress(false);
      void fetchProfile();
    } catch {
      toast.error("Failed to save address");
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      await apiJson(`/api/market/account/addresses/${id}`, { method: "DELETE" });
      toast.success("Address removed");
      void fetchProfile();
    } catch {
      toast.error("Failed to remove address");
    }
  };

  const setDefaultAddress = async (id: string) => {
    try {
      await apiJson(`/api/market/account/addresses/${id}/default`, { method: "PUT" });
      void fetchProfile();
    } catch {
      toast.error("Failed to set default");
    }
  };

  if (loading) {
    return (
      <MarketShell>
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-muted rounded-lg" />
            <div className="h-48 bg-muted rounded-lg" />
          </div>
        </div>
      </MarketShell>
    );
  }

  return (
    <MarketShell>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Account Profile</h1>

        {/* Profile Info */}
        <div className="bg-surface-1 border rounded-xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              {profile?.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <Icon name="User" size={32} className="text-primary" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{profile?.name || "Guest User"}</h2>
              <p className="text-muted-foreground">{profile?.email}</p>
              <p className="text-muted-foreground">{profile?.phone}</p>
            </div>
          </div>
        </div>

        {/* Addresses */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Delivery Addresses</h2>
            <Button onClick={() => setIsAddingAddress(true)} variant="outline">
              <Icon name="Plus" size={16} className="mr-1" /> Add Address
            </Button>
          </div>

          {addresses.length === 0 ? (
            <div className="text-center py-8 border rounded-lg">
              <Icon name="MapPin" size={32} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No addresses saved yet</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div key={addr.id} className={`border rounded-lg p-4 ${addr.isDefault ? "border-primary" : ""}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{addr.label}</span>
                    {addr.isDefault && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Default</span>}
                  </div>
                  <p className="font-medium">{addr.fullName}</p>
                  <p className="text-sm text-muted-foreground">{addr.phone}</p>
                  <p className="text-sm text-muted-foreground">{addr.street}</p>
                  <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} {addr.postalCode}</p>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" onClick={() => setEditingAddress(addr)}>Edit</Button>
                    <Button size="sm" variant="outline" onClick={() => deleteAddress(addr.id)} className="text-red-500">
                      <Icon name="Trash2" size={14} />
                    </Button>
                    {!addr.isDefault && (
                      <Button size="sm" variant="ghost" onClick={() => setDefaultAddress(addr.id)}>Set Default</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add/Edit Address Modal would go here - simplified inline form */}
        {(isAddingAddress || editingAddress) && (
          <div className="border rounded-lg p-4 mb-6 bg-muted/30">
            <h3 className="font-semibold mb-4">{editingAddress ? "Edit Address" : "Add New Address"}</h3>
            <AddressForm
              initial={editingAddress || undefined}
              onSubmit={saveAddress}
              onCancel={() => { setEditingAddress(null); setIsAddingAddress(false); }}
            />
          </div>
        )}
      </div>
    </MarketShell>
  );
}

function AddressForm({ initial, onSubmit, onCancel }: { initial?: Address; onSubmit: (a: Partial<Address>) => void; onCancel: () => void }) {
  const [form, setForm] = useState<Partial<Address>>(initial || {
    label: "", fullName: "", phone: "", street: "", city: "", state: "", postalCode: "", isDefault: false,
  });

  return (
    <div className="space-y-3">
      <Input placeholder="Label (e.g. Home, Work)" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
      <div className="grid md:grid-cols-2 gap-3">
        <Input placeholder="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        <Input placeholder="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </div>
      <Input placeholder="Street Address" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} />
      <div className="grid md:grid-cols-3 gap-3">
        <Input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        <Input placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
        <Input placeholder="Postal Code" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} />
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="default" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
        <label htmlFor="default">Set as default address</label>
      </div>
      <div className="flex gap-2">
        <Button onClick={() => onSubmit(form)}>Save Address</Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}
