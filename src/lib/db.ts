import { init } from '@instantdb/react';
import schema from '../instant.schema';

const appId = process.env.NEXT_PUBLIC_INSTANT_APP_ID;
if (!appId || appId === 'YOUR_APP_ID_HERE') {
  throw new Error(
    'Missing InstantDB App ID. Set NEXT_PUBLIC_INSTANT_APP_ID in Vercel: Project Settings → Environment Variables. Get your App ID from https://instantdb.com/dash'
  );
}

const db = init({ appId, schema });

export default db;
