import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import {
  StyleSheet,
  type StyleProp,
  Text,
  TextInput,
  type TextStyle,
  type TextInputProps,
  type TextProps,
} from "react-native";
import "../global.css";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { AchievementUnlockPopup } from "../src/features/gamification/components/AchievementUnlockPopup";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

type TextWithDefaultProps = typeof Text & {
  defaultProps?: TextProps;
};

type TextInputWithDefaultProps = typeof TextInput & {
  defaultProps?: TextInputProps;
};

let defaultFontApplied = false;

const lexendByWeight: Record<string, string> = {
  "100": "Lexend-Thin",
  "200": "Lexend-ExtraLight",
  "300": "Lexend-Light",
  "400": "Lexend-Regular",
  normal: "Lexend-Regular",
  "500": "Lexend-Medium",
  "600": "Lexend-SemiBold",
  "700": "Lexend-Bold",
  bold: "Lexend-Bold",
  "800": "Lexend-ExtraBold",
  "900": "Lexend-Black",
};

const getLexendFamily = (style?: StyleProp<TextStyle>) => {
  const flattened = StyleSheet.flatten(style);
  const currentFamily = flattened?.fontFamily;
  const weight = flattened?.fontWeight;

  if (weight) {
    return lexendByWeight[String(weight)] || currentFamily || "Lexend-Regular";
  }

  return currentFamily?.startsWith("Lexend-")
    ? currentFamily
    : "Lexend-Regular";
};

const withLexendFont = (style?: StyleProp<TextStyle>) => [
  style,
  {
    fontFamily: getLexendFamily(style),
    fontWeight: "400" as const,
  },
];

const patchTextRender = (
  Component: typeof Text | typeof TextInput,
  key: "__lexendPatchedText" | "__lexendPatchedTextInput",
) => {
  const component = Component as typeof Component & {
    render?: (...args: unknown[]) => React.ReactElement;
    [key]?: boolean;
  };

  if (!component.render || component[key]) {
    return;
  }

  const originalRender = component.render;
  component.render = function renderWithLexend(...args: unknown[]) {
    const origin = originalRender.apply(this, args) as React.ReactElement<{
      style?: StyleProp<TextStyle>;
    }>;

    return React.cloneElement(origin, {
      style: withLexendFont(origin.props.style),
    });
  };
  component[key] = true;
};

const applyDefaultFont = () => {
  if (defaultFontApplied) {
    return;
  }

  const defaultText = Text as TextWithDefaultProps;
  const defaultTextInput = TextInput as TextInputWithDefaultProps;

  defaultText.defaultProps = defaultText.defaultProps || {};
  defaultText.defaultProps.style = [
    { fontFamily: "Lexend-Regular" },
    defaultText.defaultProps.style,
  ];

  defaultTextInput.defaultProps = defaultTextInput.defaultProps || {};
  defaultTextInput.defaultProps.style = [
    { fontFamily: "Lexend-Regular" },
    defaultTextInput.defaultProps.style,
  ];

  patchTextRender(Text, "__lexendPatchedText");
  patchTextRender(TextInput, "__lexendPatchedTextInput");
  defaultFontApplied = true;
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "Lexend-Thin": require("../assets/fonts/Lexend-Thin.ttf"),
    "Lexend-ExtraLight": require("../assets/fonts/Lexend-ExtraLight.ttf"),
    "Lexend-Light": require("../assets/fonts/Lexend-Light.ttf"),
    "Lexend-Regular": require("../assets/fonts/Lexend-Regular.ttf"),
    "Lexend-Medium": require("../assets/fonts/Lexend-Medium.ttf"),
    "Lexend-SemiBold": require("../assets/fonts/Lexend-SemiBold.ttf"),
    "Lexend-Bold": require("../assets/fonts/Lexend-Bold.ttf"),
    "Lexend-ExtraBold": require("../assets/fonts/Lexend-ExtraBold.ttf"),
    "Lexend-Black": require("../assets/fonts/Lexend-Black.ttf"),
  });

  useEffect(() => {
    if (!fontsLoaded && !fontError) {
      return;
    }

    SplashScreen.hideAsync();
  }, [fontError, fontsLoaded]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (fontsLoaded) {
    applyDefaultFont();
  }

  return (
    <KeyboardProvider>
      <StatusBar style="dark" backgroundColor="#FFFFFF" translucent={false} />

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="achievements" />
        <Stack.Screen name="leaderboard" />
      </Stack>

      <AchievementUnlockPopup />
    </KeyboardProvider>
  );
}
