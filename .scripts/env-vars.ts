import * as path from "path"
import modJSON from "../mod.json"

export const DIR_MOD = path.resolve(__dirname, "../")
// Where we can place our development mod for the game to recognize.
export const DIR_WAYWARD_MODS_LOCAL =
  "~/Library/Application Support/Steam/steamapps/common/Wayward/mods"
// Game archive we can extract resources from.
export const DIR_WAYWARD_ASAR =
  "~/Library/Application Support/Steam/steamapps/common/Wayward/Wayward.app/Contents/Resources/app.asar"
// Location where we extract game resources to.
export const DIR_RESOURCES_EXTRACTED = path.join(DIR_MOD, "wayward-resources")
export const MOD_NAME = modJSON.name

/** Make paths friendly for shell commands. */
export const escapePath = (p: string) => p.replace(/(\s+)/g, "\\$1")
