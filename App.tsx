import { useMemo } from "react";
import { useColorScheme } from "react-native";

import { getThemeColors } from "./src/design/theme.ts";
import { StudyScreen } from "./src/screens/StudyScreen.tsx";

export default function App() {
  const colorScheme = useColorScheme();
  const colors = useMemo(() => getThemeColors(colorScheme), [colorScheme]);
  const isDarkMode = colorScheme === "dark";

  return <StudyScreen colors={colors} isDarkMode={isDarkMode} />;
}
