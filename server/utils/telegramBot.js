import TelegramBot from 'node-telegram-bot-api';

let bot = null;
let botUsername = '';

export const getBotUsername = () => botUsername;

const formatPrice = (n) => new Intl.NumberFormat('uz-UZ').format(Math.round(n)) + ' UZS';

const statusEmojis = {
  pending:    '⏳',
  confirmed:  '✅',
  processing: '⚙️',
  shipped:    '📦',
  delivered:  '🎉',
  cancelled:  '❌',
  refunded:   '↩️',
};

const statusLabels = {
  pending:    'Ожидает',
  confirmed:  'Подтверждён',
  processing: 'Обрабатывается',
  shipped:    'Отправлен',
  delivered:  'Доручен',
  cancelled:  'Отменён',
  refunded:   'Возврат',
};

const statusLabelsUz = {
  pending:    'Kutilmoqda',
  confirmed:  'Tasdiqlandi',
  processing: 'Jarayonda',
  shipped:    'Yuborildi',
  delivered:  'Yetkazildi',
  cancelled:  'Bekor qilindi',
  refunded:   'Qaytarildi',
};

// ── Order card helpers ────────────────────────────────────────────────────────

const orderInlineKeyboard = (orderId, currentStatus) => {
  const actions = [
    [
      { text: '✅ Подтвердить',   callback_data: `confirm:${orderId}` },
      { text: '⚙️ В обработку',  callback_data: `process:${orderId}` },
    ],
    [
      { text: '📦 Отправлен',     callback_data: `ship:${orderId}` },
      { text: '🎉 Доставлен',     callback_data: `deliver:${orderId}` },
    ],
    [
      { text: '❌ Отменить',      callback_data: `cancel:${orderId}` },
    ],
  ];
  return { inline_keyboard: actions };
};

const formatOrderCard = (order) => {
  const items = order.items
    .map((i, idx) => `  ${idx + 1}. ${i.name}${i.color ? ` (${i.color})` : ''} — ${i.quantity} шт. × ${formatPrice(i.unitPrice)}`)
    .join('\n');

  const delivery = order.deliveryMethod === 'pickup'
    ? `🏪 Самовывоз: ${order.pickupLocation || '—'}`
    : `🚚 ${order.shippingAddress?.district || ''}, ${order.shippingAddress?.street || ''}`;

  // Location line: shown only when no coordinates (coordinates come as a separate pin)
  const locationLine = (() => {
    if (order.location?.latitude && order.location?.longitude) return ''; // pin sent separately
    if (order.location?.address) return `\n📍 Manzil: ${order.location.address}`;
    return '';
  })();

  return `
${statusEmojis[order.status] || '📋'} *Заказ ${order.orderNumber}*
━━━━━━━━━━━━━━━━━━━
👤 ${order.shippingAddress?.fullName || order.guestEmail || 'Гость'}
📱 ${order.shippingAddress?.phone || order.guestPhone || '—'}
${delivery}${locationLine}

🛒 *Товары:*
${items}

💰 Итого: *${formatPrice(order.totalAmount)}*
📅 ${new Date(order.createdAt).toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent' })}
Статус: ${statusEmojis[order.status]} *${statusLabels[order.status] || order.status}*
`.trim();
};

// ── User notification messages ────────────────────────────────────────────────

const userMessages = {
  ru: {
    confirmed:  (num) => `✅ *Ваш заказ ${num} подтверждён!*\nМы приступаем к его подготовке. Спасибо за покупку в Luxury Platok! 🌸`,
    processing: (num) => `⚙️ *Заказ ${num} в обработке*\nМы готовим ваш заказ. Скоро он будет готов к отправке.`,
    shipped:    (num) => `📦 *Заказ ${num} отправлен!*\nВаш заказ уже в пути. Курьер свяжется с вами для уточнения времени доставки.`,
    delivered:  (num) => `🎉 *Заказ ${num} доставлен!*\nНадеемся, вам понравилась покупка!\nБудем рады видеть вас снова. — Luxury Platok 🌸`,
    cancelled:  (num) => `❌ *Заказ ${num} отменён*\nЕсли у вас есть вопросы, напишите нам в Instagram @luxury_platok__`,
  },
  uz: {
    confirmed:  (num) => `✅ *${num} raqamli buyurtmangiz tasdiqlandi!*\nUni tayyorlashni boshladik. Luxury Platok'dan xarid uchun rahmat! 🌸`,
    processing: (num) => `⚙️ *${num} buyurtma jarayonda*\nBuyurtmangizni tayyorlayapmiz. Tez orada jo'natishga tayyor bo'ladi.`,
    shipped:    (num) => `📦 *${num} buyurtma yo'lda!*\nBuyurtmangiz yo'lda. Kuryer siz bilan bog'lanadi.`,
    delivered:  (num) => `🎉 *${num} buyurtma yetkazildi!*\nXaridingizdan mamnun bo'lishingizni umid qilamiz!\nSizni yana ko'rishdan xursand bo'lamiz. — Luxury Platok 🌸`,
    cancelled:  (num) => `❌ *${num} buyurtma bekor qilindi*\nSavollaringiz bo'lsa, Instagram @luxury_platok__ ga yozing`,
  },
};

// ── Singleton bot getter ──────────────────────────────────────────────────────

const getBot = () => bot;

// ── Send new order notification to admin ─────────────────────────────────────

export const sendOrderNotification = async (order) => {
  const instance = getBot();
  const chatId   = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!instance || !chatId) return false;

  try {
    // Send interactive map pin first when customer shared GPS coordinates
    if (order.location?.latitude && order.location?.longitude) {
      await instance.sendLocation(chatId, order.location.latitude, order.location.longitude);
    }
    // Then send the full order card
    await instance.sendMessage(chatId, formatOrderCard(order), {
      parse_mode:   'Markdown',
      reply_markup: orderInlineKeyboard(order._id.toString(), order.status),
    });
    return true;
  } catch (err) {
    console.error('Telegram admin notification failed:', err.message);
    return false;
  }
};

// ── Send status update to customer via their Telegram ────────────────────────
// Accepts either a linked user account (user.telegramId) or a guest chat ID
// stored directly on the order (order.customerTelegramChatId). If neither is
// present the call is silently skipped so the status update still succeeds.

export const sendUserStatusUpdate = async (order, newStatus, user) => {
  const instance = getBot();
  const chatId   = user?.telegramId || order?.customerTelegramChatId;
  if (!instance || !chatId) return false;

  const lang  = user?.preferredLanguage || order?.language || 'ru';
  const msgFn = userMessages[lang]?.[newStatus] || userMessages.ru[newStatus];
  if (!msgFn) return false;

  try {
    await instance.sendMessage(chatId, msgFn(order.orderNumber), {
      parse_mode: 'Markdown',
    });
    return true;
  } catch (err) {
    console.error('Telegram user notification failed:', err.message);
    return false;
  }
};

// ── Legacy plain-text status update to admin ─────────────────────────────────

export const sendStatusUpdate = async (order, newStatus) => {
  const instance = getBot();
  const chatId   = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!instance || !chatId) return false;

  try {
    await instance.sendMessage(
      chatId,
      `${statusEmojis[newStatus] || '📋'} Заказ \`${order.orderNumber}\` → *${(statusLabels[newStatus] || newStatus).toUpperCase()}*`,
      { parse_mode: 'Markdown' }
    );
    return true;
  } catch (err) {
    console.error('Telegram status update failed:', err.message);
    return false;
  }
};

// ── Bot initialiser (call once from server.js) ────────────────────────────────

export const initBot = async () => {
  const token  = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!token) {
    console.warn('⚠️  TELEGRAM_BOT_TOKEN not set — bot disabled');
    return;
  }

  bot = new TelegramBot(token, { polling: true });

  // Cache the bot's own username so it can be exposed via /api/config
  try {
    const me = await bot.getMe();
    botUsername = me.username || '';
    console.log(`🤖 Bot username: @${botUsername}`);
  } catch (e) {
    console.warn('Could not fetch bot username:', e.message);
  }

  // Lazy-import models to avoid circular deps at module load time
  const { default: Order } = await import('../models/Order.js');
  const { default: User  } = await import('../models/User.js');

  const isAdmin = (id) => String(id) === String(chatId);

  const sendOrderList = async (toChatId, orders, title) => {
    if (orders.length === 0) {
      return bot.sendMessage(toChatId, `📭 *${title}*\nЗаказов нет.`, { parse_mode: 'Markdown' });
    }
    await bot.sendMessage(toChatId, `📋 *${title}*`, { parse_mode: 'Markdown' });
    for (const order of orders.slice(0, 8)) {
      await bot.sendMessage(toChatId, formatOrderCard(order), {
        parse_mode:   'Markdown',
        reply_markup: orderInlineKeyboard(order._id.toString(), order.status),
      });
      await new Promise((r) => setTimeout(r, 120)); // avoid flood
    }
  };

  // ── /start — handles three cases:
  //   /start LP-XXXX-XXXX  → customer linking an order for notifications
  //   /start user_<id>     → customer linking their account from Profile page
  //   /start               → admin menu or generic welcome
  bot.onText(/\/start(?:\s+(.+))?/, async (msg, match) => {
    const param    = match?.[1]?.trim();
    const userChatId = String(msg.chat.id);

    // ── Case 1: order deep-link (checkout success button)
    if (param?.startsWith('LP-')) {
      try {
        const order = await Order.findOne({ orderNumber: param }).populate('user');
        if (!order) {
          return bot.sendMessage(userChatId, '❌ Buyurtma topilmadi. / Заказ не найден.');
        }

        // Save chat_id on the order itself (works for both guests and logged-in users)
        order.customerTelegramChatId = userChatId;
        await order.save();

        // Also persist on the user account so future orders are auto-linked
        if (order.user) {
          order.user.telegramId       = userChatId;
          order.user.telegramUsername = msg.chat.username || '';
          await order.user.save();
        }

        const lang = order.language || 'ru';
        const reply = lang === 'uz'
          ? `✅ *${order.orderNumber}* buyurtmangiz uchun Telegram xabarnomalar ulandi!\n\n📦 Buyurtmangiz holati o'zgarganda shu yerda xabar olasiz. 🌸`
          : `✅ Уведомления для заказа *${order.orderNumber}* подключены!\n\n📦 Когда статус вашего заказа изменится, вы получите сообщение здесь. 🌸`;

        return bot.sendMessage(userChatId, reply, { parse_mode: 'Markdown' });
      } catch (e) {
        console.error('/start order link error:', e.message);
        return bot.sendMessage(userChatId, '❌ Xatolik yuz berdi. / Произошла ошибка.');
      }
    }

    // ── Case 2: profile deep-link (Profile page "Connect Telegram" button)
    if (param?.startsWith('user_')) {
      const userId = param.replace('user_', '');
      try {
        const user = await User.findById(userId);
        if (!user) {
          return bot.sendMessage(userChatId, '❌ Foydalanuvchi topilmadi. / Пользователь не найден.');
        }

        user.telegramId       = userChatId;
        user.telegramUsername = msg.chat.username || '';
        await user.save();

        const lang = user.preferredLanguage || 'ru';
        const reply = lang === 'uz'
          ? `✅ *${user.name}*, Telegram muvaffaqiyatli ulandi!\n\nEndi barcha buyurtmalaringiz holati haqida bu yerda xabar olasiz. 🌸`
          : `✅ *${user.name}*, Telegram успешно подключён!\n\nТеперь вы будете получать уведомления об изменении статуса ваших заказов здесь. 🌸`;

        return bot.sendMessage(userChatId, reply, { parse_mode: 'Markdown' });
      } catch (e) {
        console.error('/start user link error:', e.message);
        return bot.sendMessage(userChatId, '❌ Xatolik yuz berdi. / Произошла ошибка.');
      }
    }

    // ── Case 3: admin menu
    if (isAdmin(msg.chat.id)) {
      return bot.sendMessage(
        userChatId,
        `✨ *Luxury Platok — Admin Bot*\n━━━━━━━━━━━━━━━━━━━━\n\n/orders — Последние заказы\n/pending — Ожидающие\n/stats — Статистика за сегодня\n/order \\<номер\\> — Найти заказ\n\nНажимайте кнопки под заказами для обновления статуса.`,
        { parse_mode: 'MarkdownV2' }
      );
    }

    // ── Case 4: generic customer welcome
    return bot.sendMessage(
      userChatId,
      '🌸 Добро пожаловать в *Luxury Platok*!\nДля заказов посетите наш сайт или магазины в Ташкенте.',
      { parse_mode: 'Markdown' }
    );
  });

  // ── /orders ──
  bot.onText(/\/orders/, async (msg) => {
    if (!isAdmin(msg.chat.id)) return;
    try {
      const orders = await Order.find().sort('-createdAt').limit(8).populate('user', 'name telegramId');
      await sendOrderList(msg.chat.id, orders, 'Последние заказы');
    } catch (e) {
      bot.sendMessage(msg.chat.id, '❌ Ошибка получения заказов: ' + e.message);
    }
  });

  // ── /pending ──
  bot.onText(/\/pending/, async (msg) => {
    if (!isAdmin(msg.chat.id)) return;
    try {
      const orders = await Order.find({ status: 'pending' }).sort('-createdAt').populate('user', 'name telegramId');
      await sendOrderList(msg.chat.id, orders, `Ожидающие заказы (${orders.length})`);
    } catch (e) {
      bot.sendMessage(msg.chat.id, '❌ Ошибка: ' + e.message);
    }
  });

  // ── /stats ──
  bot.onText(/\/stats/, async (msg) => {
    if (!isAdmin(msg.chat.id)) return;
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [todayCount, revenueAgg, pendingCount, totalCount] = await Promise.all([
        Order.countDocuments({ createdAt: { $gte: today } }),
        Order.aggregate([
          { $match: { isPaid: true, createdAt: { $gte: today } } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]),
        Order.countDocuments({ status: 'pending' }),
        Order.countDocuments(),
      ]);

      bot.sendMessage(
        msg.chat.id,
        `📊 *Статистика*\n━━━━━━━━━━━━━━━━━━━━\n📦 Заказов сегодня: *${todayCount}*\n💰 Выручка сегодня: *${formatPrice(revenueAgg[0]?.total || 0)}*\n⏳ Ожидают обработки: *${pendingCount}*\n📋 Всего заказов: *${totalCount}*\n📅 ${new Date().toLocaleDateString('ru-RU', { timeZone: 'Asia/Tashkent' })}`,
        { parse_mode: 'Markdown' }
      );
    } catch (e) {
      bot.sendMessage(msg.chat.id, '❌ Ошибка статистики: ' + e.message);
    }
  });

  // ── /order <orderNumber> ──
  bot.onText(/\/order (.+)/, async (msg, match) => {
    if (!isAdmin(msg.chat.id)) return;
    try {
      const term  = match[1].trim().toUpperCase();
      const order = await Order.findOne({
        $or: [{ orderNumber: term }, { _id: term.length === 24 ? term : null }],
      }).populate('user', 'name telegramId preferredLanguage');

      if (!order) return bot.sendMessage(msg.chat.id, `❌ Заказ *${term}* не найден.`, { parse_mode: 'Markdown' });

      bot.sendMessage(msg.chat.id, formatOrderCard(order), {
        parse_mode:   'Markdown',
        reply_markup: orderInlineKeyboard(order._id.toString(), order.status),
      });
    } catch (e) {
      bot.sendMessage(msg.chat.id, '❌ Ошибка: ' + e.message);
    }
  });

  // ── Inline button presses ──
  bot.on('callback_query', async (query) => {
    if (!isAdmin(query.from.id)) {
      return bot.answerCallbackQuery(query.id, { text: 'Нет доступа' });
    }

    const [action, orderId] = (query.data || '').split(':');
    const actionToStatus = {
      confirm: 'confirmed',
      process: 'processing',
      ship:    'shipped',
      deliver: 'delivered',
      cancel:  'cancelled',
    };
    const newStatus = actionToStatus[action];
    if (!newStatus || !orderId) return bot.answerCallbackQuery(query.id, { text: 'Неизвестное действие' });

    try {
      const order = await Order.findById(orderId).populate('user', 'name telegramId preferredLanguage');
      if (!order) return bot.answerCallbackQuery(query.id, { text: '❌ Заказ не найден' });

      order.status = newStatus;
      order.statusHistory.push({ status: newStatus, note: 'Updated via Telegram bot' });
      if (newStatus === 'delivered') { order.isDelivered = true; order.deliveredAt = new Date(); }
      if (newStatus === 'confirmed' && ['click', 'payme'].includes(order.paymentMethod)) {
        order.isPaid = true; order.paidAt = new Date();
      }
      await order.save();

      // Notify customer — works for both linked accounts and guest orders
      if (order.user?.telegramId || order.customerTelegramChatId) {
        await sendUserStatusUpdate(order, newStatus, order.user);
      }

      await bot.answerCallbackQuery(query.id, {
        text: `${statusEmojis[newStatus]} Статус: ${statusLabels[newStatus]}`,
      });

      // Update the inline message
      try {
        await bot.editMessageText(
          `${statusEmojis[newStatus]} Заказ *${order.orderNumber}* обновлён → *${statusLabels[newStatus].toUpperCase()}*\n\n${formatOrderCard(order)}`,
          {
            chat_id:      query.message.chat.id,
            message_id:   query.message.message_id,
            parse_mode:   'Markdown',
            reply_markup: orderInlineKeyboard(orderId, newStatus),
          }
        );
      } catch (_) {}
    } catch (err) {
      console.error('Callback query error:', err.message);
      bot.answerCallbackQuery(query.id, { text: '❌ Ошибка: ' + err.message });
    }
  });

  bot.on('polling_error', (err) => {
    if (err.code !== 'EFATAL') console.error('Telegram polling error:', err.message);
  });

  console.log('🤖 Telegram bot started — polling for commands');
};
