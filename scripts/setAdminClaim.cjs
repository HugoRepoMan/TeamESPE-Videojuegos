// This script must be run server-side, never from the client.
// Usage: node scripts/setAdminClaim.cjs <user-email>
// Requires: GOOGLE_APPLICATION_CREDENTIALS env var pointing to service account JSON

const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

async function setAdminClaim(email) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log(`Custom claim admin=true set for user: ${email} (uid: ${user.uid})`);
    console.log('The user must sign out and sign back in for the claim to take effect.');
  } catch (error) {
    console.error('Error setting custom claim:', error.message);
    process.exit(1);
  }
}

const email = process.argv[2];
if (!email) {
  console.error('Usage: node scripts/setAdminClaim.cjs <user-email>');
  process.exit(1);
}

setAdminClaim(email).then(() => process.exit(0));
