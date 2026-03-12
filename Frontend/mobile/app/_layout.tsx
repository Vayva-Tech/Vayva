import React from "react";
import { Stack } from "expo-router";

const StackAny = Stack as unknown as React.ComponentType<
  Record<string, unknown>
> & {
  Screen: React.ComponentType<Record<string, unknown>>;
};

export default function Layout(): React.JSX.Element {
  return (
    <StackAny>
      <StackAny.Screen name="index" options={{ headerShown: false }} />
      <StackAny.Screen name="(auth)" options={{ headerShown: false }} />
      <StackAny.Screen name="(tabs)" options={{ headerShown: false }} />
      <StackAny.Screen name="(flows)" options={{ headerShown: false }} />
    </StackAny>
  );
}
