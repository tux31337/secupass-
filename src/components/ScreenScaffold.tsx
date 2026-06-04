import type { ReactNode } from "react";
import { useMemo } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";

import { spacing, type ThemeColors } from "../design/theme.ts";

const keyboardAvoidingBehavior = Platform.select({
  ios: "padding" as const,
  android: "height" as const,
  default: undefined,
});
const androidStatusBarInset = StatusBar.currentHeight ?? 0;

type ScreenScaffoldProps = {
  answerDock: ReactNode;
  children: ReactNode;
  colors: ThemeColors;
  isDarkMode: boolean;
};

export function ScreenScaffold({ answerDock, children, colors, isDarkMode }: ScreenScaffoldProps) {
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        backgroundColor={colors.background}
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        translucent={false}
      />
      <KeyboardAvoidingView behavior={keyboardAvoidingBehavior} style={styles.keyboardAvoiding}>
        <View style={styles.layout}>
          <ScrollView
            style={styles.contentScroller}
            contentContainerStyle={styles.screen}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>

          {answerDock}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: Platform.OS === "android" ? androidStatusBarInset : 0,
    },
    keyboardAvoiding: {
      flex: 1,
    },
    layout: {
      flex: 1,
    },
    contentScroller: {
      flex: 1,
    },
    screen: {
      flexGrow: 1,
      gap: spacing.lg,
      paddingBottom: spacing.xxl,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.xl,
    },
  });
}
