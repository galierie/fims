import ExcelJS from '@protobi/exceljs';

import { cellBorders, type SheetCellValue } from '$lib/types/sheet-cell';
import { getFacultyLoadingReport } from '$lib/server/queries/reports';

const defaultHeaderCellAlignment: Partial<ExcelJS.Alignment> = {
    horizontal: 'center',
    vertical: 'top',
};

const defaultHeaderCellFont: Partial<ExcelJS.Font> = {
    bold: true,
};

const constantHeaderCellValues: SheetCellValue[] = [
    { value: 'Last Name/First Name/MI', cellNum: 'A5' },
    { value: 'Appointment Status', cellNum: 'B5' }, // Task 16: New B
    { value: 'Designation', cellNum: 'C5' }, // Shifted B -> C
    { value: 'Degree', cellNum: 'D5' }, // Shifted C -> D
    { value: 'Course Taught', cellNum: 'E5' }, // Shifted D -> E
    { value: 'Earned', cellNum: 'F5:G5' }, // Task 14: Shifted E:F -> F:G
    { value: 'Schedule of Classes', cellNum: 'H5' }, // Shifted G -> H
    { value: 'Administrative Position', cellNum: 'I5' }, // Shifted H -> I
    { value: 'TOTAL', cellNum: 'J5:M5' }, // Shifted I:L -> J:M
    { value: 'Regular Faculty', cellNum: 'A6', alignment: { horizontal: 'left' } },
    // Appointment Status (B6) will be handled by emptyHeaderCells
    { value: 'Undergrad', cellNum: 'F6' }, // Task 14: Shifted E -> F
    { value: 'Graduate', cellNum: 'G6' }, // Task 14: Shifted F -> G
    { value: 'TLC', cellNum: 'J6' }, // Shifted I -> J
    { value: 'RLC', cellNum: 'K6' }, // Shifted J -> K
    { value: 'ALC', cellNum: 'L6' }, // Shifted K -> L
    { value: 'Total Load', cellNum: 'M6' }, // Shifted L -> M
    { value: 'Underload / Overload', cellNum: 'N6', font: { color: { argb: 'FFFF0000' } } }, // Shifted M -> N
    { value: 'Teaching load units', cellNum: 'O6' }, // Shifted N -> O
];

// These are cells in the 2-row header that don't have text but need borders
const emptyHeaderCells: string[] = [
    'B6',
    'C6',
    'D6',
    'E6',
    'H6',
    'I6', // Row 6 empties
    'N5',
    'O5', // Row 5 empties above Overload/Units
];

const dataStartCol = 1;
const dataStartRow = 7;

export async function getFacultyLoadingWorksheet(
    facultyIds: number[],
    acadYear: number,
    semNum: number,
) {
    const sheetName = 'Faculty Loading';
    const data = await Promise.all(
        facultyIds.map((id) => getFacultyLoadingReport(id, acadYear, semNum)),
    );

    // Create Workbook
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(sheetName);

    // Set all header cells
    const headerCellValues: SheetCellValue[] = [
        ...constantHeaderCellValues,
        {
            value: `Faculty loading AY ${acadYear}-${acadYear + 1}`,
            cellNum: 'A2',
        },
    ];

    headerCellValues.map(({ value, cellNum, alignment, font }) => {
        const cellNums = cellNum.split(':');
        const cell = sheet.getCell(cellNums[0]);
        cell.value = value;
        cell.border = cellBorders;
        cell.alignment = typeof alignment === 'undefined' ? defaultHeaderCellAlignment : alignment;
        cell.font = typeof font === 'undefined' ? defaultHeaderCellFont : font;

        if (cellNums.length > 1) sheet.mergeCells(cellNum);
    });

    emptyHeaderCells.map((cellNum) => {
        const cellNums = cellNum.split(':');
        const cell = sheet.getCell(cellNums[0]);
        cell.border = cellBorders;

        if (cellNums.length > 1) sheet.mergeCells(cellNum);
    });

    // Set data cells
    let row = dataStartRow;
    for (let i = 0; i < data.length; i++, row++) {
        let col = dataStartCol;
        const facultyMember = data[i];

        console.log(facultyMember);

        const {
            lastName,
            firstName,
            middleName,
            appointmentStatus, // Task 16
            designation,
            degree,
            coursesTaught,
            undergradCredit, // Task 14
            gradCredit, // Task 14
            teachingLoadUnits,
            adminPositions,
            administrativeLoadCredit,
            researchLoadCredit,
        } = facultyMember;

        // 1. Name
        const nameCell = sheet.getCell(row, col++);
        nameCell.value = `${lastName}, ${firstName} ${middleName[0]}.`;
        nameCell.border = cellBorders;

        // 2. Appointment Status (Task 16)
        const statusCell = sheet.getCell(row, col++);
        statusCell.value = appointmentStatus || 'N/A';
        statusCell.border = cellBorders;

        // 3. Designation
        const designationCell = sheet.getCell(row, col++);
        designationCell.value = designation ?? '';
        designationCell.border = cellBorders;

        // 4. Degree
        const degreeCell = sheet.getCell(row, col++);
        degreeCell.value = degree ?? 'N/A';
        degreeCell.border = cellBorders;

        // 5. Course Taught
        const coursesTaughtCell = sheet.getCell(row, col++);
        coursesTaughtCell.value = coursesTaught;
        coursesTaughtCell.border = cellBorders;

        // 6. Earned: Undergrad (Task 14)
        const earnedUndergrad = sheet.getCell(row, col++);
        earnedUndergrad.value = undergradCredit || 0;
        earnedUndergrad.numFmt = '0.00';
        earnedUndergrad.border = cellBorders;
        earnedUndergrad.alignment = { horizontal: 'right' };

        // 7. Earned: Graduate (Task 14)
        const earnedGraduate = sheet.getCell(row, col++);
        earnedGraduate.value = gradCredit || 0;
        earnedGraduate.numFmt = '0.00';
        earnedGraduate.border = cellBorders;
        earnedGraduate.alignment = { horizontal: 'right' };

        // 8. Schedule of Classes (Empty/Placeholder)
        const scheduleOfClassesCell = sheet.getCell(row, col++);
        scheduleOfClassesCell.border = cellBorders;

        // 9. Admin Position
        const adminPositionCell = sheet.getCell(row, col++);
        adminPositionCell.value = adminPositions;
        adminPositionCell.border = cellBorders;

        // 10. TLC (Teaching Load Credit)
        const teachingLoadCreditCell = sheet.getCell(row, col++);
        teachingLoadCreditCell.value = undergradCredit + gradCredit;
        teachingLoadCreditCell.numFmt = '0.00';
        teachingLoadCreditCell.border = cellBorders;
        teachingLoadCreditCell.alignment = { horizontal: 'center' };

        // 11. RLC (Research Load Credit)
        const researchLoadCreditCell = sheet.getCell(row, col++);
        researchLoadCreditCell.value = researchLoadCredit;
        researchLoadCreditCell.numFmt = '0.00';
        researchLoadCreditCell.border = cellBorders;
        researchLoadCreditCell.alignment = { horizontal: 'center' };

        // 12. ALC (Administrative Load Credit)
        const administrativeLoadCreditCell = sheet.getCell(row, col++);
        administrativeLoadCreditCell.value = administrativeLoadCredit;
        administrativeLoadCreditCell.numFmt = '0.00';
        administrativeLoadCreditCell.border = cellBorders;
        administrativeLoadCreditCell.alignment = { horizontal: 'center' };

        // 13. TOTAL Load
        const totalLoadCreditCell = sheet.getCell(row, col++);
        const totalLoadValue =
            (undergradCredit || 0) + (gradCredit || 0) + (researchLoadCredit || 0) + (administrativeLoadCredit || 0);
        totalLoadCreditCell.value = totalLoadValue;
        totalLoadCreditCell.numFmt = '0.00';
        totalLoadCreditCell.border = cellBorders;
        totalLoadCreditCell.alignment = { horizontal: 'right' };

        // 14. Underload / Overload
        const loadStatusCell = sheet.getCell(row, col++);
        loadStatusCell.value = totalLoadValue - 12;
        loadStatusCell.numFmt = '0.00';
        loadStatusCell.border = cellBorders;
        loadStatusCell.alignment = { horizontal: 'right' };

        // 15. Teaching Load Units (Task 12 context)
        const teachingLoadUnitsCell = sheet.getCell(row, col++);
        teachingLoadUnitsCell.value = teachingLoadUnits;
        teachingLoadUnitsCell.numFmt = '0.00';
        teachingLoadUnitsCell.border = cellBorders;
        teachingLoadUnitsCell.alignment = { horizontal: 'right' };
    }

    return { sheetName, model: sheet.model };
}
