import { getFacultyRecord } from "$lib/server/db-helpers";
import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

//loads record based on cookies
export const load: PageServerLoad = async ({cookies}) => { 
    try {
        const recID = parseInt(cookies.get('viewed-record') ?? "-1");
        if (recID < 1) return {
            recordData:null
        }

        const fetchedRecord = await getFacultyRecord(recID);

        return {
            recordData: {
                firstName: fetchedRecord.firstname,
                lastName: fetchedRecord.lastname,
                facultyid: fetchedRecord.facultyid,
            }
        }
    } catch(e) {
        console.log(e)
        redirect(302, '/');
    }   
};