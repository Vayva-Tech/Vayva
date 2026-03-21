'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function StoreSettingsForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Store Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="storeName">Store Name</Label>
            <Input id="storeName" placeholder="Enter store name" />
          </div>
          <div>
            <Label htmlFor="storeEmail">Store Email</Label>
            <Input id="storeEmail" type="email" placeholder="Enter store email" />
          </div>
          <Button>Save Settings</Button>
        </div>
      </CardContent>
    </Card>
  );
}