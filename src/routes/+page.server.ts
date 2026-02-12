import { getPermissions, getRole } from '$lib/server/db-helpers';

export async function load({ locals }) {
    // const facultyRecordList = await getFacultyRecordList();
    const facultyRecordList = [
        {
            facultyid: 1,
            lastname: 'Dela Cruz',
            firstname: 'Juan',
            status: 'Active',
            ranktitle: 'Professor 7',
            adminposition: 'Department Chair',
            logTimestamp: '',
            logMaker: 'it@up.edu.ph',
            logOperation: 'Made record.',
        },
    ];

    const userRole = await getRole(locals.user.id);
    const permissions = await getPermissions(userRole);

    const canViewChangeLogs = permissions.canviewchangelogs;

    return { facultyRecordList, canViewChangeLogs };
}
