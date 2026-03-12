import React from "react";
import { View, type ViewProps, useColorScheme } from "react-native";
import Svg, { Defs, RadialGradient, Stop, Rect } from "react-native-svg";

type Props = ViewProps & {
  children: React.ReactNode;
};

const SvgAny = Svg as unknown as React.ComponentType<Record<string, unknown>>;
const DefsAny = Defs as unknown as React.ComponentType<Record<string, unknown>>;
const RadialGradientAny =
  RadialGradient as unknown as React.ComponentType<Record<string, unknown>>;
const StopAny = Stop as unknown as React.ComponentType<Record<string, unknown>>;
const RectAny = Rect as unknown as React.ComponentType<Record<string, unknown>>;

export default function VayvaBackground({ children, style, ...props }: Props) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const base = isDark ? "#060B07" : "#ffffff";
  const c15 = isDark ? "rgba(34, 197, 94, 0.22)" : "rgba(34, 197, 94, 0.15)";
  const c10 = isDark ? "rgba(34, 197, 94, 0.16)" : "rgba(34, 197, 94, 0.10)";
  const c08 = isDark ? "rgba(34, 197, 94, 0.12)" : "rgba(34, 197, 94, 0.08)";
  const c05 = isDark ? "rgba(34, 197, 94, 0.08)" : "rgba(34, 197, 94, 0.05)";

  return (
    <View
      {...props}
      style={[{ flex: 1, backgroundColor: base }, style]}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          inset: 0,
        }}
      >
        <SvgAny width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
          <DefsAny>
            <RadialGradientAny id="g1" cx="50%" cy="-20%" rx="120%" ry="80%">
              <StopAny offset="0%" stopColor={c15} />
              <StopAny offset="50%" stopColor="rgba(34, 197, 94, 0)" />
            </RadialGradientAny>
            <RadialGradientAny id="g2" cx="90%" cy="100%" rx="80%" ry="60%">
              <StopAny offset="0%" stopColor={c10} />
              <StopAny offset="40%" stopColor="rgba(34, 197, 94, 0)" />
            </RadialGradientAny>
            <RadialGradientAny id="g3" cx="10%" cy="100%" rx="60%" ry="40%">
              <StopAny offset="0%" stopColor={c08} />
              <StopAny offset="30%" stopColor="rgba(34, 197, 94, 0)" />
            </RadialGradientAny>
            <RadialGradientAny id="g4" cx="50%" cy="50%" rx="50%" ry="30%">
              <StopAny offset="0%" stopColor={c05} />
              <StopAny offset="60%" stopColor="rgba(34, 197, 94, 0)" />
            </RadialGradientAny>
          </DefsAny>

          <RectAny x="0" y="0" width="100%" height="100%" fill={base} />
          <RectAny x="0" y="0" width="100%" height="100%" fill="url(#g1)" />
          <RectAny x="0" y="0" width="100%" height="100%" fill="url(#g2)" />
          <RectAny x="0" y="0" width="100%" height="100%" fill="url(#g3)" />
          <RectAny x="0" y="0" width="100%" height="100%" fill="url(#g4)" />
        </SvgAny>
      </View>

      {children}
    </View>
  );
}
