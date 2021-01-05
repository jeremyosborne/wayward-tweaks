//
// Rubber duck debugging tools.
//
// Recommend importing as: `import * as rubberDuck from './rubber-duck'`
//
import { SkillType } from "entity/IHuman"
import { ActionType } from "entity/action/IAction"
import { BiomeType } from "game/IBiome"
import { IItemDescription, ItemType, ItemTypeGroup } from "item/IItem"
import { itemDescriptions, itemGroupDescriptions } from "item/Items"
import Log from "utilities/Log"

const logger = new Log("rubber-duck")

// Because humans can reason about strings better than numbers.
const toActionType = (actionType: ActionType) =>
  ActionType[actionType] || actionType
/** ItemGroups are offset and can't collide with ItemType enumerations, otherwise recipe components would break. */
const toItemTypeOrGroup = (itemType: ItemType | ItemTypeGroup) =>
  ItemType[itemType] || itemType

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
        decaysInto: itemDescription.decaysInto?.map(
          (itemType) => ItemType[itemType] || itemType
        ),
        dismantle: itemDescription.dismantle
          ? {
              ...itemDescription.dismantle,
              items: itemDescription.dismantle.items.map((dismantleItem) => ({
                ...dismantleItem,
                type: ItemType[dismantleItem.type],
              })),
              required: itemDescription.dismantle.required
                ? ItemTypeGroup[itemDescription.dismantle.required]
                : itemDescription.dismantle.required,
              skill: itemDescription.dismantle.skill
                ? SkillType[itemDescription.dismantle.skill]
                : itemDescription.dismantle.skill,
            }
          : undefined,
        onBurn: itemDescription.onBurn?.map(toItemTypeOrGroup),
        onUse: itemDescription.onUse
          ? Object.keys(itemDescription.onUse).reduce(
              (accumulator: Record<string, unknown>, actionType) => {
                const actionEnum = (actionType as unknown) as number
                accumulator[ActionType[actionEnum]] =
                  itemDescription.onUse?.[actionEnum]
                return accumulator
              },
              {}
            )
          : undefined,
        recipe: itemDescription.recipe && {
          ...itemDescription.recipe,
          components: itemDescription.recipe.components.map((component) => {
            return {
              ...component,
              type: toItemTypeOrGroup(component.type),
            }
          }),
          skill: SkillType[itemDescription.recipe.skill],
        },
        skillUse: itemDescription.skillUse
          ? SkillType[itemDescription.skillUse]
          : itemDescription.skillUse,
        spawnOnMerchant: itemDescription.spawnOnMerchant?.map(
          (biomeType) => BiomeType[biomeType] || biomeType
        ),
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
