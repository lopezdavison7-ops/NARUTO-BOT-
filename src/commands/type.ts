import type { BotContext, ReplyFn } from '@/types';

export interface Command {
  /** Nombre principal */
  name: string;
  /** Alias extras */
  aliases?: string[];
  /** Descripción */
  description: string;
  /** Categoría (para /menu) */
  category: string;
  /** Solo owner */
  ownerOnly?: boolean;
  /** Cooldown en segundos */
  cooldown?: number;
  /** Ejecutar */
  execute: (ctx: BotContext, reply: ReplyFn) => Promise<void>;
}