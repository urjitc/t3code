import type {
  DeviceAccessorySource,
  DeviceModelSource,
} from "@t3tools/client-runtime/device/model";
import type { DevicePlatform } from "@t3tools/contracts";

// Tabula Rasa ships no bundled 3D device meshes (~12 MB). The viewer falls back to
// its generic phone shape, so every lookup returns null.

export function deviceModel(_platform: DevicePlatform, _name: string): DeviceModelSource | null {
  return null;
}

export function deviceKeyboard(
  _platform: DevicePlatform,
  _name: string,
): DeviceAccessorySource | null {
  return null;
}
