import ExcelJS from '@protobi/exceljs';
import { getSubjectsByFacultyReport } from "$lib/server/queries/reports";
import { type SheetCellValue, cellBorders } from '$lib/types/sheet-cell';

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
];

const dataStartRow = 5;
const dataStartCol = 1;

export async function getSubjectsByFacultyWorksheet(facultyIds: number[], acadYear: number, sem: number) {
  const sheetName = 'By Faculty, Subjects Taught'
  const data = await Promise.all(facultyIds.map((id) => (getSubjectsByFacultyReport(id, acadYear, sem))));

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
    if (typeof alignment !== 'undefined') cell.alignment = alignment;
    if (typeof font !== 'undefined') cell.font = font;

    if (cellNums.length > 1) sheet.mergeCells(cellNum);
  });

  // Set data cells
  for (let i = 0; i < data.length; i++) {
    const row = i + dataStartRow;
    let col = dataStartCol;
    const facultyMember = data[i];

    if (facultyMember.length === 0) continue;

    console.log(facultyMember);

    const [{
      lastName,
      firstName,
      middleName,
      coursesTaught,
    }] = facultyMember;

    const nameCell = sheet.getCell(row, col);
    nameCell.value = `${lastName}, ${firstName} ${middleName[0]}.`;
    nameCell.border = cellBorders;
    col++;

    const subjectsCell = sheet.getCell(row, col);
    subjectsCell.value = coursesTaught;
    subjectsCell.border = cellBorders;
    sheet.mergeCells(row, col, row, col + 2);
    col += 3;
  }

  return { sheetName, model: sheet.model };
}