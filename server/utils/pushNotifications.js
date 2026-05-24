import { Expo } from 'expo-server-sdk';
import mongoose from 'mongoose';

const expo = new Expo({ useFcmV1: true });

export async function sendOrderNotification(order) {
  try {
    const adminsCollection = mongoose.connection.db.collection('admins');
    const admins = await adminsCollection
      .find({ expoPushTokens: { $exists: true, $ne: [] } })
      .project({ expoPushTokens: 1 })
      .toArray();

    const allTokens = admins.flatMap((admin) => admin.expoPushTokens || []);

    if (allTokens.length === 0) {
      console.warn('[pushNotifications] No admin push tokens found – skipping.');
      return;
    }

    const formattedAmount = `₹${(order.total ?? order.subtotal ?? 0).toLocaleString('en-IN')}`;
    const orderId = order.id || order._id?.toString().slice(-8).toUpperCase() || 'NEW';

    const messages = [];

    for (const token of allTokens) {
      if (!Expo.isExpoPushToken(token)) {
        console.error(`[pushNotifications] Invalid token "${token}" – skipping.`);
        continue;
      }

      messages.push({
        to: token,
        sound: 'default',
        title: '🛒 New Order Received!',
        body: `Order ${orderId} · ${formattedAmount}`,
        data: {
          orderId: order._id?.toString() || order.id,
          orderDisplayId: orderId,
          total: order.total,
          screen: 'OrderDetail',
        },
        channelId: 'orders',
        priority: 'high',
      });
    }

    if (messages.length === 0) return;

    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
        console.log('[pushNotifications] ✅ Sent chunk, tickets:', ticketChunk);
      } catch (err) {
        console.error('[pushNotifications] ❌ Error sending chunk:', err);
      }
    }

    setTimeout(() => checkReceipts(tickets), 15 * 60 * 1000);
  } catch (error) {
    console.error('[pushNotifications] Fatal error:', error);
  }
}

async function checkReceipts(tickets) {
  const receiptIds = tickets
    .filter((t) => t.status === 'ok' && t.id)
    .map((t) => t.id);

  if (receiptIds.length === 0) return;

  const receiptChunks = expo.chunkPushNotificationReceiptIds(receiptIds);

  for (const chunk of receiptChunks) {
    try {
      const receipts = await expo.getPushNotificationReceiptsAsync(chunk);

      for (const [receiptId, receipt] of Object.entries(receipts)) {
        if (receipt.status === 'ok') continue;

        if (receipt.status === 'error') {
          console.error(`[pushNotifications] Receipt error for ${receiptId}:`, receipt.message);

          if (receipt.details?.error === 'DeviceNotRegistered') {
            console.warn('[pushNotifications] Token is stale – should be removed.');
          }
        }
      }
    } catch (err) {
      console.error('[pushNotifications] Error checking receipts:', err);
    }
  }
}
