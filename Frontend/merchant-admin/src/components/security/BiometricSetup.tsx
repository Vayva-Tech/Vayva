"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@vayva/ui";
import { toast } from "sonner";
import { Fingerprint, Check, X } from "@phosphor-icons/react/ssr";
import { apiJson } from "@/lib/api-client-shared";

interface WebAuthnRegistrationResponse {
  success: boolean;
  message?: string;
}

interface WebAuthnVerificationResponse {
  success: boolean;
  verified: boolean;
  message?: string;
}

/**
 * WebAuthn biometric authentication component
 * Supports fingerprint/face ID as MFA alternative
 */
export function BiometricSetup() {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  // Check WebAuthn support on mount
  const checkSupport = useCallback(async () => {
    if (typeof window === "undefined") return false;
    
    const supported = 
      window.PublicKeyCredential !== undefined &&
      typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === "function";
    
    if (supported) {
      const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      setIsSupported(available);
      return available;
    }
    
    setIsSupported(false);
    return false;
  }, []);

  // Initialize check
  useEffect(() => {
    checkSupport();
  }, [checkSupport]);

  const registerBiometric = async () => {
    if (!isSupported) {
      toast.error("Biometric authentication not supported on this device");
      return;
    }

    setIsRegistering(true);
    try {
      // Get registration options from backend
      const options = await apiJson<{
        challenge: string;
        rp: { name: string; id: string };
        user: { id: string; name: string; displayName: string };
        pubKeyCredParams: { type: string; alg: number }[];
        authenticatorSelection: {
          authenticatorAttachment: string;
          userVerification: string;
        };
        timeout: number;
        attestation: string;
      }>("/api/auth/webauthn/register-options", { method: "GET" });

      // Convert base64url strings to ArrayBuffer
      const challengeBuffer = base64URLToBuffer(options.challenge);
      const userIdBuffer = base64URLToBuffer(options.user.id);

      // Create credential
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: challengeBuffer,
          rp: options.rp,
          user: {
            id: userIdBuffer,
            name: options.user.name,
            displayName: options.user.displayName,
          },
          pubKeyCredParams: options.pubKeyCredParams as PublicKeyCredentialParameters[],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
          },
          timeout: options.timeout,
          attestation: "none",
        },
      }) as PublicKeyCredential | null;

      if (!credential) {
        throw new Error("Credential creation failed");
      }

      // Send credential to backend for verification and storage
      const response = credential.response as AuthenticatorAttestationResponse;
      
      const result = await apiJson<WebAuthnRegistrationResponse>(
        "/api/auth/webauthn/register",
        {
          method: "POST",
          body: JSON.stringify({
            id: credential.id,
            rawId: bufferToBase64URL(credential.rawId),
            type: credential.type,
            response: {
              clientDataJSON: bufferToBase64URL(response.clientDataJSON),
              attestationObject: bufferToBase64URL(response.attestationObject),
            },
          }),
        }
      );

      if (result.success) {
        setIsEnabled(true);
        toast.success("Biometric authentication enabled successfully");
      } else {
        toast.error(result.message || "Registration failed");
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Registration failed";
      if (msg.includes("NotAllowedError")) {
        toast.error("Permission denied. Please allow biometric access.");
      } else if (msg.includes("NotSupportedError")) {
        toast.error("Biometric authentication not available on this device.");
      } else {
        toast.error(msg);
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const verifyBiometric = async () => {
    setIsVerifying(true);
    try {
      // Get authentication options from backend
      const options = await apiJson<{
        challenge: string;
        allowCredentials: { id: string; type: string }[];
        userVerification: string;
        timeout: number;
      }>("/api/auth/webauthn/verify-options", { method: "GET" });

      const challengeBuffer = base64URLToBuffer(options.challenge);

      // Get assertion
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: challengeBuffer,
          allowCredentials: options.allowCredentials.map((cred: { id: string; type: string }) => ({
            id: base64URLToBuffer(cred.id),
            type: cred.type as "public-key",
          })) as PublicKeyCredentialDescriptor[],
          userVerification: "required",
          timeout: options.timeout,
        },
      }) as PublicKeyCredential | null;

      if (!assertion) {
        throw new Error("Authentication failed");
      }

      // Send assertion to backend for verification
      const response = assertion.response as AuthenticatorAssertionResponse;
      
      const result = await apiJson<WebAuthnVerificationResponse>(
        "/api/auth/webauthn/verify",
        {
          method: "POST",
          body: JSON.stringify({
            id: assertion.id,
            rawId: bufferToBase64URL(assertion.rawId),
            type: assertion.type,
            response: {
              authenticatorData: bufferToBase64URL(response.authenticatorData),
              clientDataJSON: bufferToBase64URL(response.clientDataJSON),
              signature: bufferToBase64URL(response.signature),
              userHandle: response.userHandle 
                ? bufferToBase64URL(response.userHandle) 
                : undefined,
            },
          }),
        }
      );

      if (result.success && result.verified) {
        toast.success("Biometric verification successful");
        return true;
      } else {
        toast.error(result.message || "Verification failed");
        return false;
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Verification failed";
      toast.error(msg);
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  if (isSupported === null) {
    return (
      <div className="p-4 border rounded-lg bg-muted">
        <p className="text-sm text-muted-foreground">Checking biometric support...</p>
      </div>
    );
  }

  if (!isSupported) {
    return (
      <div className="p-4 border rounded-lg bg-muted">
        <div className="flex items-center gap-2 text-muted-foreground">
          <X className="w-5 h-5" />
          <p className="text-sm">Biometric authentication not available on this device</p>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Requires a device with fingerprint or face recognition capability.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Fingerprint className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-medium">Biometric Authentication</h4>
            <p className="text-sm text-muted-foreground">
              {isEnabled 
                ? "Use fingerprint or face recognition for secure login" 
                : "Enable for faster, more secure access"}
            </p>
          </div>
        </div>
        
        {isEnabled ? (
          <div className="flex items-center gap-2 text-green-600">
            <Check className="w-5 h-5" />
            <span className="text-sm font-medium">Enabled</span>
          </div>
        ) : (
          <Button
            onClick={registerBiometric}
            disabled={isRegistering}
            isLoading={isRegistering}
            size="sm"
          >
            Enable
          </Button>
        )}
      </div>

      {isEnabled && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={verifyBiometric}
            disabled={isVerifying}
            isLoading={isVerifying}
          >
            Test Biometric
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive"
            onClick={() => setIsEnabled(false)}
          >
            Disable
          </Button>
        </div>
      )}
    </div>
  );
}

// Utility functions for base64url encoding/decoding
function base64URLToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const buffer = new ArrayBuffer(binary.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    view[i] = binary.charCodeAt(i);
  }
  return buffer;
}

function bufferToBase64URL(buffer: ArrayBuffer): string {
  const binary = String.fromCharCode(...new Uint8Array(buffer));
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
