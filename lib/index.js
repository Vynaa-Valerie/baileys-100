"use strict";

const chalk = require("chalk");
const fetch = require("node-fetch"); // pastikan ini diinstall
const readline = require("readline");
const path = require("path");
require(path.join(process.cwd(), "settings.js"));

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeWASocket = void 0;
const Socket_1 = __importDefault(require("./Socket"));
exports.makeWASocket = Socket_1.default;
__exportStar(require("../WAProto"), exports);
__exportStar(require("./Utils"), exports);
__exportStar(require("./Types"), exports);
__exportStar(require("./Store"), exports);
__exportStar(require("./Defaults"), exports);
__exportStar(require("./WABinary"), exports);
__exportStar(require("./WAM"), exports);
__exportStar(require("./WAUSync"), exports);

exports.default = Socket_1.default;

async function azul(sock, usePairingCode, sockstart) {
  if (usePairingCode && !sock.authState.creds.registered) {
    async function getPairingCode() {
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          console.clear();

          console.log(chalk.cyan("=== WHATSAPP BOT PAIRING ===\n"));

          // Ambil daftar nomor
          let allowedNumbers = [];
          try {
            console.log(chalk.gray("Mengecek nomor yang diizinkan..."));
            const response = await fetch(
              "https://raw.githubusercontent.com/zionjs/database/refs/heads/main/number.json"
            );
            const data = await response.json();
            allowedNumbers = data.numbers || [];
            console.log(chalk.green("Daftar nomor berhasil dimuat\n"));
          } catch {
            console.log(chalk.yellow("Gagal mengambil daftar nomor, lanjut tanpa validasi\n"));
          }

          // Input nomor
          const numbers = await question("Masukkan nomor WhatsApp (62xxx): ");
          const cleanNumber = numbers.replace(/\D/g, "");

          if (!cleanNumber) {
            console.log(chalk.red("Nomor tidak valid\n"));
            retryCount++;
            continue;
          }

          if (allowedNumbers.length > 0 && !allowedNumbers.includes(cleanNumber)) {
            console.log(chalk.red("Nomor tidak terdaftar untuk pairing"));
            console.log(chalk.gray("Hubungi admin\n"));
            retryCount++;
            continue;
          }

          // Request pairing code
          console.log(chalk.gray("Meminta pairing code..."));
          const code = await sock.requestPairingCode(
            cleanNumber,
            `${global.pairing}`
          );

          console.log("\n==============================");
          console.log("Kode Pairing :", chalk.green.bold(code));
          console.log("Masukkan di  : WhatsApp > Linked Devices");
          console.log("==============================\n");

          console.log(chalk.green("Pairing code berhasil dibuat\n"));
          return;

        } catch (error) {
          retryCount++;
          console.log(chalk.red(`Gagal (${retryCount}/${maxRetries}) : ${error.message}`));

          if (retryCount < maxRetries) {
            console.log("Mencoba lagi...\n");
            await new Promise(r => setTimeout(r, 2000));
          } else {
            console.log("Gagal beberapa kali, restart koneksi...\n");
            setTimeout(sockstart, 5000);
          }
        }
      }
    }

    await getPairingCode();
  }
}

// Export fungsi keamanan supaya bisa dipakai di file utama bot
exports.azul = azul;
