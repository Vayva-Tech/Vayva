import React from "react";
import { Image } from "react-native";
import logoSource from "../../assets/vayva-logo.png";

type Props = {
  sizeClassName?: string;
};

export default function VayvaLogo({ sizeClassName = "w-16" }: Props) {
  return (
    <Image
      source={logoSource}
      style={{ width: 217, height: 150 }}
      className={`${sizeClassName} h-auto`}
      resizeMode="contain"
      accessibilityLabel="Vayva"
    />
  );
}
