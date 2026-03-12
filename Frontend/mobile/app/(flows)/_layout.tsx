import React from "react";
import { Stack } from "expo-router";

const StackAny = Stack as unknown as React.ComponentType<Record<string, unknown>> & {
  Screen: React.ComponentType<Record<string, unknown>>;
};

export default function FlowsLayout(): React.JSX.Element {
  return (
    <StackAny>
      <StackAny.Screen name="create-order" options={{ headerShown: false }} />
    </StackAny>
  );
}
