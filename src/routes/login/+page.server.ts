// src/routes/login/+page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db/index';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const actions = {
    default: async ({ request, cookies }) => {
        const formData = await request.formData();
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        // Validation: @up.edu.ph requirement
        if (!email.endsWith('@up.edu.ph')) {
            return fail(400, { message: 'Invalid email domain.' });
        }

        // Task 2: Fetch user
        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

        if (!user || user.password !== password) {
            return fail(401, { message: 'Incorrect email or password.' });
        }

        // Task 6: Identity/Role Management
        // We store the role in a cookie so the client knows if it's IT or Admin
        cookies.set('session_role', user.role, {
            path: '/',
            httpOnly: true,
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 // 1 day
        });

        throw redirect(303, '/dashboard');
    }
};