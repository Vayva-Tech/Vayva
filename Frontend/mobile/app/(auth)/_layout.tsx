import React from "react";
import { Stack } from "expo-router";

const StackAny = Stack as unknown as React.ComponentType<Record<string, unknown>> & {
  Screen: React.ComponentType<Record<string, unknown>>;
};

export default function AuthLayout(): React.JSX.Element {
  return (
    <StackAny>
      <StackAny.Screen name="login" options={{ headerShown: false }} />
      <StackAny.Screen name="signup" options={{ headerShown: false }} />
    </StackAny>
  );
}
