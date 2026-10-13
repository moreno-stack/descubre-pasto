import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

/** Vibración corta al tocar. En el navegador cae a navigator.vibrate o no hace nada. */
export function tap(strength: "light" | "medium" | "heavy" = "light") {
  const style = strength === "heavy" ? ImpactStyle.Heavy : strength === "medium" ? ImpactStyle.Medium : ImpactStyle.Light;
  Haptics.impact({ style }).catch(() => {
    try { navigator.vibrate?.(strength === "light" ? 8 : 18); } catch { /* sin vibración */ }
  });
}

export function success() {
  Haptics.notification({ type: NotificationType.Success }).catch(() => tap("medium"));
}
