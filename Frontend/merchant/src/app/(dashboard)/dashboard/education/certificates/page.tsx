/**
 * Education - Certificates Management Page
 * Issue and manage student certificates and credentials
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Award, Plus, Download, Mail } from "lucide-react";

interface Certificate {
  id: string;
  certificateNumber: string;
  studentName: string;
  courseName: string;
  issueDate: string;
  status: "issued" | "pending" | "revoked";
  grade?: string;
  instructorName: string;
}

export default function EducationCertificatesPage() {
  const router = useRouter();

  const certificates: Certificate[] = [
    { id: "1", certificateNumber: "CERT-2024-001", studentName: "John Smith", courseName: "Python Programming", issueDate: "2024-01-15", status: "issued", grade: "A", instructorName: "Dr. Sarah Johnson" },
    { id: "2", certificateNumber: "CERT-2024-002", studentName: "Emily Chen", courseName: "Data Science Fundamentals", issueDate: "2024-01-14", status: "issued", grade: "A+", instructorName: "Prof. Michael Brown" },
    { id: "3", certificateNumber: "CERT-2024-003", studentName: "Mike Wilson", courseName: "Web Development Bootcamp", issueDate: "2024-01-16", status: "pending", instructorName: "Dr. Lisa Anderson" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/education")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Certificates</h1>
            <p className="text-muted-foreground">Issue and manage student credentials</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/education/certificates/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Issue Certificate
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Issued</p>
                <p className="text-2xl font-bold">{certificates.filter(c => c.status === "issued").length}</p>
              </div>
              <Award className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{certificates.filter(c => c.status === "pending").length}</p>
              </div>
              <Award className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <Award className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Grade</p>
                <p className="text-2xl font-bold">A-</p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Certificates Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {certificates.map((certificate) => (
          <Card key={certificate.id} className="hover:shadow-lg transition-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 opacity-10 rounded-bl-full" />
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{certificate.certificateNumber}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{certificate.courseName}</p>
                </div>
                <Badge variant={certificate.status === "issued" ? "default" : "secondary"}>
                  {certificate.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Student:</span>
                  <span className="font-medium">{certificate.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Instructor:</span>
                  <span className="font-medium">{certificate.instructorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Issue Date:</span>
                  <span className="font-medium">{certificate.issueDate}</span>
                </div>
                {certificate.grade && (
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-muted-foreground">Grade:</span>
                    <Badge variant="outline">{certificate.grade}</Badge>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-3">
                <Button variant="outline" size="sm" className="flex-1">
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Mail className="h-4 w-4" />
                </Button>
                <Button size="sm" className="flex-1" onClick={() => router.push(`/dashboard/education/certificates/${certificate.id}`)}>
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
