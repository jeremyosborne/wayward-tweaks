# Wayward Mod Learnings

This [Wayward mod](https://github.com/WaywardGame/types/wiki/Prerequisites) has a meta theme of learning to make a Wayward mod by experimentation.

Despite being educational, we will be testing out real content changes in this mod. Any content change that is useful will likely wind up in a more official mod.

## What this mod does

- Send a translated message to the player in game, warning them they are using this experimental mod. Commented with `// -- Send message to player` in code.
- Content: modify existing
    - Change `Pemmican` and `Cooked Pemmican`. Commented with `// -- Content: modify existing` in code.
        - `Shredded Meat, Dried` (nee: `Pemmican`): the advantage of making tainted meat edible is a pretty big upside, not to mention it being a food that never decays. Changed the theme of this to be an energy snack vs. a full meal when eaten without additional prep.
        - `Shredded Meat, Fried` (nee: `Cooked Pemmican`): fat would be very precious in a survival situation, and provide much needed nutrition. Made a real meal for anyone wishing to use their fat to fry up some dried meat.
- Content: add new
    - `Shredded Meat, Boiled`, commented with `// -- Content: add new: shredded meat, boiled`
        - Another meal option for `Shredded Meat, Dried`. Uses the much more plentiful water ingredient instead of the scarcer fat. Increases satiation and even adds some thirst quenching, but not as nutritious as `Shredded Meat, Fried`.
    - `Twig Bundle`, commented with `// -- Content: add new: twig bundle`
        - Quality of life improvement for the established player. For when you would rather keep your stone stills around and use them with less mouse clicks. 1 twig bundle should be enough to purify one batch of water and is a way to put those piles of excess twigs to use.
    - `Smoker`, commented with `// -- Content: add new: smoker`
        - Item and doodad intended to be used to preserve excess food. A later game item for established bases.
    - `Tutorial`, commented with `// -- Content: tutorial quest`
        - A simple tutorial introducing all of the items added in this mod.

## Dev Notes

- [Wayward mod API docs](https://waywardgame.github.io/index.html)
- Run `npm run deploy:dev:on-change` for local development and testing of mod.
- File locations
    - MacOS, Steam
        - App: `~/Library/Application\ Support/Steam/steamapps/common/Wayward/Wayward.app/Contents/MacOS/Electron`
        - Game logs: `~/Library/Application\ Support/Steam/steamapps/common/Wayward/logs/wayward.log`
            - Logs will do rotate with newest log being most recently numbered.
        - Mods, local: `~/Library/Application\ Support/Steam/steamapps/common/Wayward/mods/`
        - Mods, steam: `~/Library/Application\ Support/Steam/steamapps/common/Wayward/workshop/mods`
