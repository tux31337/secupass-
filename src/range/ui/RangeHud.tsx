import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { radius, spacing, touchTarget } from "../../design/theme.ts";
import { useRangeStore } from "../store/useRangeStore.ts";
import { resetLook } from "../scene/lookControl.ts";

const SPEEDS = [0.5, 1, 2];

// 웹 버전 RangeHUD(CSS)의 RN 재작성. 3D 씬 위 오버레이라 어두운 반투명 패널을 쓴다.
// pointerEvents="box-none"로 빈 영역 터치는 아래 PanResponder(드래그 시선)로 흘린다.

function StatsPanel() {
  const stats = useRangeStore((s) => s.stats);
  if (!stats) return null;

  return (
    <View style={styles.panel}>
      <Text style={styles.panelLabel}>SHOT</Text>
      <View style={styles.statMain}>
        <Text style={styles.statValue}>{Math.round(stats.total)}</Text>
        <Text style={styles.statUnit}>m</Text>
      </View>
      <View style={styles.statRow}>
        <Text style={styles.statKey}>Carry</Text>
        <Text style={styles.statVal}>{Math.round(stats.carry)} m</Text>
      </View>
      <View style={styles.statRow}>
        <Text style={styles.statKey}>Apex</Text>
        <Text style={styles.statVal}>{stats.apex.toFixed(1)} m</Text>
      </View>
      <View style={styles.statRow}>
        <Text style={styles.statKey}>Ball Speed</Text>
        <Text style={styles.statVal}>{Math.round(stats.ballSpeedKmh)} km/h</Text>
      </View>
    </View>
  );
}

function HudButton({
  label,
  active,
  onPress,
  compact,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
  compact?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        compact && styles.buttonCompact,
        active && styles.buttonActive,
        pressed && styles.buttonPressed,
      ]}
    >
      <Text style={[styles.buttonText, active && styles.buttonTextActive]}>{label}</Text>
    </Pressable>
  );
}

function Controls() {
  const status = useRangeStore((s) => s.status);
  const speed = useRangeStore((s) => s.speed);
  const toggle = useRangeStore((s) => s.toggle);
  const restart = useRangeStore((s) => s.restart);
  const setSpeed = useRangeStore((s) => s.setSpeed);

  const playLabel =
    status === "playing" ? "❚❚ Pause" : status === "finished" ? "▶ Replay" : "▶ Play";

  return (
    <View style={styles.controls}>
      <View style={styles.controlRow}>
        <HudButton label={playLabel} onPress={toggle} />
        <HudButton label="↻ Restart" onPress={restart} />
        <HudButton label="시선 리셋" onPress={resetLook} />
      </View>
      <View style={styles.controlRow}>
        <Text style={styles.panelLabel}>SPEED</Text>
        {SPEEDS.map((s) => (
          <HudButton
            key={s}
            label={`${s}×`}
            compact
            active={s === speed}
            onPress={() => setSpeed(s)}
          />
        ))}
      </View>
    </View>
  );
}

function ProgressBar() {
  const progress = useRangeStore((s) => s.progress);
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
    </View>
  );
}

export function RangeHud({ onExit }: { onExit: () => void }) {
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <View
        pointerEvents="box-none"
        style={[styles.topRow, { paddingTop: insets.top + spacing.sm }]}
      >
        <HudButton label="← 퀴즈로" onPress={onExit} />
        <StatsPanel />
      </View>

      <View
        pointerEvents="box-none"
        style={[styles.bottomArea, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}
      >
        <Controls />
        <ProgressBar />
      </View>
    </View>
  );
}

const hudColors = {
  panel: "rgba(16, 28, 18, 0.72)",
  panelBorder: "rgba(255, 255, 255, 0.22)",
  text: "#f3f8ee",
  textDim: "rgba(243, 248, 238, 0.65)",
  accent: "#ffd23c",
};

const styles = StyleSheet.create({
  topRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
  },
  bottomArea: {
    gap: spacing.sm,
    marginTop: "auto",
    paddingHorizontal: spacing.md,
  },
  panel: {
    backgroundColor: hudColors.panel,
    borderColor: hudColors.panelBorder,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 2,
    minWidth: 132,
    padding: spacing.md,
  },
  panelLabel: {
    color: hudColors.textDim,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  statMain: {
    alignItems: "baseline",
    flexDirection: "row",
    gap: 3,
  },
  statValue: {
    color: hudColors.accent,
    fontSize: 30,
    fontWeight: "800",
  },
  statUnit: {
    color: hudColors.textDim,
    fontSize: 14,
    fontWeight: "700",
  },
  statRow: {
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  statKey: {
    color: hudColors.textDim,
    fontSize: 12,
  },
  statVal: {
    color: hudColors.text,
    fontSize: 12,
    fontWeight: "700",
  },
  controls: {
    backgroundColor: hudColors.panel,
    borderColor: hudColors.panelBorder,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.sm,
  },
  controlRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  button: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderColor: hudColors.panelBorder,
    borderRadius: radius.sm,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: touchTarget.minHeight - 8,
    paddingHorizontal: spacing.md,
  },
  buttonCompact: {
    minHeight: touchTarget.minHeight - 16,
    paddingHorizontal: spacing.sm,
  },
  buttonActive: {
    backgroundColor: hudColors.accent,
    borderColor: hudColors.accent,
  },
  buttonPressed: {
    backgroundColor: "rgba(255, 255, 255, 0.28)",
  },
  buttonText: {
    color: hudColors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  buttonTextActive: {
    color: "#1f2b14",
  },
  progressTrack: {
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderRadius: 2,
    height: 4,
    overflow: "hidden",
  },
  progressFill: {
    backgroundColor: hudColors.accent,
    borderRadius: 2,
    height: "100%",
  },
});
