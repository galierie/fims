import ExcelJS from '@protobi/exceljs';

import { cellBorders, type SheetCellValue } from '$lib/types/sheet-cell';
import { getFacultyBySubjectReport } from '$lib/server/queries/reports';

const constantHeaderCellValues: SheetCellValue[] = [
    {
        value: 'Subject',
        cellNum: 'A3',
        font: {
            bold: true,
        },
    },
    {
        value: 'Faculty',
        cellNum: 'B3',
        font: {
            bold: true,
        },
    },
];

const dataStartRow = 4;
const dataStartCol = 1;

export async function getFacultyBySubjectWorksheet() {
    const sheetName = 'By Subject Taught, Faculty';
    const data = await getFacultyBySubjectReport();

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

    const titleCell = sheet.getCell('A1');
    titleCell.value = 'By subject taught, faculty';
    titleCell.font = { bold: true };

    // Task 15: Define the specific order of categories
    const categories = ['Undergraduate', 'MA/PhD', 'MDE'];

    // Set data cells
    let row = dataStartRow;

    categories.forEach((cat) => {
        // Filter subjects belonging to the current category
        const subjectsInCategory = data.filter((d) => d.courseLevel === cat);

        if (subjectsInCategory.length > 0) {
            // 1. Add a Category Header Row
            const categoryHeaderCell = sheet.getCell(row, dataStartCol);
            categoryHeaderCell.value = cat.toUpperCase();
            categoryHeaderCell.font = { bold: true, italic: true };
            categoryHeaderCell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFF0F0F0' }, // Light grey background for the header
            };

            // Merge header across the two columns (Subject and Faculty)
            sheet.mergeCells(row, dataStartCol, row, dataStartCol + 1);

            // Apply borders to the merged header
            sheet.getCell(row, dataStartCol).border = cellBorders;
            sheet.getCell(row, dataStartCol + 1).border = cellBorders;

            row++; // Move to next row for the actual data

            // 2. Add the Subjects and Faculty for this category
            subjectsInCategory.forEach((s) => {
                let col = dataStartCol;

                const subjectCell = sheet.getCell(row, col++);
                subjectCell.value = s.courseTaught;
                subjectCell.border = cellBorders;

                const nameCell = sheet.getCell(row, col++);
                nameCell.value = s.faculty;
                nameCell.border = cellBorders;
                nameCell.alignment = { wrapText: true };

                row++; // Move to next row
            });

            // 3. Add a blank row as a spacer between categories
            row++;
        }
    });

    return { sheetName, model: sheet.model };
}
