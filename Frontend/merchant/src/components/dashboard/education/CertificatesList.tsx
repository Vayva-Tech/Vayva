'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Calendar, User } from 'lucide-react';
import { UniversalSectionHeader } from './universal';

interface Certificate {
  id: string;
  studentName: string;
  courseTitle: string;
  issuedAt: string;
  certificateNumber: string;
  status: 'issued' | 'pending' | 'revoked';
}

interface CertificatesListProps {
  certificates: Certificate[];
  designCategory?: string;
}

export function CertificatesList({ certificates, designCategory }: CertificatesListProps) {
  const recentCertificates = certificates.filter(c => c.status === 'issued');
  const pendingCertificates = certificates.filter(c => c.status === 'pending');

  return (
    <div className="space-y-4">
      <UniversalSectionHeader
        title="Certificates"
        subtitle={`${recentCertificates.length} issued`}
        icon={<Award className="h-5 w-5" />}
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="bg-white border-gray-100 rounded-2xl">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Issued</p>
                <p className="text-xl font-bold text-green-500">{recentCertificates.length}</p>
              </div>
              <div className="p-2 rounded-xl bg-green-500/10">
                <Award className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-100 rounded-2xl">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Pending</p>
                <p className="text-xl font-bold text-orange-500">{pendingCertificates.length}</p>
              </div>
              <div className="p-2 rounded-xl bg-orange-500/10">
                <Calendar className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Certificates */}
      <div className="space-y-2">
        <h3 className="font-semibold text-sm text-gray-500">Recently Issued</h3>
        {recentCertificates.slice(0, 6).map((cert) => (
          <Card key={cert.id} className="bg-white border-gray-100 hover:border-green-500/50 transition-all rounded-2xl">
            <CardContent className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-yellow-500/10">
                    <Award className="h-4 w-4 text-yellow-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{cert.studentName}</h4>
                    <p className="text-xs text-gray-500">{cert.courseTitle}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(cert.issuedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs rounded-full">
                  #{cert.certificateNumber.slice(-6)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending Certificates */}
      {pendingCertificates.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-gray-500">Pending Issuance</h3>
          {pendingCertificates.slice(0, 3).map((cert) => (
            <Card key={cert.id} className="bg-white border-gray-100 hover:border-green-500/50 transition-all rounded-2xl">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-500/10">
                      <User className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{cert.studentName}</p>
                      <p className="text-xs text-gray-500">{cert.courseTitle}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs rounded-full">
                    Awaiting Review
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
