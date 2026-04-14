import ExcelJS from '@protobi/exceljs';

import { cellBorders, type SheetCellValue } from '$lib/types/sheet-cell';
import { getSubjectsByFacultyReport } from '$lib/server/queries/reports';

const constantHeaderCellValues: SheetCellValue[] = [
    {
        value: 'Faculty',
        cellNum: 'A4',
        font: {
            bold: true,
        },
    },
    {
        value: 'Subject',
        cellNum: 'B4:D4',
        alignment: {
            horizontal: 'center',
        },
    },
    {
        value: 'Undergraduate',
        cellNum: 'B5',
        alignment: {
            horizontal: 'center',
        },
    },
    {
        value: 'MA, PhD',
        cellNum: 'C5',
        alignment: {
            horizontal: 'center',
        },
    },
    {
        value: 'MDE',
        cellNum: 'D5',
        alignment: {
            horizontal: 'center',
        },
    },
];

const dataStartRow = 6;
const dataStartCol = 1;

export async function getSubjectsByFacultyWorksheet(
    facultyIds: number[],
    acadYear: number,
    semNum: number,
) {
    const sheetName = 'By Faculty, Subjects Taught';
    const data = await Promise.all(
        facultyIds.map((id) => getSubjectsByFacultyReport(id, acadYear, semNum)),
    );

    // Create Workbook
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(sheetName);

    // Set all header cells
    constantHeaderCellValues.map(({ value, cellNum, alignment, font }) => {
        const cellNums = cellNum.split(':');
        const cell = sheet.getCell(cellNums[0]);
        cell.value = value;
        cell.border = cellBorders;
        if (typeof alignment !== 'undefined') cell.alignment = alignment;
        if (typeof font !== 'undefined') cell.font = font;

        if (cellNums.length > 1) sheet.mergeCells(cellNum);
    });

    const titleCell = sheet.getCell('A3');
    titleCell.value = 'Faculty subject taught';
    titleCell.font = { bold: true };

    // Widen columns
    for (let i = 1; i <= 4; i++) {
        sheet.getColumn(i).width = 20;
    }

    // Set data cells
    let row = dataStartRow;
    for (let i = 0; i < data.length; i++, row++) {
        let col = dataStartCol;
        const { name, courses } = data[i];

        if (typeof name === 'undefined' || courses.length === 0) continue;

        const { lastName, firstName, middleName } = name;

        const nameCell = sheet.getCell(row, col);
        nameCell.value = `${lastName}, ${firstName} ${middleName[0]}.`;
        nameCell.border = cellBorders;
        nameCell.alignment = { vertical: 'top' };
        col++;

        const undergrad = courses
            .filter((c) => c.courseLevel === 'Undergraduate')
            .map((c) => c.courseName)
            .join(', ');

        const maphd = courses
            .filter((c) => c.courseLevel === 'MA/PhD')
            .map((c) => c.courseName)
            .join(', ');

        const mde = courses
            .filter((c) => c.courseLevel === 'MDE')
            .map((c) => c.courseName)
            .join(', ');

        [undergrad, maphd, mde].forEach(level => {
            const subjectsCell = sheet.getCell(row, col);
            subjectsCell.value = level;
            subjectsCell.border = cellBorders;
            subjectsCell.alignment = { vertical: 'top' };
            col++;
        });
    }

    return { sheetName, model: sheet.model };
}
