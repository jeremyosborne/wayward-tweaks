//
// Rubber duck debugging tools.
//
// Recommend importing as: `import * as rubberDuck from './rubber-duck'`
//
import { DoodadType, DoodadTypeGroup } from "doodad/IDoodad"
import { ActionType } from "entity/action/IAction"
import { CreatureType, TileGroup } from "entity/creature/ICreature"
import { DamageType, StatusType } from "entity/IEntity"
import { SkillType } from "entity/IHuman"
import { BiomeType } from "game/IBiome"
import {
  EquipEffect,
  IItemDescription,
  ItemType,
  ItemTypeGroup,
} from "item/IItem"
import { itemDescriptions, itemGroupDescriptions } from "item/Items"
import Log from "utilities/Log"

const logger = new Log("rubber-duck")

// Because humans can reason about strings better than numbers.
const toActionType = (actionType?: ActionType) =>
  actionType && (ActionType[actionType] || actionType)
const toBiomeType = (biomeType?: BiomeType) =>
  biomeType && (BiomeType[biomeType] || biomeType)
const toCreatureType = (creatureType?: CreatureType) =>
  creatureType && (CreatureType[creatureType] || creatureType)
const toDoodadTypeOrGroup = (doodadType?: DoodadType) =>
  doodadType &&
  (DoodadType[doodadType] || DoodadTypeGroup[doodadType] || doodadType)
/** ItemGroups are offset and can't collide with ItemType enumerations, otherwise recipe components would break. */
const toItemTypeOrGroup = (itemType?: ItemType | ItemTypeGroup) =>
  itemType && (ItemType[itemType] || ItemTypeGroup[itemType] || itemType)
const toSkillType = (skillType?: SkillType) =>
  skillType && (SkillType[skillType] || skillType)
const toStatusType = (statusType?: StatusType) =>
  statusType && (StatusType[statusType] || statusType)
const toTileGroup = (t?: TileGroup) => t && (TileGroup[t] || t)

/**
 * Serialize the itemDescriptions in a more human friendly way and send to the logs.
 */
export const itemDescriptionsDump = (): void => {
  // Deviate from the types to make things human readable.
  const itemDescriptionsDictionary: Record<string, unknown> = {}
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
