import { allMoves } from "#app/data/moves/move";
import { Abilities } from "#enums/abilities";
import { Moves } from "#enums/moves";
import { Species } from "#enums/species";
import GameManager from "#test/testUtils/gameManager";
import Phaser from "phaser";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

describe("Arena - Grassy Terrain", () => {
  let phaserGame: Phaser.Game;
  let game: GameManager;
  beforeAll(() => {
    phaserGame = new Phaser.Game({
      type: Phaser.HEADLESS,
    });
  });

  afterEach(() => {
    game.phaseInterceptor.restoreOg();
  });

  beforeEach(() => {
    game = new GameManager(phaserGame);
    game.override
      .battleStyle("single")
      .disableCrits()
      .enemyLevel(1)
      .enemySpecies(Species.SHUCKLE)
      .enemyAbility(Abilities.STURDY)
      .enemyMoveset(Moves.FLY)
      .moveset([Moves.GRASSY_TERRAIN, Moves.EARTHQUAKE])
      .ability(Abilities.NO_GUARD);
  });

  it("halves the damage of Earthquake", async () => {
    await game.classicMode.startBattle([Species.TAUROS]);

    const eq = allMoves[Moves.EARTHQUAKE];
    vi.spyOn(eq, "calculateBattlePower");

    game.move.select(Moves.EARTHQUAKE);
    await game.toNextTurn();

    expect(eq.calculateBattlePower).toHaveReturnedWith(100);

    game.move.select(Moves.GRASSY_TERRAIN);
    await game.toNextTurn();

    game.move.select(Moves.EARTHQUAKE);
    await game.phaseInterceptor.to("BerryPhase");

    expect(eq.calculateBattlePower).toHaveReturnedWith(50);
  });

  it("Does not halve the damage of Earthquake if opponent is not grounded", async () => {
    await game.classicMode.startBattle([Species.NINJASK]);

    const eq = allMoves[Moves.EARTHQUAKE];
    vi.spyOn(eq, "calculateBattlePower");

    game.move.select(Moves.GRASSY_TERRAIN);
    await game.toNextTurn();

    game.move.select(Moves.EARTHQUAKE);
    await game.phaseInterceptor.to("BerryPhase");

    expect(eq.calculateBattlePower).toHaveReturnedWith(100);
  });
});
