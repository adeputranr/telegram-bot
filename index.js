const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
app.use(express.json());

// ==============================
// CONFIG
// ==============================
const token = "8177406788:AAFO7SpjNM1DYeSzMgpXbulZGNvqSrNG-5c";
const GROUP_ID = "-1003773056558";

// ==============================
// INIT BOT
// ==============================
const bot = new TelegramBot(token, { polling: true });

// SIMPAN USER
const users = {};


// ==============================
// START COMMAND
// ==============================
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id,
`🔥 VIP MAS ADE 🔥

━━━━━━━━━━━━━━━

💎 Akses eksklusif
🔒 Konten private
🚀 Update rutin

💰 Harga: 100K

━━━━━━━━━━━━━━━

Klik tombol di bawah 👇`,
  {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Beli VIP Mas Ade (100K)", callback_data: "VIP" }]
      ]
    }
  });
});


// ==============================
// USER KLIK
// ==============================
bot.on("callback_query", (query) => {
  const chatId = query.message.chat.id;

  const orderId = Date.now().toString();
  users[orderId] = chatId;

  const paymentLink = `https://saweria.co/masadeeee`;

  bot.sendMessage(chatId,
`💰 Pembayaran VIP Mas Ade (100K)

Klik link:
${paymentLink}

📌 WAJIB:
Isi pesan saat donasi dengan kode berikut:

${orderId}

⚠️ Nominal harus MINIMAL 100.000
📌 Pastikan isi kode dengan benar ya`
  );
});


// ==============================
// WEBHOOK SAWERIA
// ==============================
app.post('/webhook', async (req, res) => {
  try {
    console.log("DATA MASUK:", req.body);

    const amount = req.body.amount_raw || 0;
    const message = req.body.message || "";

    const orderId = message.trim();
    const telegram_id = users[orderId];

    if (!telegram_id) {
      console.log("User tidak ditemukan:", orderId);
      return res.sendStatus(200);
    }

    if (amount < 100000) {
      await bot.sendMessage(
        telegram_id,
        `❌ PEMBAYARAN GAGAL

Nominal kurang dari 100.000

Silakan chat @mas_adeee`
      );
      return res.sendStatus(200);
    }

    const invite = await bot.createChatInviteLink(
      GROUP_ID,
      { member_limit: 1 }
    );

    await bot.sendMessage(
      telegram_id,
      `✅ PEMBAYARAN BERHASIL!

Selamat 🎉 kamu sudah jadi member VIP

Klik link di bawah untuk join:
${invite.invite_link}

⚠️ Link hanya berlaku 1x`
    );

    delete users[orderId];

    res.sendStatus(200);

  } catch (err) {
    console.log("ERROR:", err.message);
    res.sendStatus(500);
  }
});


// ==============================
// RUN SERVER
// ==============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server jalan di port", PORT);
});
