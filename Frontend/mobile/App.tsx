/* eslint-disable */
// @ts-nocheck
import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  Image,
  useColorScheme,
  Animated,
} from "react-native";

export default function App(): React.JSX.Element {
  const colorScheme = useColorScheme();
  const [isReady, setIsReady] = useState(false);
  const fadeAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    // Simulate resource loading / auth check
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => setIsReady(true));
    }, 2500);
  }, []);

  if (!isReady) {
    return (
      <View style={[styles.container, styles.splashContainer]}>
        <Image
          source={require("./assets/splash-icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.brandText}>Vayva Marketplace</Text>
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0fdf4",
    alignItems: "center",
    justifyContent: "center",
  },
  splashContainer: {
    backgroundColor: "#f0fdf4",
    gap: 20,
  },
  logo: {
    width: 120,
    height: 120,
  },
  brandText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginTop: 20,
    letterSpacing: -0.5,
  },
});
