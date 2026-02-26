import { error, redirect } from '@sveltejs/kit'

export const POST = async ({request, cookies, locals}) => {
    if (!locals.user || !locals.session) {
        throw error(401, 'unauthorized');
    }

    const data:{requested:number} = await request.json();
    
    if (!data) throw error(403, 'malformed data');
    if (!data.requested) throw error(403, 'malformed data');

    cookies.set('viewed-record', `${data.requested}`, {path: '/'}); 

    redirect(302, '/record');

}