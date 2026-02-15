export function load() {
    // const facultyRecordList = await getFacultyRecordList();
    const facultyRecordList = [
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

    return { facultyRecordList };
}
