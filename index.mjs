import TelegramBot from "node-telegram-bot-api";
import axios from "axios";
import dotenv from "dotenv";
import { JSONFilePreset } from "lowdb/node";
import fs from "fs/promises";

dotenv.config();

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const defaultData = {
    welcomeMessage: "",
    adsMessage: "",
};
const db = await JSONFilePreset("db.json", defaultData);

// Comando /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const welcomeMessage =
        db.data.welcomeMessage || process.env.DEFAULT_WELCOME_MESSAGE;

    bot.sendMessage(chatId, welcomeMessage);
});

// Comando /welcome_message (solo admin)
bot.onText(/\/welcome_message (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;

    if (chatId !== parseInt(process.env.USER_ID)) {
        return bot.sendMessage(
            chatId,
            "Lo siento, no tienes permiso para usar este comando."
        );
    }

    const newMessage = match[1];
    db.data.welcomeMessage = newMessage;
    await db.write();

    bot.sendMessage(
        chatId,
        `El mensaje de bienvenida ha sido actualizado a:\n\n${newMessage}`
    );
});

// Comando /ads (solo admin)
bot.onText(/\/ads(?:\s+(.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;

    if (chatId !== parseInt(process.env.USER_ID)) {
        return bot.sendMessage(
            chatId,
            "Lo siento, no tenés permiso para usar este comando."
        );
    }

    const newAd = match[1]?.trim() || "";
    db.data.adsMessage = newAd;
    await db.write();

    const respuesta = newAd
        ? `La publicidad ha sido actualizada a:\n\n${newAd}`
        : `La publicidad ha sido eliminada (ahora es una cadena vacía).`;

    bot.sendMessage(chatId, respuesta);
});

// Comando /admin (solo admin)
bot.onText(/\/admin (.+)/, (msg, match) => {
    const chatId = msg.chat.id;

    if (chatId === parseInt(process.env.USER_ID)) {
        const adminMessage = match[1];
        bot.sendMessage(
            chatId,
            `Comando recibido del administrador: ${adminMessage}`
        );
    } else {
        bot.sendMessage(
            chatId,
            "Lo siento, no tienes permiso para usar este comando."
        );
    }
});

// Consultas de precios
bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const userText = msg.text.trim().toUpperCase();

    if (userText.startsWith("/") || userText === "") return;

    try {
        const cryptoId = userText.toLowerCase();
        const res = await axios.get(
            "https://api.coingecko.com/api/v3/simple/price",
            {
                params: {
                    ids: cryptoId,
                    vs_currencies: "usd",
                    api_key: process.env.KEY_coingecko,
                },
            }
        );

        const price = res.data[cryptoId]?.usd;
        if (price) {
            // Leer list.json y buscar el name del id ingresado
            const raw = await fs.readFile("list.json", "utf-8");
            const coins = JSON.parse(raw);
            const coinInfo = coins.find(
                (coin) => coin.id.toLowerCase() === cryptoId
            );
            const coinName = coinInfo ? coinInfo.name : userText;

            let response = `El precio de ${coinName} es ${price} USD`;

            const shouldShowAd = Math.floor(Math.random() * 10) < 3;
            const ad = db.data.adsMessage;

            if (shouldShowAd && ad) {
                response += `\n\n📢 ${ad}`;
            }

            bot.sendMessage(chatId, response);
        } else {
            // Si no se encuentra, buscar coincidencias por símbolo
            const raw = await fs.readFile("list.json", "utf-8");
            const coins = JSON.parse(raw);

            const matches = coins.filter(
                (coin) => coin.symbol.toLowerCase() === cryptoId
            );

            if (matches.length > 0) {
                let suggestions = `No se encontró el precio de "${userText}". Probá con uno de estos ids:\n\n`;
                suggestions += matches
                    .map(
                        (coin) =>
                            `🔹 Utiliza el texto *${coin.id}* para ${coin.name}`
                    )
                    .join("\n");
                bot.sendMessage(chatId, suggestions, {
                    parse_mode: "Markdown",
                });
            } else {
                bot.sendMessage(
                    chatId,
                    `No se pudo obtener el precio de ${userText}. Verifica que el símbolo sea correcto.`
                );
            }
        }
    } catch (error) {
        console.log("Error al consultar precios:", error);
        bot.sendMessage(
            chatId,
            `No se pudo obtener el precio de ${userText}. Intenta nuevamente más tarde.`
        );
    }
});
