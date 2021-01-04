import { DoodadType, DoodadTypeGroup } from "doodad/IDoodad"
import { ActionType } from "entity/action/IAction"
import { SkillType } from "entity/IHuman"
import { MessageType } from "entity/player/IMessageManager"
import {
  IItemDescription,
  ItemType,
  ItemTypeGroup,
  RecipeLevel,
} from "item/IItem"
import { itemDescriptions, RecipeComponent } from "item/Items"
import Message from "language/dictionary/Message"
import { HookMethod } from "mod/IHookHost"
import Mod from "mod/Mod"
import Register, { Registry } from "mod/ModRegistry"
import * as rubberDuck from "./rubber-duck"

export default class WaywardTweaks extends Mod {
  static MOD_ID = "WaywardTweaks"

  @Mod.instance<WaywardTweaks>(WaywardTweaks.MOD_ID)
  public static readonly INSTANCE: WaywardTweaks

  @Register.item("TwigBundle", {
    disassemble: true,
    flammable: true,
    onBurn: [ItemType.Charcoal],
    onUse: {
      // Video game logic: 6 * 50 from twigs + a bonus from used up cordage
      [ActionType.StokeFire]: 325,
    },
    recipe: {
      components: [
        RecipeComponent(
          ItemType.Twigs,
          // Twigs assumed to have 50 "stoke fire" strength each.
          6,
          6,
          6,
          false
        ),
        RecipeComponent(ItemTypeGroup.Cordage, 1, 1, 1, false),
      ],
      level: RecipeLevel.Simple,
      reputation: 0,
      skill: SkillType.Camping,
    },
    use: [ActionType.StokeFire],
    // 6 * twig weight, cordage considered neglibaile
    weight: 6 * 0.1,
    // 6 * twig worth plus labor
    worth: 6 * 5 + 5,
  })
  public itemTwigBundle: ItemType

  // -- Content: add new: shredded meat, boiled
  @Register.item("ShreddedMeatBoiled", {
    // Based on cooked pemmican.
    use: [ActionType.Eat],
    decayMax: 5250,
    decaysInto: [ItemType.RottenMeat],
    recipe: {
      components: [
        RecipeComponent(ItemType.Pemmican, 1, 1),
        RecipeComponent(ItemTypeGroup.Liquid, 1, 1, 0, !0),
        RecipeComponent(ItemTypeGroup.CookingEquipment, 1, 0),
      ],
      skill: SkillType.Cooking,
      level: RecipeLevel.Advanced,
      requiresFire: true,
      reputation: 25,
    },
    onBurn: [ItemType.PileOfAsh],
    onUse: { [ActionType.Eat]: [1, 15, 5, 3] },
    skillUse: SkillType.Cooking,
    worth: 25,
  })
  public itemShreddedMeatBoiled: ItemType

  // -- Content: add new: smoker
  // See also: smoker doodads
  @Register.item("Smoker", {
    use: [ActionType.Build],
    recipe: {
      components: [
        RecipeComponent(ItemTypeGroup.Rock, 8, 8, 7),
        RecipeComponent(ItemType.Log, 2, 2, 0),
        RecipeComponent(ItemType.Charcoal, 2, 2, 0),
      ],
      skill: SkillType.Camping,
      level: RecipeLevel.Advanced,
      reputation: -25,
    },
    disassemble: true,
    durability: 25,
    onUse: { [ActionType.Build]: DoodadType.StoneKiln },
    worth: 60,
  })
  public itemSmoker: ItemType

  // -- Content: add new: smoker
  // see also: smoker item
  @Register.doodad("Smoker", {
    pickUp: [Registry<WaywardTweaks>().get("itemSmoker")],
    blockMove: true,
    canBreak: true,
    lit: Registry<WaywardTweaks>().get("doodadLitSmoker"),
    repairItem: Registry<WaywardTweaks>().get("itemSmoker"),
    particles: { r: 130, g: 128, b: 128 },
    reduceDurabilityOnGather: true,
    isTall: true,
  })
  public doodadSmoker: DoodadType

  // -- Content: add new: smoker
  // see also: smoker item
  @Register.doodad("LitSmoker", {
    decayMax: 250,
    providesFire: true,
    providesLight: 1,
    blockMove: true,
    canBreak: true,
    revert: Registry<WaywardTweaks>().get("doodadSmoker"),
    isAnimated: true,
    repairItem: Registry<WaywardTweaks>().get("itemSmoker"),
    particles: { r: 130, g: 128, b: 128 },
    group: [DoodadTypeGroup.FireSource, DoodadTypeGroup.LitStructure],
    tier: {
      [DoodadTypeGroup.FireSource]: 2,
    },
    isTall: true,
  })
  public doodadLitSmoker: DoodadType

  // -- Content: modify existing
  // Item description modifications that will be shallow merged into existing item descriptions.
  itemDescriptionsToModify: Record<string, IItemDescription> = {
    [ItemType.Pemmican]: {
      onUse: {
        [ActionType.Eat]: [1, 10, 2, -1], // modified from: [1, 4, 4, -3]
      },
    },
    [ItemType.CookedPemmican]: {
      onUse: {
        [ActionType.Eat]: [1, 24, 10, 0], // modified from: [2, 12, 6, -1]
      },
    },
  }
  // Hold a reference to the objects we modified to undo our work.
  itemDescriptionsToModifyOriginalsCache: Record<string, IItemDescription> = {}

  @Override
  onInitialize(): void {
    rubberDuck.ediblesDump()

    // -- Content: modify existing
    // Depending on what other mods are running, we can't guarantee that something else didn't
    // modify the itemDescriptions before we get here, so we take precautions.
    for (const [itemTypeKey, itemDescriptionUpdate] of Object.entries(
      this.itemDescriptionsToModify
    )) {
      const itemType = (itemTypeKey as unknown) as ActionType
      const itemTypeName = `${ItemType[itemType] || itemType}`
      const itemDescription = itemDescriptions[itemType]
      this.getLog().debug(
        `modifying ${itemTypeName} itemDescription:`,
        JSON.stringify(itemDescription),
        "with:",
        JSON.stringify(itemDescriptionUpdate)
      )
      if (itemDescription) {
        this.itemDescriptionsToModifyOriginalsCache[itemType] = itemDescription
        // Assume nothing is holding a reference directly to our itemDescription
        // other than the index of itemDescriptions.
        itemDescriptions[itemType] = {
          ...itemDescription,
          ...itemDescriptionUpdate,
        }
      }
    }
  }

  @Override
  onUninitialize(): void {
    // -- Content: modify existing
    // Restore the original item descriptions. This might not be necessary, but better
    // to clean up after ourselves and not worry about it.
    for (const [itemTypeKey, itemDescriptionOriginal] of Object.entries(
      this.itemDescriptionsToModifyOriginalsCache
    )) {
      const itemType = (itemTypeKey as unknown) as ActionType
      const itemDescription = itemDescriptions[itemType]
      this.getLog().debug(
        `restoring ${ItemType[itemType] || itemType} itemDescription:`,
        JSON.stringify(itemDescription),
        "to:",
        JSON.stringify(itemDescriptionOriginal)
      )
      if (itemDescription && itemDescriptionOriginal) {
        this.itemDescriptionsToModifyOriginalsCache[itemType] = itemDescription
        itemDescriptions[itemType] = itemDescriptionOriginal
      }
    }
  }

  // -- Send message to player
  // Translations are keyed via the pseudo code template `mod${modName.removeSpaces().startCase()${message param}}`.
  // Here the translation key would be `modWaywardModLearningsModWarningToPlayer` and an English translation
  // would be defined in the file `lang/english.json` at the key `dictionaries.messages.modWaywardModLearningsModWarningToPlayer`.
  @Register.message("ModWarningToPlayer")
  public readonly messageModWarningToPlayer: Message

  @HookMethod
  @Override
  onGameScreenVisible(): void {
    // -- Send message to player
    localPlayer.messages
      .type(MessageType.Bad)
      .send(this.messageModWarningToPlayer)
  }
}
