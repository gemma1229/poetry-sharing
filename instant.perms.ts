import type { InstantRules } from '@instantdb/react';

const rules = {
  poems: {
    allow: {
      view: 'true',
      create: 'auth.id != null',
      update: 'auth.id == data.ref("author.id")',
      delete: 'auth.id == data.ref("author.id")',
    },
  },
} satisfies InstantRules;

export default rules;
