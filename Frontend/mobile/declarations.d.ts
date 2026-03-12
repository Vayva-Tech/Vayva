/* eslint-disable */
export {};

declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.gif";
declare module "*.svg";

declare module "expo-secure-store" {
  export function setItemAsync(key: string, value: string): Promise<void>;
  export function getItemAsync(key: string): Promise<string | null>;
  export function deleteItemAsync(key: string): Promise<void>;
}

declare module "react-native" {
  interface ViewProps {
    className?: string;
  }

  interface TextProps {
    className?: string;
  }

  interface TextInputProps {
    className?: string;
  }

  interface ScrollViewProps {
    className?: string;
  }

  interface TouchableOpacityProps {
    className?: string;
  }

  interface ImageBackgroundProps {
    className?: string;
  }
}

declare module "react-native-safe-area-context" {
  import * as React from "react";
  import type { ViewProps } from "react-native";

  interface SafeAreaViewProps {
    className?: string;
  }

  export const SafeAreaView: React.ComponentType<ViewProps & SafeAreaViewProps>;
}

declare module "expo-blur" {
  import * as React from "react";
  import type { ViewProps } from "react-native";

  interface BlurViewProps {
    className?: string;
  }

  export const BlurView: React.ComponentType<ViewProps & BlurViewProps>;
}
