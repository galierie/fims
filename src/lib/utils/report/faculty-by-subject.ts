import ExcelJS from '@protobi/exceljs';
import { getFacultyBySubjectReport } from '$lib/server/queries/reports';
import { type SheetCellValue, cellBorders } from '$lib/types/sheet-cell';

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

export async function getFacultyBySubjectWorksheet(acadYear: number, semNum: number) {
  const sheetName = 'By Subject Taught, Faculty';
  const data = await getFacultyBySubjectReport(acadYear, semNum);

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

  // Set data cells
  for (let i = 0; i < data.length; i++) {
    const row = i + dataStartRow;
    let col = dataStartCol;

    const {
      courseTaught,
      faculty,
    } = data[i];

    const subjectCell = sheet.getCell(row, col);
    subjectCell.value = courseTaught;
    subjectCell.border = cellBorders;
    col++;

    const nameCell = sheet.getCell(row, col);
    nameCell.value = faculty;
    nameCell.border = cellBorders;
    col++;
  }

  return { sheetName, model: sheet.model };
}