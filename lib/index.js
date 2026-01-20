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

          // DEBUG: Tampilkan semua global variables
          console.log("DEBUG Global Variables:");
          console.log("- global.nomor:", global.nomor);
          console.log("- global.pairing:", global.pairing);
          console.log("- typeof global.nomor:", typeof global.nomor);
          
          // Ambil nomor dari settings.js
          let cleanNumber = "";
          
          if (global.nomor) {
            cleanNumber = global.nomor.toString().replace(/\D/g, "");
            console.log(chalk.green(`Nomor setelah cleaning: ${cleanNumber}\n`));
            
            // Validasi panjang nomor
            if (cleanNumber.length < 10) {
              console.log(chalk.red(`Nomor terlalu pendek: ${cleanNumber.length} digit`));
              throw new Error("Nomor tidak valid");
            }
          } else {
            console.log(chalk.red("ERROR: global.nomor tidak ditemukan!"));
            console.log(chalk.yellow("Pastikan di settings.js ada:"));
            console.log(chalk.yellow("global.nomor = '62xxxxxxxxxx';"));
            console.log(chalk.yellow("global.pairing = 'DeviceName';\n"));
            retryCount++;
            await new Promise(r => setTimeout(r, 3000));
            continue;
          }

          // Cek koneksi internet dulu
          console.log(chalk.gray("Testing koneksi ke GitHub..."));
          try {
            const testResponse = await fetch("https://raw.githubusercontent.com/zionjs/database/refs/heads/main/number.json", {
              timeout: 10000
            });
            console.log(chalk.green("✓ Koneksi GitHub OK"));
          } catch (err) {
            console.log(chalk.yellow("⚠ Tidak bisa akses GitHub, skip validasi"));
          }

          // Request pairing code dengan lebih banyak debug info
          console.log(chalk.gray("\nMeminta pairing code dari WhatsApp..."));
          console.log("Parameters:");
          console.log("- number:", cleanNumber);
          console.log("- pairingName:", global.pairing || "MyBot");
          
          const code = await sock.requestPairingCode(
            cleanNumber,
            global.pairing || "MyBot-Device" // Default jika tidak ada
          );

          if (!code || code.length < 6) {
            throw new Error("Pairing code tidak valid diterima");
          }

          console.log("\n" + chalk.cyan("=".repeat(50)));
          console.log(chalk.white("🎯 PAIRING BERHASIL!"));
          console.log(chalk.white("Kode Pairing :"), chalk.green.bold(code));
          console.log(chalk.white("Nomor        :"), chalk.yellow(cleanNumber));
          console.log(chalk.white("Device Name  :"), chalk.cyan(global.pairing || "MyBot"));
          console.log(chalk.cyan("=".repeat(50)) + "\n");

          console.log(chalk.green("✓ Bot siap digunakan!"));
          return;

        } catch (error) {
          retryCount++;
          console.log(chalk.red(`\n✗ ERROR (${retryCount}/${maxRetries})`));
          console.log(chalk.red(`Pesan: ${error.message}`));
          console.log(chalk.red(`Stack: ${error.stack?.split('\n')[0]}`));

          if (retryCount < maxRetries) {
            console.log(chalk.yellow(`\nMencoba lagi dalam 5 detik...`));
            await new Promise(r => setTimeout(r, 5000));
          } else {
            console.log(chalk.red("\n⚠ Gagal total, restarting..."));
            setTimeout(() => {
              console.log(chalk.yellow("Restarting connection..."));
              sockstart();
            }, 5000);
          }
        }
      }
    }

    await getPairingCode();
  }
}

// Export fungsi keamanan supaya bisa dipakai di file utama bot
exports.azul = azul;