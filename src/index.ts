// ╔══════════════════════════════════════╗
// ║  🦊 NARUTO BOT                      ║
// ║  Entry point                        ║
// ╚══════════════════════════════════════╝

import { askPhone } from '@/core/ask';
import { createBot } from '@/core/bot';
import { register } from '@/commands/handler';

// ─── REGISTRAR COMANDOS ───
// Agrega aquí cada comando nuevo
import { pingCommand } from '@/commands/system/ping';
import { menuCommand } from '@/commands/system/menu';

register(pingCommand);
register(menuCommand);

// ─── ARRANQUE ───
async function main() {
  console.log('🦊 NARUTO BOT v1.0\n');

  const phone = await askPhone();
  await createBot(phone);
}

main().catch(err => {
  console.error('💥 Error fatal:', err);
  process.exit(1);
});