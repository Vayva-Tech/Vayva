'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Shield, Edit } from 'lucide-react';

const roles = [
  { name: 'Attorney', users: 5, permissions: ['Cases', 'Billing', 'Trust', 'Documents', 'Calendar'] },
  { name: 'Paralegal', users: 3, permissions: ['Cases', 'Time', 'Documents'] },
  { name: 'Legal Assistant', users: 2, permissions: ['Time', 'Calendar', 'Documents'] },
  { name: 'Of Counsel', users: 1, permissions: ['Cases', 'Documents'] },
];

export default function UserRolesSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-serif">User Roles & Permissions</h1>
          <p className="text-gray-700 mt-1">Manage attorney, paralegal, and staff roles</p>
        </div>
        <Button>
          <Users size={20} className="mr-2" />
          Add Role
        </Button>
      </div>

      <div className="grid gap-4">
        {roles.map((role) => (
          <Card key={role.name} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Shield size={32} className="text-blue-900" />
                <div>
                  <h3 className="font-semibold text-lg">{role.name}</h3>
                  <p className="text-sm text-gray-700">{role.users} users assigned</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {role.permissions.map((perm) => (
                    <Badge key={perm} variant="secondary">{perm}</Badge>
                  ))}
                </div>
                <Button variant="ghost" size="sm">
                  <Edit size={16} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
