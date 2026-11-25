#!/usr/bin/env node
/**
 * build.js — PRIVADO (não publique no GitHub; coloque no .gitignore)
 *
 * Uso:  node build.js [caminho do Panel]     (padrão: ./Panel)
 *
 * Lê o Panel, calcula o SHA-256 da função H288 (com o BLOB zerado), cifra a tabela
 * secreta com AES-256-GCM usando esse hash como chave e grava o BLOB no próprio arquivo.
 * Rode SEMPRE depois de editar o Panel, antes de dar commit. Sem isso, o script não inicia.
 */
const fs = require("fs"), path = require("path"), crypto = require("crypto");

const TABLE = {
  // nomes de propriedades das stores do Discord
  gQuest: "getQuest", quests: "quests", gRun: "getRunningGames", gPid: "getGameForPID",
  gStrMeta: "getStreamerActiveStreamMetadata", flush: "flushWaitQueue", dispatch: "dispatch", subscribe: "subscribe",
  gPriv: "getSortedPrivateChannels", gActs: "getActivities", gStatus: "getStatus", gCur: "getCurrentUser", gUser: "getUser",
  gGuild: "getGuild", gGuilds: "getGuilds", gGCount: "getGuildCount", gAllG: "getAllGuilds", gChans: "getChannels",
  gVocal: "getVocalChannelIds", gVSCh: "getVoiceStateForChannel", gVS: "getVoiceStates", gVCid: "getVoiceChannelId",
  gCid: "getChannelId", selVC: "selectVoiceChannel", gActStream: "getCurrentUserActiveStream", gMedia: "getMediaEngine",
  gVidDev: "getVideoDevices", gState: "getState", gToken: "getToken", soundshare: "soundshareEnabled",
  // eventos do Flux
  evHb: "QUESTS_SEND_HEARTBEAT_SUCCESS", evRun: "RUNNING_GAMES_CHANGE", evAct: "LOCAL_ACTIVITY_UPDATE",
  evSC: "STREAM_CREATE", evSD: "STREAM_DELETE",
  // trechos de código usados para localizar funções internas
  nStart: 'type:"STREAM_START"', nStop: 'type:"STREAM_STOP"', nSrc: "desktop sources",
  // rotas da API
  pVP: "/video-progress", pHB: "/heartbeat",
};

const file = path.resolve(process.argv[2] || "Panel");
const text = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
const SLOT = /\/\*@blob\*\/"[^"]*"\/\*@end\*\//;
if (!SLOT.test(text)) throw new Error("Slot /*@blob*/ não encontrado no Panel.");

const blank = text.replace(SLOT, "/*@blob*/" + '""' + "/*@end*/");
const start = blank.indexOf("(async function H288() {") + 1;
const end = blank.lastIndexOf("})();") + 1;
if (start < 1 || end < 1) throw new Error("Função H288 não encontrada.");
const own = blank.slice(start, end);

// toda chave usada no código precisa existir na tabela
const used = new Set([...own.matchAll(/\bX\.(\w+)/g)].map((m) => m[1]));
const missing = [...used].filter((k) => !(k in TABLE));
if (missing.length) throw new Error("Chaves usadas e ausentes na TABLE: " + missing.join(", "));

const key = crypto.createHash("sha256").update(own, "utf8").digest();
const iv = crypto.randomBytes(12);
const c = crypto.createCipheriv("aes-256-gcm", key, iv);
const ct = Buffer.concat([c.update(JSON.stringify(TABLE), "utf8"), c.final()]);
const blob = Buffer.concat([iv, ct, c.getAuthTag()]).toString("base64");
const out = text.replace(SLOT, () => '/*@blob*/"' + blob + '"/*@end*/');
fs.writeFileSync(file, out, "utf8");

// autoteste: reproduz o que o navegador faz (toString da função + AES-GCM via WebCrypto)
(async () => {
  const final = fs.readFileSync(file, "utf8");
  const s2 = final.indexOf("(async function H288() {") + 1, e2 = final.lastIndexOf("})();") + 1;
  const fn = (0, eval)("(" + final.slice(s2, e2) + ")");
  const src = Function.prototype.toString.call(fn).replace(/\r\n/g, "\n")
    .replace(/\/\*@blob\*\/"[^"]*"\/\*@end\*\//, "/*@blob*/" + '""' + "/*@end*/");
  const d = await crypto.webcrypto.subtle.digest("SHA-256", new TextEncoder().encode(src));
  const k = await crypto.webcrypto.subtle.importKey("raw", d, "AES-GCM", false, ["decrypt"]);
  const raw = Buffer.from(blob, "base64");
  const plain = await crypto.webcrypto.subtle.decrypt({ name: "AES-GCM", iv: raw.subarray(0, 12) }, k, raw.subarray(12));
  const ok = JSON.parse(new TextDecoder().decode(plain)).evHb === TABLE.evHb;
  console.log(ok ? "OK: selo gravado e verificado (" + used.size + " chaves em uso)." : "FALHOU o autoteste.");
  process.exit(ok ? 0 : 1);
})().catch((e) => { console.error("FALHOU o autoteste:", e.message); process.exit(1); });
