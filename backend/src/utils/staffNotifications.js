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
  const result = await sendPushNotification(tokens, title, body, data);

  if (result.invalidTokens?.length) {
    await User.updateMany(
      { fcmTokens: { $in: result.invalidTokens } },
      { $pull: { fcmTokens: { $in: result.invalidTokens } } }
    );
  }

  return result;
}

module.exports = { notifyStaff };
