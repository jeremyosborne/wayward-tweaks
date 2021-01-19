//
// Rubber duck debugging tools.
//
// Recommend importing as: `import * as rubberDuck from './rubber-duck'`
//
import { doodadDescriptions } from "doodad/Doodads"
import {
  DoodadType,
  DoodadTypeGroup,
  GrowingStage,
  IDoodadDescription,
} from "doodad/IDoodad"
import { ActionType } from "entity/action/IAction"
import { CreatureType, TileGroup } from "entity/creature/ICreature"
import { DamageType, StatusType } from "entity/IEntity"
import { SkillType } from "entity/IHuman"
import { BiomeType } from "game/IBiome"
import { ILootItem } from "game/ILoot"
import {
  EquipEffect,
  IItemDescription,
  ItemType,
  ItemTypeGroup,
} from "item/IItem"
import { itemDescriptions, itemGroupDescriptions } from "item/Items"
import { TerrainType } from "tile/ITerrain"
import Log from "utilities/Log"

const logger = new Log("rubber-duck")

// Because humans can reason about strings better than numbers.
const toActionType = (t?: ActionType) => t && (ActionType[t] || t)
const toBiomeType = (t?: BiomeType) => t && (BiomeType[t] || t)
const toCreatureType = (t?: CreatureType) => t && (CreatureType[t] || t)
const toDoodadTypeOrGroup = (t?: DoodadType | DoodadTypeGroup) =>
  t && (DoodadType[t] || DoodadTypeGroup[t] || t)
const toGrowingStage = (t?: GrowingStage) => t && (GrowingStage[t] || t)
/** ItemGroups are offset and can't collide with ItemType enumerations, otherwise recipe components would break. */
const toItemTypeOrGroup = (t?: ItemType | ItemTypeGroup) =>
  t && (ItemType[t] || ItemTypeGroup[t] || t)
const toSkillType = (t?: SkillType) => t && (SkillType[t] || t)
const toStatusType = (t?: StatusType) => t && (StatusType[t] || t)
const toTileGroup = (t?: TileGroup) => t && (TileGroup[t] || t)
const toTerrainType = (t?: TerrainType) => t && (TerrainType[t] || t)

/**
 * Serialize the itemDescriptions in a more human friendly way and send to the logs.
 */
export const doodadDescriptionsDump = (): void => {
  // Deviate from the types to make things human readable.
  const doodadDescriptionsDictionary: Record<
    string,
    { [Key in keyof IDoodadDescription]?: unknown }
  > = {}
  for (const [doodadTypeKey, doodadDescription] of Object.entries(
    doodadDescriptions
  )) {
    if (doodadDescription) {
      doodadDescriptionsDictionary[
        `${DoodadType[(doodadTypeKey as unknown) as number] || doodadTypeKey}`
      ] = {
        ...doodadDescription,
        actionTypes: doodadDescription.actionTypes?.map(toActionType),
        allowedTiles: doodadDescription.allowedTiles?.map(toTerrainType),
        burnsLike: doodadDescription.burnsLike?.map(toItemTypeOrGroup),
        // Applies to living doodads.
        gather: doodadDescription.gather && {
          ...Object.keys(doodadDescription.gather).reduce(
            (accumulator: Record<string, unknown>, key) => {
              const keyNum = parseInt(key, 10) || 0
              const loots: ILootItem[] =
                doodadDescription.gather?.[keyNum] || []
              // keys are plain strings not enums
              accumulator[toGrowingStage(keyNum) || "keyerror"] = loots.map(
                (loot) => ({
                  ...loot,
                  type: toItemTypeOrGroup(loot.type),
                })
              )
              return accumulator
            },
            {}
          ),
        },
        gatherSkillUse: toSkillType(doodadDescription.gatherSkillUse),
        group: doodadDescription.group?.map(toDoodadTypeOrGroup),
        harvest: doodadDescription.harvest && {
          ...Object.keys(doodadDescription.harvest).reduce(
            (accumulator: Record<string, unknown>, key) => {
              const keyNum = parseInt(key, 10) || 0
              const loots: ILootItem[] =
                doodadDescription.harvest?.[keyNum] || []
              // keys are plain strings not enums
              accumulator[toGrowingStage(keyNum) || "keyerror"] = loots.map(
                (loot) => ({
                  ...loot,
                  type: toItemTypeOrGroup(loot.type),
                })
              )
              return accumulator
            },
            {}
          ),
        },
        lit: toDoodadTypeOrGroup(doodadDescription.lit),
        pickUp: doodadDescription.pickUp?.map(toItemTypeOrGroup),
        repairItem: toItemTypeOrGroup(doodadDescription.repairItem),
        revert: toDoodadTypeOrGroup(doodadDescription.revert),
        spawnOnTerrain: doodadDescription.spawnOnTerrain?.map(toTerrainType),
        leftOver: toDoodadTypeOrGroup(doodadDescription.leftOver),
      }
    }
  }

  logger.debug(
    `doodadDescriptionsDump, humanized: ${JSON.stringify(
      doodadDescriptionsDictionary
    )}`
  )
}

/**
 * Serialize the itemDescriptions in a more human friendly way and send to the logs.
 */
export const itemDescriptionsDump = (): void => {
  // Deviate from the types to make things human readable.
  const itemDescriptionsDictionary: Record<
    string,
    { [Key in keyof IItemDescription]?: unknown }
  > = {}
  for (const [itemTypeKey, itemDescription] of Object.entries(
    itemDescriptions
  )) {
    if (itemDescription) {
      itemDescriptionsDictionary[
        `${ItemType[(itemTypeKey as unknown) as number] || itemTypeKey}`
      ] = {
        ...itemDescription,
        burnsLike: itemDescription.burnsLike?.map(toItemTypeOrGroup),
        canCureStatus: itemDescription.canCureStatus?.map(toStatusType),
        damageOnUse:
          itemDescription.damageOnUse &&
          Object.keys(itemDescription.damageOnUse).reduce(
            (accumulator: Record<string, unknown>, actionType) => {
              const actionEnum = (actionType as unknown) as number
              accumulator[ActionType[actionEnum]] =
                itemDescription.damageOnUse?.[actionEnum]
              return accumulator
            },
            {}
          ),
        damageType:
          itemDescription.damageType && DamageType[itemDescription.damageType],
        decaysInto: itemDescription.decaysInto?.map(toItemTypeOrGroup),
        dismantle: itemDescription.dismantle && {
          ...itemDescription.dismantle,
          items: itemDescription.dismantle.items.map((dismantleItem) => ({
            ...dismantleItem,
            type: ItemType[dismantleItem.type],
          })),
          required: toItemTypeOrGroup(itemDescription.dismantle.required),
          skill: toSkillType(itemDescription.dismantle.skill),
        },
        doodadContainer: toDoodadTypeOrGroup(itemDescription.doodadContainer),
        equipEffect: itemDescription.equipEffect && [
          EquipEffect[itemDescription.equipEffect[0]],
          itemDescription.equipEffect[1],
        ],
        gather: itemDescription.gather && {
          ...Object.keys(itemDescription.gather).reduce(
            (accumulator: Record<string, unknown>, key) => {
              const gather = (itemDescription.gather as unknown) as Record<
                string,
                ItemType
              >
              // keys are plain strings not enums
              accumulator[key] = toItemTypeOrGroup(gather[key])
              return accumulator
            },
            {}
          ),
        },
        lit: toItemTypeOrGroup(itemDescription.lit),
        onBurn: itemDescription.onBurn?.map(toItemTypeOrGroup),
        onUse:
          itemDescription.onUse &&
          Object.keys(itemDescription.onUse).reduce(
            (accumulator: Record<string, unknown>, actionType) => {
              const actionEnum = (actionType as unknown) as number
              accumulator[ActionType[actionEnum]] =
                itemDescription.onUse?.[actionEnum]
              return accumulator
            },
            {}
          ),
        placeDownType: toDoodadTypeOrGroup(itemDescription.placeDownType),
        recipe: itemDescription.recipe && {
          ...itemDescription.recipe,
          components: itemDescription.recipe.components.map((component) => {
            return {
              ...component,
              type: toItemTypeOrGroup(component.type),
            }
          }),
          skill: toSkillType(itemDescription.recipe.skill),
        },
        requiredForDisassembly: itemDescription.requiredForDisassembly?.map(
          toItemTypeOrGroup
        ),
        returnOnUseAndDecay: itemDescription.returnOnUseAndDecay && {
          ...itemDescription.returnOnUseAndDecay,
          type: toItemTypeOrGroup(itemDescription.returnOnUseAndDecay.type),
        },
        revert: toItemTypeOrGroup(itemDescription.revert),
        skillUse: toSkillType(itemDescription.skillUse),
        spawnableTiles: toTileGroup(itemDescription.spawnableTiles),
        spawnOnBreak: toCreatureType(itemDescription.spawnOnBreak),
        spawnOnDecay: toCreatureType(itemDescription.spawnOnDecay),
        spawnOnMerchant: itemDescription.spawnOnMerchant?.map(toBiomeType),
        tier: itemDescription.tier && {
          ...Object.keys(itemDescription.tier).reduce(
            (accumulator: Record<string, unknown>, itemTypeGroup) => {
              const itemTypeGroupEnum = (itemTypeGroup as unknown) as number
              accumulator[ItemTypeGroup[itemTypeGroupEnum]] =
                itemDescription.tier?.[itemTypeGroupEnum]
              return accumulator
            },
            {}
          ),
        },
        use: itemDescription.use?.map(toActionType),
      }
    }
  }

  logger.debug(
    `itemDescriptions, humanized: ${JSON.stringify(itemDescriptionsDictionary)}`
  )
}

/**
 * Find all edible items and dump out their JSON in an associative array.
 */
export const ediblesDump = (): void => {
  const edibleItemDescriptions: Record<string, IItemDescription> = {}
  for (const [itemTypeKey, itemDescription] of Object.entries(
    itemDescriptions
  )) {
    if (itemDescription?.onUse?.[ActionType.Eat]) {
      edibleItemDescriptions[
        `${ItemType[(itemTypeKey as unknown) as number] || itemTypeKey}`
      ] = itemDescription
    }
  }

  logger.debug(
    `edible items in game: ${JSON.stringify(edibleItemDescriptions)}`
  )
}

/**
 * Make the item type group descriptions use human readable strings instead of
 * numeric enumeration values.
 */
export const itemTypeGroup = {
  summarize: (itg: keyof typeof ItemTypeGroup): void => {
    const itemTypeGroupDescription = itemGroupDescriptions[ItemTypeGroup[itg]]
    logger.debug(
      `ItemTypeGroup summary for ${itg}: types: ${itemTypeGroupDescription.types
        .map((typeEnum) => `${ItemType[typeEnum]} (type enum: ${typeEnum})`)
        .join(", ")} default: ${
        ItemType[itemTypeGroupDescription.default]
      } (type enum: ${itemTypeGroupDescription.default})`
    )
  },

  details: (itg: keyof typeof ItemTypeGroup): void => {
    const itemTypeGroupDescription = itemGroupDescriptions[ItemTypeGroup[itg]]
    logger.debug(
      `ItemTypeGroup details for ${itg}: ${itemTypeGroupDescription.types
        .map((typeEnum) => {
          return `${ItemType[typeEnum]}: ${JSON.stringify(
            itemDescriptions[typeEnum]
          )}`
        })
        .join("; ")}`
    )
  },
}
