import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const email = data.get('email');
    const password = data.get('password');

    // Validate input

    // Email
    const emailDomain = '@up.edu.ph';
    if (!email || !email.toString().includes(emailDomain)) {
      return fail(400, { error: 'Invalid email' })
    }

    // Password
    if (!password) {
      return fail(400, { error: 'Invalid password' });
    }

    // TODO: Manually authenticate credentials
  },
} satisfies Actions;