import { redirect } from '@sveltejs/kit';

export async function load({ parent }) {
    const { facultyid } = await parent();
    throw redirect(308, `/faculty/${facultyid}/profile`);
}
