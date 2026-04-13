import ExcelJS from '@protobi/exceljs';

import { cellBorders, type SheetCellValue } from '$lib/types/sheet-cell';
import { getFacultyServiceRecordReport } from '$lib/server/queries/reports';
import { INSTITUTION } from '$env/static/private';

const adminPositionsStartRow = 5;
const adminPositionsStartCol = 6;

const profileStartCol = 1;

const semestralRecordStartCol = 1;

const defaultNonTableCellAlignment: Partial<ExcelJS.Alignment> = {
    vertical: 'top',
    wrapText: true,
};

const defaultTableCellAlignment: Partial<ExcelJS.Alignment> = {
    horizontal: 'center',
    vertical: 'top',
};

const constantSemestralRecordHeaderCellValues = [
    'Semester AY',
    'Subject',
    'Teaching Credit',
    'Subject (No. of Students)',
    'Admin Load',
    'Admin Position',
    'Additional Assignments', // Task 11: facultyAdminWork
    'Committee Memberships', // Task 11
    'Research Credit',
    'Title of Research',
    'Start/End Date',
    'Funding',
    'Mentoring', // Task 11
    'TOTAL',
    'Course Units', // Task 12: Rephrased
    'Remarks', // Task 13: Mentoring remarks appended here
];

const semNumCellValues = ['Midyear', 'First Semester', 'Second Semester'];

export async function getFacultyServiceRecordWorksheet(
    facultyid: number,
    fromAcadYear: number,
    fromSemNum: number,
    toAcadYear: number,
    toSemNum: number,
) {
    const sheetName = 'Faculty Service Record';
    const {
        profile,
        originalTenure,
        adminPositions,
        fieldsOfInterest,
        semestralRecords,
        currentTeachingLoad,
        currentAdministrativeLoad,
        currentResearchLoad,
        currentMentoring,
    } = await getFacultyServiceRecordReport(
        facultyid,
        fromAcadYear,
        fromSemNum,
        toAcadYear,
        toSemNum,
    );

    // Create Workbook
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(sheetName);

    // Set heading cells
    const institutionCell = sheet.getCell('A1');
    institutionCell.value = INSTITUTION;
    institutionCell.alignment = { horizontal: 'center' };
    institutionCell.font = { bold: true };
    sheet.mergeCells('A1:P1');

    const universityCell = sheet.getCell('A2');
    universityCell.value = 'University of the Philippines';
    universityCell.alignment = { horizontal: 'center' };
    sheet.mergeCells('A2:P2');

    const titleCell = sheet.getCell('A4');
    titleCell.value = 'Faculty Service Record';
    titleCell.alignment = { horizontal: 'center' };
    titleCell.font = { bold: true };
    sheet.mergeCells('A4:P4');

    // Populate admin positions
    let adminPositionRow = adminPositionsStartRow;
    adminPositions.forEach(({ adminPosition, office, periods }) => {
        const adminPositionCell = sheet.getCell(adminPositionRow, adminPositionsStartCol);
        adminPositionCell.value = `${adminPosition}, ${office}: ${periods}`;
        adminPositionCell.alignment = defaultNonTableCellAlignment;
        sheet.mergeCells(
            adminPositionRow,
            adminPositionsStartCol,
            adminPositionRow,
            adminPositionsStartCol + 7,
        );
        adminPositionRow++;
    });
    adminPositionRow++;

    if (adminPositionRow - adminPositionsStartRow < 7) {
        const newAdminPositionRow = 7 - (adminPositionRow - adminPositionsStartRow);
        adminPositionRow += newAdminPositionRow;
    }

    // Populate fields of interest
    const fieldsOfInterestCell = sheet.getCell(adminPositionRow, adminPositionsStartCol);
    if (fieldsOfInterest.length === 1) {
        const [{ fields }] = fieldsOfInterest;
        fieldsOfInterestCell.value = `Fields of Interest: ${fields}`;
    }
    fieldsOfInterestCell.alignment = defaultNonTableCellAlignment;
    sheet.mergeCells(
        adminPositionRow,
        adminPositionsStartCol,
        adminPositionRow,
        adminPositionsStartCol + 7,
    );

    // Populate profile
    let profileRow = adminPositionRow;
    const [
        {
            lastName,
            firstName,
            middleName,
            currentAppointment,
            currentAppointmentStatus,
            dateOfOriginalAppointment,
            highestEducationalAttainmentDegree,
            highestEducationAttainmentInstitution,
            highestEducationAttainmentGraduationYear,
        },
    ] = profile;

    const educationalAttainmentLabelCell = sheet.getCell(profileRow, profileStartCol);
    educationalAttainmentLabelCell.value = 'Degree:';
    educationalAttainmentLabelCell.alignment = defaultNonTableCellAlignment;

    const educationalAttainmentCell = sheet.getCell(profileRow, profileStartCol + 1);
    const educationalAttainmentStr = [
        highestEducationalAttainmentDegree,
        highestEducationAttainmentInstitution,
        highestEducationAttainmentGraduationYear,
    ]
        .filter((str) => str !== null)
        .join(', ');
    educationalAttainmentCell.value = educationalAttainmentStr;
    educationalAttainmentCell.alignment = defaultNonTableCellAlignment;
    sheet.mergeCells(profileRow, profileStartCol + 1, profileRow, profileStartCol + 3);

    profileRow--;

    const tenureLabelCell = sheet.getCell(profileRow, profileStartCol);
    tenureLabelCell.value = 'Tenure:';
    tenureLabelCell.alignment = defaultNonTableCellAlignment;

    const tenureCell = sheet.getCell(profileRow, profileStartCol + 1);
    if (originalTenure.length === 1) {
        const [{ tenureAppointment, tenureDateOfAppointment }] = originalTenure;
        tenureCell.value = `Tenure (${tenureAppointment}) ${tenureDateOfAppointment}`;
    }
    tenureCell.alignment = defaultNonTableCellAlignment;
    sheet.mergeCells(profileRow, profileStartCol + 1, profileRow, profileStartCol + 3);

    profileRow--;

    const originalAppointmentDateLabelCell = sheet.getCell(profileRow, profileStartCol);
    originalAppointmentDateLabelCell.value = 'Original Appointment:';
    originalAppointmentDateLabelCell.alignment = defaultNonTableCellAlignment;

    const originalAppointmentDateCell = sheet.getCell(profileRow, profileStartCol + 1);
    originalAppointmentDateCell.value = dateOfOriginalAppointment;
    originalAppointmentDateCell.alignment = defaultNonTableCellAlignment;
    sheet.mergeCells(profileRow, profileStartCol + 1, profileRow, profileStartCol + 3);

    profileRow--;

    const appointmentStatusLabelCell = sheet.getCell(profileRow, profileStartCol);
    appointmentStatusLabelCell.value = 'Status of Appointment:';
    appointmentStatusLabelCell.alignment = defaultNonTableCellAlignment;

    const appointmentStatusCell = sheet.getCell(profileRow, profileStartCol + 1);
    appointmentStatusCell.value = currentAppointmentStatus;
    appointmentStatusCell.alignment = defaultNonTableCellAlignment;
    sheet.mergeCells(profileRow, profileStartCol + 1, profileRow, profileStartCol + 3);

    profileRow--;

    const positionLabelCell = sheet.getCell(profileRow, profileStartCol);
    positionLabelCell.value = 'Position:';
    positionLabelCell.alignment = defaultNonTableCellAlignment;

    const positionCell = sheet.getCell(profileRow, profileStartCol + 1);
    positionCell.value = currentAppointment;
    positionCell.alignment = defaultNonTableCellAlignment;
    sheet.mergeCells(profileRow, profileStartCol + 1, profileRow, profileStartCol + 3);

    profileRow -= 3;

    const nameLabelCell = sheet.getCell(profileRow, profileStartCol);
    nameLabelCell.value = 'Name:';
    nameLabelCell.alignment = defaultNonTableCellAlignment;

    const nameCell = sheet.getCell(profileRow, profileStartCol + 1);
    nameCell.value = `${lastName}, ${firstName} ${middleName}`;
    nameCell.font = { bold: true };
    nameCell.alignment = defaultNonTableCellAlignment;
    sheet.mergeCells(profileRow, profileStartCol + 1, profileRow, profileStartCol + 3);

    // Populate semestral records
    const semestralRecordHeaderRow = adminPositionRow + 2;
    let semestralRecordHeaderCol = semestralRecordStartCol;
    constantSemestralRecordHeaderCellValues.forEach((header) => {
        const headerCell = sheet.getCell(semestralRecordHeaderRow, semestralRecordHeaderCol);
        headerCell.value = header;
        ((headerCell.border = cellBorders),
            (headerCell.alignment = {
                horizontal: 'center',
                vertical: 'top',
                wrapText: true,
            }));
        semestralRecordHeaderCol++;
    });

    let semestralRecordDataRow = semestralRecordHeaderRow + 1;
    let semestralRecordDataCol = semestralRecordStartCol;
    let currentAcadYear = 0;
    semestralRecords.forEach((record) => {
        const { academicSemesterId, acadYear, semNum, remarks } = record;

        // Find the specific data for this semester
        const teaching = currentTeachingLoad.find(
            (t) => t.academicSemesterId === academicSemesterId,
        );
        const admin = currentAdministrativeLoad.find(
            (a) => a.academicSemesterId === academicSemesterId,
        );
        const research = currentResearchLoad.find(
            (r) => r.academicSemesterId === academicSemesterId,
        );
        const mentoring = currentMentoring.find((m) => m.academicSemesterId === academicSemesterId);

        // Prep Task 13: Combine Mentoring remarks with Semester remarks
        const mainRemarks = remarks || '';
        const mRemarks = mentoring?.mentoringRemarks
            ? `Mentoring: ${mentoring.mentoringRemarks}`
            : '';
        const combinedRemarks = [mainRemarks, mRemarks].filter(Boolean).join('; ');

        if (currentAcadYear !== acadYear) {
            const acadYearCell = sheet.getCell(semestralRecordDataRow, semestralRecordDataCol);
            acadYearCell.value = `${acadYear}-${acadYear + 1}`;
            acadYearCell.border = cellBorders;
            acadYearCell.alignment = {
                horizontal: 'center',
                vertical: 'top',
            };
            acadYearCell.font = { bold: true };

            semestralRecordDataCol++;

            for (
                let i = 2;
                i <= constantSemestralRecordHeaderCellValues.length;
                i++, semestralRecordDataCol++
            )
                sheet.getCell(semestralRecordDataRow, semestralRecordDataCol).border = cellBorders;

            semestralRecordDataRow++;
            semestralRecordDataCol = semestralRecordStartCol;
            currentAcadYear = acadYear;
        }

        // 1. Semester (First Col)
        const semNumCell = sheet.getCell(semestralRecordDataRow, semestralRecordDataCol++);
        semNumCell.value = semNumCellValues[semNum % 3];
        semNumCell.border = cellBorders;
        semNumCell.alignment = defaultTableCellAlignment;

        // 2. Subject
        const coursesTaughtCell = sheet.getCell(semestralRecordDataRow, semestralRecordDataCol++);
        coursesTaughtCell.value = teaching?.currentCoursesTaught || 'None';
        coursesTaughtCell.border = cellBorders;
        coursesTaughtCell.alignment = defaultTableCellAlignment;

        // 3. Teaching Credit
        const teachingLoadCreditCell = sheet.getCell(
            semestralRecordDataRow,
            semestralRecordDataCol++,
        );
        teachingLoadCreditCell.value = teaching?.teachingLoadCredit || 0;
        teachingLoadCreditCell.numFmt = '0.00';
        teachingLoadCreditCell.border = cellBorders;
        teachingLoadCreditCell.alignment = defaultTableCellAlignment;

        // 4. Subject (No. of Students)
        const numOfStudentsPerCourseCell = sheet.getCell(
            semestralRecordDataRow,
            semestralRecordDataCol++,
        );
        numOfStudentsPerCourseCell.value = teaching?.numOfStudentsPerCourse || '0';
        numOfStudentsPerCourseCell.border = cellBorders;
        numOfStudentsPerCourseCell.alignment = defaultTableCellAlignment;

        // 5. Admin Load
        const administrativeLoadCreditCell = sheet.getCell(
            semestralRecordDataRow,
            semestralRecordDataCol++,
        );
        administrativeLoadCreditCell.value = admin?.administrativeLoadCredit || 0;
        administrativeLoadCreditCell.numFmt = '0.00';
        administrativeLoadCreditCell.border = cellBorders;
        administrativeLoadCreditCell.alignment = defaultTableCellAlignment;

        // 6. Admin Position
        const currentAdminPositionsCell = sheet.getCell(
            semestralRecordDataRow,
            semestralRecordDataCol++,
        );
        currentAdminPositionsCell.value = admin?.currentAdminPositions || 'None';
        currentAdminPositionsCell.border = cellBorders;
        currentAdminPositionsCell.alignment = defaultTableCellAlignment;

        // 7. Additional Assignments (Task 11)
        const additionalAssignmentsCell = sheet.getCell(
            semestralRecordDataRow,
            semestralRecordDataCol++,
        );
        additionalAssignmentsCell.value = admin?.additionalAssignments || 'None';
        additionalAssignmentsCell.border = cellBorders;
        additionalAssignmentsCell.alignment = defaultTableCellAlignment;

        // 8. Committee Memberships (Task 11)
        const committeeCell = sheet.getCell(semestralRecordDataRow, semestralRecordDataCol++);
        committeeCell.value = admin?.committeeMemberships || 'None';
        committeeCell.border = cellBorders;
        committeeCell.alignment = defaultTableCellAlignment;

        // 9. Research Credit
        const researchLoadCreditCell = sheet.getCell(
            semestralRecordDataRow,
            semestralRecordDataCol++,
        );
        researchLoadCreditCell.value = research?.researchLoadCredit || 0;
        researchLoadCreditCell.numFmt = '0.00';
        researchLoadCreditCell.border = cellBorders;
        researchLoadCreditCell.alignment = defaultTableCellAlignment;

        // 10. Title of Research
        const researchTitlesCell = sheet.getCell(semestralRecordDataRow, semestralRecordDataCol++);
        researchTitlesCell.value = research?.researchTitles || 'None';
        researchTitlesCell.border = cellBorders;
        researchTitlesCell.alignment = defaultTableCellAlignment;

        // 11. Start/End Date
        const researchPeriodsCell = sheet.getCell(semestralRecordDataRow, semestralRecordDataCol++);
        researchPeriodsCell.value = research?.researchPeriods || 'None';
        researchPeriodsCell.border = cellBorders;
        researchPeriodsCell.alignment = defaultTableCellAlignment;

        // 12. Funding
        const researchFundingsCell = sheet.getCell(
            semestralRecordDataRow,
            semestralRecordDataCol++,
        );
        researchFundingsCell.value = research?.researchFundings || 'None';
        researchFundingsCell.border = cellBorders;
        researchFundingsCell.alignment = defaultTableCellAlignment;

        // 13. Mentoring (Task 11)
        const mentoringCell = sheet.getCell(semestralRecordDataRow, semestralRecordDataCol++);
        mentoringCell.value = mentoring?.mentoringDetails || 'None';
        mentoringCell.border = cellBorders;
        mentoringCell.alignment = defaultTableCellAlignment;

        // 14. TOTAL (Sum of Teaching + Admin + Research)
        const totalLoadCreditCell = sheet.getCell(semestralRecordDataRow, semestralRecordDataCol++);
        totalLoadCreditCell.value =
            (teaching?.teachingLoadCredit || 0) +
            (admin?.administrativeLoadCredit || 0) +
            (research?.researchLoadCredit || 0);
        totalLoadCreditCell.numFmt = '0.00';
        totalLoadCreditCell.border = cellBorders;
        totalLoadCreditCell.alignment = defaultTableCellAlignment;

        // 15. Course Units (Task 12)
        const courseUnitsCell = sheet.getCell(semestralRecordDataRow, semestralRecordDataCol++);
        courseUnitsCell.value = teaching?.courseUnits || 0;
        courseUnitsCell.border = cellBorders;
        courseUnitsCell.alignment = defaultTableCellAlignment;

        // 16. Remarks (Task 13 - Combined)
        const remarksCell = sheet.getCell(semestralRecordDataRow, semestralRecordDataCol++);
        remarksCell.value = combinedRemarks;
        remarksCell.border = cellBorders;
        remarksCell.alignment = defaultTableCellAlignment;

        semestralRecordDataRow++;
        semestralRecordDataCol = semestralRecordStartCol;
    });

    return { sheetName, model: sheet.model };
}
