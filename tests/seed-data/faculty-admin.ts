// contains adminpositions and offices for seeding
// doing this for organizational purposes

// delete all entries in the table muna

// faculty
export const testFaculty = [
    {
        facultyid: 1,
        lastname: 'Galinato',
        middlename: 'D',
        firstname: 'Eriene',
        birthdate: new Date().toISOString(),
        status: 'Active',
        dateoforiginalappointment: new Date().toISOString(),
        psiitem: '',
        employeenumber: '',
        tin: '',
        gsis: '',
        philhealth: '',
        pagibig: '',
    },
    {
        facultyid: 2,
        lastname: 'Camingao',
        middlename: 'B',
        firstname: 'Ericsson Jake',
        birthdate: new Date().toISOString(),
        status: 'On Leave',
        dateoforiginalappointment: new Date().toISOString(),
        psiitem: '',
        employeenumber: '',
        tin: '',
        gsis: '',
        philhealth: '',
        pagibig: '',
    },
    {
        facultyid: 3,
        lastname: 'Dela Cruz',
        middlename: 'O',
        firstname: 'Gabrielle Zach',
        birthdate: new Date().toISOString(),
        status: 'Sabbatical',
        dateoforiginalappointment: new Date().toISOString(),
        psiitem: '',
        employeenumber: '',
        tin: '',
        gsis: '',
        philhealth: '',
        pagibig: '',
    },
    {
        facultyid: 4,
        lastname: 'Mandario',
        middlename: 'S',
        firstname: 'Maricris',
        birthdate: new Date().toISOString(),
        status: 'Active',
        dateoforiginalappointment: new Date().toISOString(),
        psiitem: '',
        employeenumber: '',
        tin: '',
        gsis: '',
        philhealth: '',
        pagibig: '',
    },
];

// facultyrank
export const rankRelations = [
    {
        facultyrankid: 1,
        facultyid: 1,
        rankid: 26,
        appointmentstatus: 'Tenured',
        dateoftenureorrenewal: new Date().toISOString(),
    },
    {
        facultyrankid: 2,
        facultyid: 2,
        rankid: 20,
        appointmentstatus: 'For Renewal',
        dateoftenureorrenewal: new Date().toISOString(),
    },
    {
        facultyrankid: 3,
        facultyid: 3,
        rankid: 6,
        appointmentstatus: 'For Renewal',
        dateoftenureorrenewal: new Date().toISOString(),
    },
    {
        facultyrankid: 4,
        facultyid: 4,
        rankid: 1,
        appointmentstatus: 'Tenured',
        dateoftenureorrenewal: new Date().toISOString(),
    },
];

// facultysemester
export const semesterRelations = [
    {
        facultysemesterid: 1,
        facultyid: 1,
        acadsemesterid: 1,
        currentrankid: 1,
    },
    {
        facultysemesterid: 2,
        facultyid: 2,
        acadsemesterid: 1,
        currentrankid: 2,
    },
    {
        facultysemesterid: 3,
        facultyid: 3,
        acadsemesterid: 1,
        currentrankid: 3,
    },
    {
        facultysemesterid: 4,
        facultyid: 4,
        acadsemesterid: 1,
        currentrankid: 4,
    },
];

// facultyadminposition
export const adminRelations = [
    {
        facultyadminpositionid: 1,
        facultysemesterid: 1,
        adminpositionid: 1,
        officeid: 1,
        startdate: new Date().toISOString(),
        enddate: new Date().toISOString(),
        administrativeloadcredit: '5',
    },
];

/*
// Refresh faculty record search view
await testDb.execute(sql`REFRESH MATERIALIZED VIEW faculty_record_search_view`);
*/
    /*
        // delete all entries in the table muna
        await testDb.delete(schema.faculty);
        await testDb.delete(schema.facultyrank);
        await testDb.delete(schema.facultysemester);
        await testDb.delete(schema.facultyadminposition);

        // faculty
        await testDb.insert(schema.faculty).values([
            {
                facultyid: 1,
                lastname: 'Galinato',
                middlename: 'D',
                firstname: 'Eriene',
                birthdate: new Date().toISOString(),
                status: 'Active',
                dateoforiginalappointment: new Date().toISOString(),
                psiitem: '',
                employeenumber: '',
                tin: '',
                gsis: '',
                philhealth: '',
                pagibig: '',
            },
            {
                facultyid: 2,
                lastname: 'Camingao',
                middlename: 'B',
                firstname: 'Ericsson Jake',
                birthdate: new Date().toISOString(),
                status: 'On Leave',
                dateoforiginalappointment: new Date().toISOString(),
                psiitem: '',
                employeenumber: '',
                tin: '',
                gsis: '',
                philhealth: '',
                pagibig: '',
            },
            {
                facultyid: 3,
                lastname: 'Dela Cruz',
                middlename: 'O',
                firstname: 'Gabrielle Zach',
                birthdate: new Date().toISOString(),
                status: 'Sabbatical',
                dateoforiginalappointment: new Date().toISOString(),
                psiitem: '',
                employeenumber: '',
                tin: '',
                gsis: '',
                philhealth: '',
                pagibig: '',
            },
            {
                facultyid: 4,
                lastname: 'Mandario',
                middlename: 'S',
                firstname: 'Maricris',
                birthdate: new Date().toISOString(),
                status: 'Active',
                dateoforiginalappointment: new Date().toISOString(),
                psiitem: '',
                employeenumber: '',
                tin: '',
                gsis: '',
                philhealth: '',
                pagibig: '',
            },
        ]);

        // facultyrank
        await testDb.insert(schema.facultyrank).values([
            {
                facultyrankid: 1,
                facultyid: 1,
                rankid: 26,
                appointmentstatus: 'Tenured',
                dateoftenureorrenewal: new Date().toISOString(),
            },
            {
                facultyrankid: 2,
                facultyid: 2,
                rankid: 20,
                appointmentstatus: 'For Renewal',
                dateoftenureorrenewal: new Date().toISOString(),
            },
            {
                facultyrankid: 3,
                facultyid: 3,
                rankid: 6,
                appointmentstatus: 'For Renewal',
                dateoftenureorrenewal: new Date().toISOString(),
            },
            {
                facultyrankid: 4,
                facultyid: 4,
                rankid: 1,
                appointmentstatus: 'Tenured',
                dateoftenureorrenewal: new Date().toISOString(),
            },
        ]);

        // facultysemester
        await testDb.insert(schema.facultysemester).values([
            {
                facultysemesterid: 1,
                facultyid: 1,
                acadsemesterid: 1,
                currentrankid: 1,
            },
            {
                facultysemesterid: 2,
                facultyid: 2,
                acadsemesterid: 1,
                currentrankid: 2,
            },
            {
                facultysemesterid: 3,
                facultyid: 3,
                acadsemesterid: 1,
                currentrankid: 3,
            },
            {
                facultysemesterid: 4,
                facultyid: 4,
                acadsemesterid: 1,
                currentrankid: 4,
            },
        ]);

        // facultyadminposition
        await testDb.insert(schema.facultyadminposition).values([
            {
                facultyadminpositionid: 1,
                facultysemesterid: 1,
                adminpositionid: 1,
                officeid: 1,
                startdate: new Date().toISOString(),
                enddate: new Date().toISOString(),
                administrativeloadcredit: '5',
            },
        ]);

        // Refresh faculty record search view
        await testDb.execute(sql`REFRESH MATERIALIZED VIEW faculty_record_search_view`);
    */