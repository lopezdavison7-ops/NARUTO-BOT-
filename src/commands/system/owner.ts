import type { Command } from '../types';

export const ownerCommand: Command = {
  name: 'owner',
  aliases: ['creator'],
  description: 'Ver quién es el owner',
  category: 'system',

  async execute(ctx, reply) {
    await reply(`👑 Owner: ${ctx.senderNumber === OWNER ? 'Tú' : OWNER}`);
  },
};