import { redirect } from '@sveltejs/kit';

export function load() {
    // TODO: Change conditional
    return redirect(307, '/login');
}
