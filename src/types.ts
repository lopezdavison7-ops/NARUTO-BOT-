import type { WAMessage, WASocket } from '@whiskeysockets/baileys';

export interface BotContext {
  sock: WASocket;
  msg: WAMessage;
  chatId: string;
  senderId: string;
  senderNumber: string;
  isOwner: boolean;
  isGroup: boolean;
  args: string[];
  text: string;
}

export type ReplyFn = (text: string) => Promise<void>;