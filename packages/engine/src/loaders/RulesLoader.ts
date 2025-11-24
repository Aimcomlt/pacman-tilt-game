import { Ruleset } from '@pacman/shared';

export const RulesLoader = {
  parse(raw: unknown): Ruleset {
    const data = raw as Partial<Ruleset>;
    if (!data) throw new Error('Missing rules');

    const { tickRate, pelletScore, powerPelletScore, ghostScore, powerModeDurationMs } = data;

    const numbers: (keyof Ruleset)[] = ['tickRate', 'pelletScore', 'powerPelletScore', 'ghostScore', 'powerModeDurationMs'];
    numbers.forEach((key) => {
      if (typeof data[key] !== 'number' || Number.isNaN(data[key])) {
        throw new Error(`Invalid rules value for ${key}`);
      }
    });

    return {
      tickRate: tickRate as number,
      pelletScore: pelletScore as number,
      powerPelletScore: powerPelletScore as number,
      ghostScore: ghostScore as number,
      powerModeDurationMs: powerModeDurationMs as number,
    };
  },
};
