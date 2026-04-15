import { type Actions, error, fail, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth';
import { BETTER_AUTH_SECRET } from '$env/static/private';

import {
    areYouHere,
    deleteProfileInfo,
    getUserRoleAndPermissions,
    makeProfileInfo,
} from '$lib/server/queries/db-helpers';
import { auth } from '$lib/server/auth';
import type { FilterColumn, FilterObject } from '$lib/types/filter';
import {
    changeRole,
    getAccountList,
    getAllRoles,
    refreshAccountSearchView,
} from '$lib/server/queries/account-list';
import { profileInfo } from '$lib/server/db/schema';
import { getHeaders } from 'better-auth/client';

export async function load({ locals, url }) {
    // Check existing session
    if (typeof locals.user === 'undefined') throw redirect(307, '/login');

    // Check Permissions
    const [roleObj] = await getUserRoleAndPermissions(locals.user.id);
    if (typeof roleObj === 'undefined') throw redirect(307, '/login');

    const { canAddAccount, canModifyAccount } = roleObj;
    const canViewAccounts = canAddAccount || canModifyAccount;
    if (!canViewAccounts) throw error(403, { message: 'Insufficient permissions.' });

    const userRoles = await getAllRoles();

    // Extract queries

    // Cursor and Direction
    const newCursorStr = url.searchParams.get('cursor');
    const isNextStr = url.searchParams.get('isNext'); // 0 or 1

    // eslint-disable-next-line no-undefined -- can't use null in Drizzle WHERE queries
    const newCursor = newCursorStr ? parseInt(newCursorStr, 10) : undefined;
    const isNext = isNextStr ? parseInt(isNextStr, 10) === 1 : true;

    // Filter

    const filters: FilterObject[] = [
        {
            name: 'Role',
            filter: 'role',
            opts: userRoles,
            selectedOpts: url.searchParams.getAll('role'),
        },
    ];

    const filterMap: FilterColumn[] = [
        {
            obj: filters[0],
            column: profileInfo.role,
        },
    ];

    // Search
    const searchTerm = url.searchParams.get('search');

    // Sort
    const sortBys = url.searchParams.getAll('sort-by');

    // Get account list
    const { accountList, prevCursor, nextCursor, hasPrev, hasNext } = await getAccountList(
        locals.user.id,
        searchTerm,
        filterMap,
        sortBys,
        newCursor,
        isNext,
        !newCursorStr && !isNextStr,
    );

    return {
        accountList,
        prevCursor,
        nextCursor,
        hasPrev,
        hasNext,
        filters,
        userRoles,
        searchTerm,
        canViewAccounts, // Added here
    };
}

export const actions = {
    async makeAccount({ locals, request }) {
        // Check existing session
        if (typeof locals.user === 'undefined') throw redirect(307, '/login');

        // Check Permissions
        const [roleObj] = await getUserRoleAndPermissions(locals.user.id);
        if (typeof roleObj === 'undefined') throw redirect(307, '/login');

        const { canAddAccount } = roleObj;
        if (!canAddAccount) return fail(403, { error: 'Insufficient permissions.' });

        const data = await request.formData();
        const email = data.get('email') as string;
        const password = data.get('password') as string;
        const role = data.get('role') as string;

        // Validate credentials
        if (!email || !email.endsWith('@up.edu.ph')) return fail(400, { error: 'Invalid email.' });
        if (await areYouHere(email))
            return fail(400, { error: 'Email is already associated with an account.' });

        if (!password) return fail(400, { error: 'Invalid password.' });

        if (!role) return fail(400, { error: 'Invalid role.' });

        // Register as user
        try {
            const response = await auth.api.createUser({
                body: {
                    email,
                    password,
                    name: 'User',
                    role: role === 'IT' ? 'admin' : 'user',
                },
            });

            if (response.user.id === '') return fail(500, { error: 'Failed to make new account.' });

            // Add profile info
            await makeProfileInfo(locals.user.id, response.user.id, role);

            // Refresh account search view
            await refreshAccountSearchView();
        } catch (error) {
            return fail(500, {
                error: error instanceof APIError ? error.message : 'Failed to make new account.',
            });
        }

        return {
            success: true,
            message: 'Created account.',
        };
    },

    async deleteAccount({ locals, request }) {
        // Check existing session
        if (typeof locals.user === 'undefined') throw redirect(307, '/login');

        // Check Permissions
        const [roleObj] = await getUserRoleAndPermissions(locals.user.id);
        if (typeof roleObj === 'undefined') throw redirect(307, '/login');

        const { canModifyAccount } = roleObj;
        if (!canModifyAccount) return fail(403, { error: 'Insufficient permissions.' });

        const data = await request.formData();
        const userid = data.get('userid') as string;

        // Validate input
        if (!userid) return fail(400, { error: 'Failed to delete account.' });

        // Delete user info
        await deleteProfileInfo(locals.user.id, [userid]);

        // Delete!
        const response = await auth.api.removeUser({
            body: {
                userId: userid,
            },
            headers: request.headers,
        });

        // Refresh account search view
        await refreshAccountSearchView();

        return {
            ...response,
            message: response.success ? 'Deleted account.' : 'Failed to delete account.',
        };
    },

    async deleteAccounts({ locals, request }) {
        // Check existing session
        if (typeof locals.user === 'undefined') throw redirect(307, '/login');

        // Check Permissions
        const [roleObj] = await getUserRoleAndPermissions(locals.user.id);
        if (typeof roleObj === 'undefined') throw redirect(307, '/login');

        const { canModifyAccount } = roleObj;
        if (!canModifyAccount) return fail(403, { error: 'Insufficient permissions.' });

        const formData = await request.formData();
        const useridsStr = formData.get('userids') as string;

        // Validate input
        if (!useridsStr) return fail(400, { error: 'No accounts selected.' });

        try {
            const userids: string[] = JSON.parse(useridsStr);

            // Delete user info
            await deleteProfileInfo(locals.user.id, userids);

            // Delete!
            let success = true;
            userids.forEach(async (userid) => {
                const { success: result } = await auth.api.removeUser({
                    body: {
                        userId: userid,
                    },
                    headers: request.headers,
                });

                success = result;
            });

            // Refresh account search view
            await refreshAccountSearchView();

            return {
                success,
                message: success ? 'Deleted accounts.' : 'Failed to delete accounts.',
            };
        } catch {
            return fail(500, { error: 'Failed to delete accounts.' });
        }
    },

    async resetAccount({locals, request}) {
        const formData = await request.formData();
        const userid = formData.get('userid') as string;

        if (!userid) return fail(400, { error: "No such account"});

        //permissions check
        const [roleObj] = await getUserRoleAndPermissions(locals.user.id);
        if (typeof roleObj === 'undefined') return fail(403, 'Insufficient Permissions');
        
        if (!roleObj.canModifyAccount) return fail(403, 'Insufficient Permissions')
        
        try {
            const response = await auth.api.setUserPassword({
                body: {
                    userId: userid,
                    newPassword: "password",
                },
                headers: request.headers
            })

            if (!response.status) {
                return fail(400, 'Failed to reset account password')
            }
        } catch(error) {
            console.log(error);
            return fail(500, {
                error: error instanceof APIError ? error.message : 'Failed to reset account password. (Unknown error)',
            });
        }
        return {
            success: true,
            message: 'Reset account password.',
        }
    },

    async changeRole({ locals, request }) {
        // Check existing session
        if (typeof locals.user === 'undefined') throw redirect(307, '/login');

        // Check Permissions
        const [roleObj] = await getUserRoleAndPermissions(locals.user.id);
        if (typeof roleObj === 'undefined') throw redirect(307, '/login');

        const { canModifyAccount } = roleObj;
        if (!canModifyAccount) return fail(403, { error: 'Insufficient permissions.' });

        const formData = await request.formData();
        const role = formData.get('role') as string;
        const userId = formData.get('userId') as string;

        // Validate input
        if (!role) return fail(400, { error: 'No role selected.' });
        if (!userId) return fail(400, { error: 'No user selected.' });

        // Elevate user as admin in better-auth
        await auth.api.adminUpdateUser({
            body: {
                userId,
                data: {
                    role: role === 'IT' ? 'admin' : 'user',
                },
            },
            headers: request.headers,
        });

        const { success } = await changeRole(locals.user.id, userId, role);

        return {
            success,
            message: success ? 'Changed user role.' : 'Failed to change user role',
        };
    },
} satisfies Actions;
