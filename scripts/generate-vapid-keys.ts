import webpush from 'web-push';

const keys = webpush.generateVAPIDKeys();

const subject = process.env.VAPID_SUBJECT ?? 'mailto:notifications@moneyquest.app';

process.stdout.write([
  'VAPID keys generated for MoneyQuest.',
  '',
  `NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}`,
  `VAPID_PUBLIC_KEY=${keys.publicKey}`,
  `VAPID_PRIVATE_KEY=${keys.privateKey}`,
  `VAPID_SUBJECT=${subject}`,
].join('\n'));
