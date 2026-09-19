import type { Command } from '../types';
import { getAll } from '../handler';

export const menuCommand: Command = {
  name: 'menu',
  aliases: ['help', 'h'],
  description: 'Lista de comandos',
  category: 'system',

  async execute(ctx, reply) {
    const cmds = getAll();
    const PREFIX = '.';

    let text = `╔══════════════════════╗\n`;
    text += `║  🦊 NARUTO BOT      ║\n`;
    text += `╚══════════════════════╝\n\n`;

    // Agrupar por categoría
    const cats: Record<string, typeof cmds> = {};
    for (const cmd of cmds) {
      if (!cats[cmd.category]) cats[cmd.category] = [];
      cats[cmd.category].push(cmd);
    }

    for (const [cat, list] of Object.entries(cats)) {
      text += `📂 *${cat.toUpperCase()}*\n`;
      for (const cmd of list) {
        text += `  ${PREFIX}${cmd.name} — ${cmd.description}\n`;
      }
      text += '\n';
    }

    text += `_Prefijo: "${PREFIX}"_`;
    await reply(text);
  },
};