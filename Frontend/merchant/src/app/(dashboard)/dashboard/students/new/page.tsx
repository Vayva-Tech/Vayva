"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { logger } from "@vayva/shared";
import { apiJson } from "@/lib/api-client-shared";
import { BackButton } from "@/components/ui/BackButton";
import { Button, Input, Label } from "@vayva/ui";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageWithInsights } from "@/components/layout/PageWithInsights";

export default function NewStudentPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    grade: "",
    studentId: "",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiJson("/education/students", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          phone: form.phone || undefined,
          grade: form.grade || undefined,
          studentId: form.studentId || undefined,
        }),
      });
      toast.success("Student created");
      router.push("/dashboard/students");
    } catch (error: unknown) {
      logger.error("[CREATE_STUDENT_ERROR]", {
        error: error instanceof Error ? error.message : String(error),
        app: "merchant",
      });
      toast.error("Failed to create student");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageWithInsights
        insights={
          <>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Tip
              </div>
              <div className="mt-2 text-sm font-semibold text-gray-900">
                Keep contact info updated
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Accurate email/phone helps with attendance and reminders.
              </p>
            </div>
          </>
        }
      >
        <div className="flex items-center gap-4">
          <BackButton href="/dashboard/students" label="Back to Students" />
          <PageHeader
            title="Add Student"
            subtitle="Create a student record for your store."
          />
        </div>

        <form onSubmit={onSubmit} className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Student details</CardTitle>
            <CardDescription>Basic profile information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  required
                  value={form.firstName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setForm({ ...form, firstName: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  required
                  value={form.lastName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setForm({ ...form, lastName: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, email: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="grade">Grade</Label>
                <Input
                  id="grade"
                  value={form.grade}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setForm({ ...form, grade: e.target.value })
                  }
                  placeholder="e.g. Grade 10"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="studentId">Student ID (optional)</Label>
              <Input
                id="studentId"
                value={form.studentId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, studentId: e.target.value })
                }
                placeholder="Leave blank to auto-generate"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create student"}
            </Button>
          </CardFooter>
        </Card>
        </form>
      </PageWithInsights>
    </div>
  );
}

