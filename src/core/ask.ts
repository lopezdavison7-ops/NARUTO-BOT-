import readline from 'readline';
import fs from 'fs';

const AUTH_DIR = './auth_info';

/** Pregunta el número solo si no hay sesión guardada */
export function askPhone(): Promise<string> {
  // Si ya hay sesión válida, no preguntar
  const credsPath = `${AUTH_DIR}/creds.json`;
  if (fs.existsSync(credsPath)) {
    try {
      const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
      if (creds.registered) {
        console.log('✅ Sesión existente. Arrancando directo.\n');
        return Promise.resolve('');
      }
    } catch { /* corrupta, preguntar */ }
  }

  return new Promise(resolve => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log('\n╔═══════════════════════════════╗');
    console.log('║  🦊 NARUTO BOT               ║');
    console.log('╚═══════════════════════════════╝\n');

    rl.question('📞 Número a vincular (ej: 50578391933)\n> ', answer => {
      rl.close();
      const num = answer.trim().replace(/\D/g, '');
      if (!num) {
        console.error('❌ Número inválido.');
        process.exit(1);
      }
      resolve(num);
    });
  });
}