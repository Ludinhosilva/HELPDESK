/**
 * Capacitor platform detection utilities.
 * Works both in Capacitor native environment and regular web browser.
 */

let _isCapacitor: boolean | null = null;

export function isNativePlatform(): boolean {
  if (_isCapacitor !== null) return _isCapacitor;

  if (typeof window === "undefined") {
    _isCapacitor = false;
    return false;
  }

  // Check for Capacitor bridge
  const win = window as Window & {
    Capacitor?: { isNativePlatform?: () => boolean };
  };

  if (win.Capacitor?.isNativePlatform?.()) {
    _isCapacitor = true;
    return true;
  }

  _isCapacitor = false;
  return false;
}

export function getPlatform(): "android" | "ios" | "web" {
  if (!isNativePlatform()) return "web";

  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("android")) return "android";
  if (ua.includes("iphone") || ua.includes("ipad")) return "ios";
  return "web";
}

export function isPWAStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches;
}
