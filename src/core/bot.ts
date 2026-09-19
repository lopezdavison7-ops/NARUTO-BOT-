import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  Browsers,
  makeCacheableSignalKeyStore,
  isJidGroup,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import NodeCache from 'node-cache';
import pino from 'pino';
import fs from 'fs';
import { execute } from '@/commands/handler';
import type { BotContext } from '@/types';

const AUTH_DIR = './auth_info';
const PREFIX = '.';
let OWNER = '';

export async function createBot(phone: string) {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

  let version;
  try {
    const { version: v } = await fetchLatestBaileysVersion();
    version = v;
  } catch { /* default */ }

  const logger = pino({ level: 'silent' });
  const msgCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

  const sock = makeWASocket({
    logger,
    printQRInTerminal: false,
    mobile: false,
    browser: Browsers.macOS('Chrome'),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    msgRetryCounterCache: msgCache,
    syncFullHistory: false,
    markOnlineOnConnect: true,
    connectTimeoutMs: 60_000,
    defaultQueryTimeoutMs: 30_000,
    keepAliveIntervalMs: 20_000,
    getMessage: async () => undefined,
    ...(version ? { version } : {}),
  });

  sock.ev.on('creds.update', saveCreds);

  // ─── VINCULACIÓN ───
  let pairDone = false;

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    // Pedir código 8 dígitos
    if (connection === 'open' && !pairDone && !state.creds.registered && phone) {
      pairDone = true;
      await new Promise(r => setTimeout(r, 2000));

      try {
        const code = await sock.requestPairingCode(phone);
        const fmt = code?.match(/.{1,4}/g)?.join('-') || code;

        console.log('\n╔═══════════════════════════════╗');
        console.log('║  🔑 CÓDIGO DE VINCULACIÓN     ║');
        console.log('╠═══════════════════════════════╣');
        console.log(`║  ➤  ${fmt}                  ║`);
        console.log('╠═══════════════════════════════╣');
        console.log(`║  📞 ${phone}                ║`);
        console.log('║                               ║');
        console.log('║  📱 WhatsApp > Dispositivos  ║');
        console.log('║  > Vincular con número       ║');
        console.log('║  > Ingresa el código         ║');
        console.log('╚═══════════════════════════════╝\n');
      } catch (e: any) {
        console.error('❌ Error:', e.message);
        pairDone = false;
      }
    }

    // Conectado → detectar owner
    if (connection === 'open' && state.creds.registered) {
      const me = sock.user?.id || '';
      OWNER = me.split(':')[0].split('@')[0];
      console.log('✅ NARUTO BOT conectado! 🍥');
      console.log(`👑 Owner: ${OWNER}\n`);
    }

    // Desconexión
    if (connection === 'close') {
      const err = new Boom(lastDisconnect?.error) as any;
      const code = err?.output?.statusCode;

      if (code === DisconnectReason.loggedOut) {
        console.log('🔒 Sesión cerrada. Borra auth_info/ y reinicia.');
        process.exit(0);
      }

      if (code === DisconnectReason.badSession || code === 401) {
        fs.rmSync(AUTH_DIR, { recursive: true, force: true });
      }

      console.log('🔄 Reconectando en 5s...');
      setTimeout(() => createBot(phone), 5000);
    }
  });

  // ─── MENSAJES ───
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue;
      if (msg.key.remoteJid === 'status@broadcast') continue;

      const chatId = msg.key.remoteJid!;
      const senderId = isJidGroup(chatId) ? msg.key.participant! : chatId;
      const senderNumber = senderId.split('@')[0];
      const isOwner = senderNumber === OWNER;

      const text = (
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        ''
      ).trim();

      if (!text.startsWith(PREFIX)) continue;

      const parts = text.slice(PREFIX.length).split(/\s+/);
      const cmdName = parts[0].toLowerCase();
      const args = parts.slice(1);

      const reply = async (txt: string) => {
        await sock.sendMessage(chatId, { text: txt }, { quoted: msg });
      };

      const ctx: BotContext = {
        sock,
        msg,
        chatId,
        senderId,
        senderNumber,
        isOwner,
        isGroup: isJidGroup(chatId),
        args,
        text,
      };

      await execute(cmdName, ctx, reply);
    }
  });
}