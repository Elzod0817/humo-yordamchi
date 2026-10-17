require('dotenv').config();
const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

// Qora ro'yxat (so'kinish va yomon so'zlar) - buni o'zingiz kengaytirishingiz mumkin
const badWords = require('./words.js'); 

bot.start((ctx) => ctx.reply('Assalomu alaykum! Men guruh nazoratchisiman. Meni guruhga qo\'shing va admin qiling.'));

bot.on('new_chat_members', async (ctx) => {
    const newMembers = ctx.message.new_chat_members;
    for (const member of newMembers) {
        // Agar guruhga botning o'zi qo'shilsa, o'ziga-o'zi xabar yozmasligi uchun
        if (member.id === ctx.botInfo.id) continue;
        
        // Yangi a'zoga ismini belgilab murojaat qilish
        const welcomeMsg = await ctx.reply(`Assalomu alaykum, [${member.first_name}](tg://user?id=${member.id})! Humo Logistics guruhiga xush kelibsiz.\n\n⚠️ Iltimos, qoidalarga rioya qiling. Guruhda reklama havolalari va haqoratli so'zlar avtomatik o'chiriladi.`, { parse_mode: 'Markdown' });
        
        // Yangi a'zolar ko'paysa guruh chatini to'ldirib yubormaslik uchun bu xabarni 30 soniyadan keyin avtomatik o'chiramiz
        setTimeout(() => {
            ctx.deleteMessage(welcomeMsg.message_id).catch(() => {});
        }, 30000);
    }
});
bot.on('message', async (ctx) => {
    // Agar xabar matn bo'lmasa, uni tekshirib o'tirmaymiz
    if (!ctx.message.text) return; 

    const text = ctx.message.text.toLowerCase();
    let shouldDelete = false;
    let reason = '';

    // 1. Reklama va havolalarni tekshirish (http, https, t.me, www, @username)
    const adRegex = /(https?:\/\/[^\s]+)|(t\.me\/[^\s]+)|(www\.[^\s]+)|(@[a-zA-Z0-9_]+)/g;
    
    if (adRegex.test(text)) {
        shouldDelete = true;
        reason = 'reklama yoki havola';
    }

    // 2. So'kinishlarni tekshirish
    for (const word of badWords) {
        if (text.includes(word)) {
            shouldDelete = true;
            reason = 'taqiqlangan so\'z';
            break;
        }
    }

    // 3. Xabarni o'chirish mantiqi
    if (shouldDelete) {
        try {
            await ctx.deleteMessage(ctx.message.message_id);
            
            // Foydalanuvchini ogohlantirish
            const warning = await ctx.reply(`⚠️ ${ctx.from.first_name}, guruhda ${reason} yuborish mumkin emas!`);
            
            // Ogohlantirish xabarini 5 soniyadan keyin avtomatik o'chirish guruh ifloslanmasligi uchun
            setTimeout(() => {
                ctx.deleteMessage(warning.message_id).catch(() => {});
            }, 5000);

        } catch (error) {
            console.log('Xabarni o\'chirishda xatolik. Bot guruhda admin emas yoki xabar juda eski:', error.message);
        }
    }
});

bot.launch().then(() => {
    console.log('✅ Bot muvaffaqiyatli ishga tushdi!');
});

// Xatoliklarni ushlab qolish uchun
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
const http = require('http');
http.createServer((req, res) => res.end('Bot ishlayapti')).listen(process.env.PORT || 8080);