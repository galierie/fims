import { getDummyFacultyRecordList } from "$lib/server/db-helpers";

export async function load() {
    // const facultyRecordList = await getFacultyRecordList();
    const facultyRecordList:{
        facultyid:number,
        lastname:string,
        firstname:string,
        status:string,
        ranktitle:string|null,
        adminposition:string|null,
        logTimestamp:Date|null,
        logMaker:string|null,
        logOperation:string|null
    }[] = await getDummyFacultyRecordList();

    /* 
    [
        {
            facultyid: 1,
            lastname: 'Dela Cruz',
            firstname: 'Juan',
            status: 'Active',
            ranktitle: 'Professor 7',
            adminposition: 'Department Chair',
            logTimestamp: new Date(),
            logMaker: 'it@up.edu.ph',
            logOperation: 'Made record.',
        },
    ];
    */

    console.log(facultyRecordList);

    return { facultyRecordList };
}

export const actions = {
    "view-record": async () => {

    }
}