// contains adminpositions and offices for seeding
// doing this for organizational purposes

// delete all entries in the table muna

// faculty
export const testFaculty = [
    {
        id: 1,
        lastName: 'Galinato',
        middleName: 'D',
        firstName: 'Eriene',
        maidenName: '',
        birthDate: new Date(),
        biologicalSex: 'F',
        status: 'Active',
        dateOfOriginalAppointment: new Date(),
        psiItem: '123',
        employeeNumber: '123',
        tin: '123',
        gsis: '123',
        philhealth: '123',
        pagibig: '123',
    },
    {
        id: 2,
        lastName: 'Camingao',
        middleName: 'B',
        firstName: 'Ericsson Jake',
        maidenName: '',
        birthDate: new Date(),
        biologicalSex: 'M',
        status: 'On Leave',
        dateOfOriginalAppointment: new Date(),
        psiItem: '123',
        employeeNumber: '123',
        tin: '123',
        gsis: '123',
        philhealth: '123',
        pagibig: '123',
    },
    {
        id: 3,
        lastName: 'Dela Cruz',
        middleName: 'O',
        firstName: 'Gabrielle Zach',
        maidenName: '',
        birthDate: new Date(),
        biologicalSex: 'M',
        status: 'Sabbatical',
        dateOfOriginalAppointment: new Date(),
        psiItem: '123',
        employeeNumber: '123',
        tin: '123',
        gsis: '123',
        philhealth: '123',
        pagibig: '123',
    },
    {
        id: 4,
        lastName: 'Mandario',
        middleName: 'S',
        firstName: 'Maricris',
        maidenName: '',
        birthDate: new Date(),
        biologicalSex: 'F',
        status: 'Active',
        dateOfOriginalAppointment: new Date(),
        psiItem: '123',
        employeeNumber: '123',
        tin: '123',
        gsis: '123',
        philhealth: '123',
        pagibig: '123',
    },
];

// facultyrank
export const rankRelations = [
    {
        id: 4,
        facultyId: 4,
        rankId: 1,
        appointmentStatus: 'Temporary',
        dateOfTenureOrRenewal: new Date(),
    },
    {
        id: 3,
        facultyId: 3,
        rankId: 1,
        appointmentStatus: 'Temporary',
        dateOfTenureOrRenewal: new Date(),
    },
    {
        id: 2,
        facultyId: 2,
        rankId: 1,
        appointmentStatus: 'Part-Time',
        dateOfTenureOrRenewal: new Date(),
    },
    {
        id: 1,
        facultyId: 1,
        rankId: 1,
        appointmentStatus: 'Full-Time',
        dateOfTenureOrRenewal: new Date(),
    },
];

// facultysemester
export const semesterRelations = [
    {
        id: 1,
        facultyId: 1,
        academicSemesterId: 1,
        currentRankId: 1,
    },
    {
        id: 2,
        facultyId: 2,
        academicSemesterId: 1,
        currentRankId: 2,
    },
    {
        id: 3,
        facultyId: 3,
        academicSemesterId: 1,
        currentRankId: 3,
    },
    {
        id: 4,
        facultyId: 4,
        academicSemesterId: 1,
        currentRankId: 4,
    },
];

// facultyadminposition
export const adminRelations = [
    {
        id: 1,
        facultyAcademicSemesterId: 1,
        adminPositionId: 1,
        officeId: 1,
        startDate: new Date(),
        endDate: new Date(),
        administrativeLoadCredit: '5',
    },
];

// academicSemester
export const academicSemesters = [
    {
        id: 1,
        semesterNumber: 0,
        academicYear: 2025,
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
