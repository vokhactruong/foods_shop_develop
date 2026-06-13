const User = require('../models/User');
const { sendPushNotification } = require('./pushNotification');

async function notifyStaff(title, body, data = {}) {
  const users = await User.find({
    role: { $in: ['admin', 'kitchen'] },
    fcmTokens: { $exists: true, $ne: [] },
  })
    .select('fcmTokens')
    .lean();

  const tokens = users.flatMap((user) => user.fcmTokens || []);
  console.log(`[FCM] Sending "${title}" to ${tokens.length} staff token(s).`);

  const result = await sendPushNotification(tokens, title, body, data);
  console.log(`[FCM] Result: success=${result.successCount || 0}, failure=${result.failureCount || 0}`);

  if (result.invalidTokens?.length) {
    await User.updateMany(
      { fcmTokens: { $in: result.invalidTokens } },
      { $pull: { fcmTokens: { $in: result.invalidTokens } } }
    );
  }

  return result;
}

module.exports = { notifyStaff };
