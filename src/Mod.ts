import { DoodadType, DoodadTypeGroup } from "doodad/IDoodad"
import { ActionType } from "entity/action/IAction"
import { SkillType } from "entity/IHuman"
import { MessageType } from "entity/player/IMessageManager"
import Player from "entity/player/Player"
import { QuestType } from "entity/player/quest/quest/IQuest"
import { Quest } from "entity/player/quest/quest/Quest"
import { QuestRequirementType } from "entity/player/quest/requirement/IRequirement"
import { GameMode } from "game/options/IGameOptions"
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

export default class WaywardModLearnings extends Mod {
  static MOD_ID = "WayardModLearnings"

  @Mod.instance<WaywardModLearnings>(WaywardModLearnings.MOD_ID)
  public static readonly INSTANCE: WaywardModLearnings

  // -- Content: add new: twig bundle
  // Translations are keyed via the pseudo code template `mod${modName.removeSpaces().startCase()${item id}}`.
  // Here the translation key would be `modWaywardModLearningsTwigBundle` and an English translation
  // would be defined in the file `lang/english.json` at the key `dictionaries.item.modWaywardModLearningsTwigBundle`.
  //
  // Item images must be provided and named `${item id.lowerCase()}.png` for the 16x16 pixel inventory image, and
  // `${item id.lowerCase()}_8.png` for the 8x8 item-on-the-ground image. Item images are stored in
  // `static/image/item` and our images for this item are named `twigbundle.png` and `twigbundle_8.png`.
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
  // Translations are keyed via the pseudo code template `mod${modName.removeSpaces().startCase()${item id}}`.
  // Here the translation key would be `modWaywardModLearningsShreddedMeatBoiled` and an English translation
  // would be defined in the file `lang/english.json` at the key `dictionaries.item.modWaywardModLearningsShreddedMeatBoiled`.
  //
  // Item images must be provided and named `${item id.lowerCase()}.png` for the 16x16 pixel inventory image, and
  // `${item id.lowerCase()}_8.png` for the 8x8 item-on-the-ground image. Item images are stored in
  // `static/image/item` and our images for this item are named `shreddedmeatboiled.png` and `shreddedmeatboiled_8.png`.
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
  // Translations are keyed via the pseudo code template `mod${modName.removeSpaces().startCase()${item id}}`.
  // Here the translation key would be `modWaywardModLearningsSmoker` and an English translation
  // would be defined in the file `lang/english.json` at the key `dictionaries.item.modWaywardModLearningsSmoker`.
  //
  // Item images must be provided and named `${item id.lowerCase()}.png` for the 16x16 pixel inventory image, and
  // `${item id.lowerCase()}_8.png` for the 8x8 item-on-the-ground image. Item images are stored in
  // `static/image/item` and our images for this item are named `smoker.png` and `smoker_8.png`.
  //
  // This particular item can be `built` into a structure, defined as a `doodad` below.
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
  // Doodads define buildable structures. Translation and images follow the same convention as items, except
  // with `doodad` in the overall namespace.
  @Register.doodad("Smoker", {
    pickUp: [Registry<WaywardModLearnings>().get("itemSmoker")],
    blockMove: true,
    canBreak: true,
    lit: Registry<WaywardModLearnings>().get("doodadLitSmoker"),
    repairItem: Registry<WaywardModLearnings>().get("itemSmoker"),
    particles: { r: 130, g: 128, b: 128 },
    reduceDurabilityOnGather: true,
    isTall: true,
  })
  public doodadSmoker: DoodadType

  // -- Content: add new: smoker
  // Since the smoker doodad and be lit, we need to provide a lit version of the doodad along with an
  // image with the various stages of fire intensity.
  @Register.doodad("LitSmoker", {
    decayMax: 250,
    providesFire: true,
    providesLight: 1,
    blockMove: true,
    canBreak: true,
    revert: Registry<WaywardModLearnings>().get("doodadSmoker"),
    isAnimated: true,
    repairItem: Registry<WaywardModLearnings>().get("itemSmoker"),
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
  //
  // The visual names for `Pemmican` and `CookedPemmican` are changed in the
  // `lang/english.json` file, at the keys:
  // - `dictionaries.item.pemmican`
  // - `dictionaries.item.cookedPemmican`
  itemDescriptionsToModify: Record<string, IItemDescription> = {
    [ItemType.Pemmican]: {
      onUse: {
        [ActionType.Eat]: [1, 10, 2, -1], // modified from: [1, 4, 4, -3]
      },
    },
    [ItemType.CookedPemmican]: {
      onUse: {
        [ActionType.Eat]: [1, 24, 12, 0], // modified from: [2, 12, 6, -1]
      },
    },
  }
  // Hold a reference to the objects we modified to undo our work.
  itemDescriptionsToModifyOriginalsCache: Record<string, IItemDescription> = {}

  @Override
  onInitialize(): void {
    // -- Content: add new: twig bundle
    // Some debug code I used to inspect loaded structures.
    rubberDuck.itemTypeGroup.summarize("Kindling")
    rubberDuck.itemTypeGroup.details("Kindling")
    const stokeFireValue =
      // There are many globals available in this game, discoverable at `https://waywardgame.github.io/globals.html`
      itemDescriptions[ItemType.Twigs].onUse?.[ActionType.StokeFire]
    // Log messages are automagically prefixed with our mod name and the function works similar to `console.log`.
    this.getLog().debug(
      "\n\nDEBUG: Stoke fire value for twigs is:",
      stokeFireValue
    )

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

  // -- Content: tutorial quest
  // Each node of the overall quest is defined as a quest type, and then linked to the
  // next stage of the quest.
  @Register.quest(
    "TutorialStart",
    new Quest().setNeedsManualCompletion().addChildQuests(
      // Conventional way to retrieve a reference to something on our own mod.
      Registry<WaywardModLearnings>().get("questTutorialShreddedMeatDried")
    )
  )
  public questTutorialStart: QuestType

  @Register.quest(
    "TutorialShreddedMeatDried",
    new Quest()
      .addRequirement(QuestRequirementType.Craft, [ItemType.Pemmican], 1)
      .addChildQuests(
        Registry<WaywardModLearnings>().get("questTutorialShreddedMeatFried")
      )
  )
  public questTutorialShreddedMeatDried: QuestType

  @Register.quest(
    "TutorialShreddedMeatFried",
    new Quest()
      .addRequirement(QuestRequirementType.Craft, [ItemType.CookedPemmican], 1)
      .addChildQuests(
        Registry<WaywardModLearnings>().get("questTutorialShreddedMeatBoiled")
      )
  )
  public questTutorialShreddedMeatFried: QuestType

  @Register.quest(
    "TutorialShreddedMeatBoiled",
    new Quest()
      .addRequirement(
        QuestRequirementType.Craft,
        [Registry<WaywardModLearnings>().get("itemShreddedMeatBoiled")],
        1
      )
      .addChildQuests(
        Registry<WaywardModLearnings>().get("questTutorialTwigBundle")
      )
  )
  public questTutorialShreddedMeatBoiled: QuestType

  @Register.quest(
    "TutorialTwigBundle",
    new Quest()
      .addRequirement(
        QuestRequirementType.Craft,
        [Registry<WaywardModLearnings>().get("itemTwigBundle")],
        1
      )
      .addChildQuests(
        Registry<WaywardModLearnings>().get("questTutorialSmoker")
      )
  )
  public questTutorialTwigBundle: QuestType

  @Register.quest(
    "TutorialSmoker",
    new Quest()
      .addRequirement(
        QuestRequirementType.Craft,
        [Registry<WaywardModLearnings>().get("itemSmoker")],
        1
      )
      .addChildQuests(Registry<WaywardModLearnings>().get("questTutorialEnd"))
  )
  public questTutorialSmoker: QuestType

  @Register.quest("TutorialEnd", new Quest().setNeedsManualCompletion())
  public questTutorialEnd: QuestType

  @HookMethod
  @Override
  public onPlayerJoin(player: Player): void {
    // -- Content: tutorial quest
    // Needed to apply quest to players in multiplayer.
    this.addQuestTutorial(player)
  }

  @HookMethod
  @Override
  public onGameStart(isLoadingSave: boolean, playedCount: number): void {
    if (!multiplayer.isConnected() || !multiplayer.isClient()) {
      // -- Content: tutorial quest
      // Needed to apply quest to player in a single player game.
      this.addQuestTutorial()
    }
  }

  private addQuestTutorial(player: Player = localPlayer) {
    // -- Content: tutorial quest
    // DEBUG: docs say `Removes all quests & disposes of any quest requirement trigger`, but I don't see an easier
    // way to remove and restart our quest for testing.
    // player.quests.reset()
    if (
      game.getGameMode() !== GameMode.Challenge &&
      player.quests
        .getQuests()
        .every((quest) => quest.data.type !== this.questTutorialStart)
    ) {
      player.quests.add(this.questTutorialStart)
    }
  }
}
