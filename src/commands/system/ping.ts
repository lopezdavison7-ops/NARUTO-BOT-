import type { Command } from '../types';

export const pingCommand: Command = {
  name: 'ping',
  aliases: ['p'],
  description: 'Verificar latencia del bot',
  category: 'system',

  async execute(ctx, reply) {
    const start = Date.now();
    await reply('🏓 Pong!');
    const ms = Date.now() - start;
    await reply(`⚡ ${ms}ms | 🦊 NARUTO BOT activo`);
  },
};