/**
 * Mobile Haptic Vibration Utility
 * Provides native tactile feedback when testing on mobile devices.
 */

export type HapticType = 'light' | 'medium' | 'heavy' | 'warning' | 'radar' | 'click';

export const triggerHaptic = (type: HapticType = 'light') => {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) {
    return;
  }

  try {
    switch (type) {
      case 'light':
      case 'click':
        navigator.vibrate(15);
        break;
      case 'medium':
        navigator.vibrate(40);
        break;
      case 'heavy':
        navigator.vibrate([60, 40, 60]);
        break;
      case 'radar':
        navigator.vibrate([20, 30, 20]);
        break;
      case 'warning':
        navigator.vibrate([80, 50, 80, 50, 150]);
        break;
      default:
        navigator.vibrate(20);
        break;
    }
  } catch {
    // Vibration blocked or unsupported
  }
};
