"use client";

import React from "react";
import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { Button, GlassPanel, Input, Icon } from "@vayva/ui";
import { apiJson } from "@/lib/api-client-shared";

interface InviteData {
  email: string;
  role: string;
  storeName: string;
  userExists: boolean;
}

export default function AcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = React.use(params);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [inviteData, setInviteData] = React.useState<InviteData | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  // Form state for new users
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [password, setPassword] = React.useState("");

  React.useEffect(() => {
    async function loadInvite() {
      try {
        const data = await apiJson<InviteData>(
          `/api/team/invites/accept?token=${token}`,
        );
        setInviteData(data);
      } catch (err: unknown) {
        const _errMsg = err instanceof Error ? err.message : String(err);
        setError(_errMsg || "Invalid or expired invitation");
      } finally {
        setLoading(false);
      }
    }
    void loadInvite();
  }, [token]);

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await apiJson<{ success: boolean }>("/team/invites/accept", {
        method: "POST",
        body: JSON.stringify({
          token,
          firstName: inviteData?.userExists ? undefined : firstName,
          lastName: inviteData?.userExists ? undefined : lastName,
          password: inviteData?.userExists ? undefined : password,
        }),
      });
      setSuccess(true);
    } catch (err: unknown) {
      const _errMsg = err instanceof Error ? err.message : String(err);
      setError(_errMsg || "Failed to accept invite");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <GlassPanel className="w-full max-w-[500px] p-10 flex flex-col gap-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Icon
              name="Loader2"
              className="w-8 h-8 animate-spin text-white mb-4"
            />
            <p className="text-gray-500 text-sm">
              Verifying invitation...
            </p>
          </div>
        ) : success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon name="Check" className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Invite accepted
            </h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              You&apos;ve successfully joined{" "}
              <strong>{inviteData?.storeName}</strong>. You can now sign in to
              your dashboard.
            </p>
            <Link href="/signin">
              <Button className="w-full h-12 rounded-xl">Go to sign in</Button>
            </Link>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon name="X" className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Invalid Link</h2>
            <p className="text-gray-500 mb-8">{error}</p>
            <Link href="/signin">
              <Button variant="outline" className="w-full h-12 rounded-xl">
                Back to sign in
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">
                Join {inviteData?.storeName}
              </h2>
              <p className="text-gray-500">
                You&apos;ve been invited as a{" "}
                <span className="text-green-500 font-bold">
                  {inviteData?.role}
                </span>
              </p>
            </div>

            <form className="flex flex-col gap-5" onSubmit={handleAccept}>
              <Input
                label="Email Address"
                value={inviteData?.email || ""}
                disabled
                className="opacity-70"
              />

              {!inviteData?.userExists && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      placeholder="Jane"
                      value={firstName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFirstName(e.target.value)
                      }
                      required
                    />
                    <Input
                      label="Last Name"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setLastName(e.target.value)
                      }
                      required
                    />
                  </div>
                  <Input
                    label="Create Password"
                    type="password"
                    placeholder="Min 8 characters"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setPassword(e.target.value)
                    }
                    required
                    minLength={8}
                  />
                </>
              )}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-12 rounded-xl mt-2"
              >
                {submitting ? (
                  <>
                    <Icon
                      name="Loader2"
                      className="w-4 h-4 animate-spin mr-2"
                    />
                    Accepting...
                  </>
                ) : (
                  "Accept Invitation"
                )}
              </Button>
            </form>

            <div className="text-center border-t border-gray-100-subtle pt-4">
              <p className="text-xs text-gray-500">
                Already have an account?{" "}
                <Link href="/signin" className="text-white hover:underline">
                  Log in
                </Link>{" "}
                instead.
              </p>
            </div>
          </>
        )}
      </GlassPanel>
    </AuthShell>
  );
}
