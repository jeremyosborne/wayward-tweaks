//
// Rubber duck debugging tools.
//
// Recommend importing as: `import * as rubberDuck from './rubber-duck'`
//
import { ActionType } from "entity/action/IAction"
import { IItemDescription, ItemType, ItemTypeGroup } from "item/IItem"
import { itemDescriptions, itemGroupDescriptions } from "item/Items"
import Log from "utilities/Log"

const logger = new Log("rubber-duck")

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
