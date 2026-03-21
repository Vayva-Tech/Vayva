'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Plus, Trash2 } from 'lucide-react';

export default function DocumentTemplatesSettingsPage() {
  const [templates, setTemplates] = useState([
    { id: 1, name: 'Engagement Letter - Family Law', category: 'engagement', active: true },
    { id: 2, name: 'Motion to Dismiss', category: 'motion', active: true },
    { id: 3, name: 'Demand Letter', category: 'letter', active: false },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-serif">Document Templates</h1>
          <p className="text-gray-700 mt-1">Manage document automation templates</p>
        </div>
        <Button>
          <Plus size={20} className="mr-2" />
          New Template
        </Button>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          {templates.map((template) => (
            <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <FileText size={24} className="text-blue-900" />
                <div>
                  <h4 className="font-semibold">{template.name}</h4>
                  <p className="text-sm text-gray-700 capitalize">{template.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs ${template.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  {template.active ? 'Active' : 'Inactive'}
                </span>
                <Button variant="ghost" size="sm">
                  Edit
                </Button>
                <Button variant="ghost" size="sm">
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
