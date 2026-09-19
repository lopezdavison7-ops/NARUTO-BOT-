import type { Command } from './types';
import type { BotContext, ReplyFn } from '@/types';

// ─── REGISTRO ───
const commands = new Map<string, Command>();

export function register(cmd: Command) {
  commands.set(cmd.name, cmd);
  for (const alias of cmd.aliases || []) {
    commands.set(alias, cmd);
  }
}

export function getAll(): Command[] {
  const seen = new Set<string>();
  const result: Command[] = [];
  for (const cmd of commands.values()) {
    if (!seen.has(cmd.name)) {
      seen.add(cmd.name);
      result.push(cmd);
    }
  }
  return result;
}

export async function execute(
  cmdName: string,
  ctx: BotContext,
  reply: ReplyFn
): Promise<boolean> {
  const cmd = commands.get(cmdName);
  if (!cmd) return false;

  // Guard owner
  if (cmd.ownerOnly && !ctx.isOwner) {
    await reply('🔒 Solo el owner puede usar esto.');
    return true;
  }

  try {
    await cmd.execute(ctx, reply);
  } catch (err: any) {
    console.error(`❌ Error en /${cmd.name}:`, err.message);
    await reply('💥 Error interno.');
  }

  return true;
}