import ExcelJS from '@protobi/exceljs';
import { getFacultyLoadingReport } from '$lib/server/queries/reports';
import { type SheetCellValue, cellBorders } from '$lib/types/sheet-cell';

const constantHeaderCellValues: SheetCellValue[] = [
  {
    value: 'Last Name/First Name/MI',
    cellNum: 'A5',
  },
  {
    value: 'Designation',
    cellNum: 'B5',
  },
  {
    value: 'Degree',
    cellNum: 'C5',
  },
  {
    value: 'Course Taught',
    cellNum: 'D5',
  },
  {
    value: 'Earned',
    cellNum: 'E5:F5',
  },
  {
    value: 'Schedule of Classes',
    cellNum: 'G5',
  },
  {
    value: 'Administrative Position',
    cellNum: 'H5',
  },
  {
    value: 'TOTAL',
    cellNum: 'I5:L5',
  },
  {
    value: 'Regular Faculty',
    cellNum: 'A6',
  },
  {
    value: 'Undergrad',
    cellNum: 'E6',
  },
  {
    value: 'Graduate',
    cellNum: 'F6',
  },
  {
    value: 'TLC',
    cellNum: 'I6',
  },
  {
    value: 'RLC',
    cellNum: 'J6',
  },
  {
    value: 'ALC',
    cellNum: 'K6',
  },
  {
    value: 'Total Load',
    cellNum: 'L6',
  },
  {
    value: 'Underload / Overload',
    cellNum: 'M6',
  },
  {
    value: 'Teaching load units',
    cellNum: 'N6',
  },
];

const emptyHeaderCells: string[] = ['M5', 'N5', 'B6', 'C6', 'D6', 'G6', 'H6'];

const dataStartCol = 1;
const dataStartRow = 7;

export async function getFacultyLoadingWorksheet(facultyIds: number[], acadYear: number) {
  const sheetName = 'Faculty Loading'
  const data = await Promise.all(facultyIds.map((id) => (getFacultyLoadingReport(id, acadYear))));

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

  headerCellValues.map(({ value, cellNum }) => {
    const cellNums = cellNum.split(':');
    const cell = sheet.getCell(cellNums[0]);
    cell.value = value;
    cell.font = { bold: true };
    cell.border = cellBorders;

    if (cellNums.length > 1) sheet.mergeCells(cellNum);
  });

  emptyHeaderCells.map(cellNum  => {
    const cellNums = cellNum.split(':');
    const cell = sheet.getCell(cellNums[0]);
    cell.border = cellBorders;

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
      designation,
      degree,
      coursesTaught,
      teachingLoadUnits,
      adminPosition,
      teachingLoadCredit,
      administrativeLoadCredit,
      researchLoadCredit,
    }] = facultyMember;

    const nameCell = sheet.getCell(row, col);
    nameCell.value = `${lastName}, ${firstName} ${middleName[0]}.`;
    nameCell.border = cellBorders;
    col++;

    const designationCell = sheet.getCell(row, col);
    designationCell.value = designation;
    designationCell.border = cellBorders;
    col++;

    const degreeCell = sheet.getCell(row, col);
    degreeCell.value = degree;
    degreeCell.border = cellBorders;
    col++

    const coursesTaughtCell = sheet.getCell(row, col);
    coursesTaughtCell.value = coursesTaught;
    coursesTaughtCell.border = cellBorders;
    col++;

    const earnedUndergrad = sheet.getCell(row, col);
    earnedUndergrad.border = cellBorders;
    col++;

    const earnedGraduate = sheet.getCell(row, col);
    earnedGraduate.border = cellBorders;
    col++;

    const scheduleOfClassesCell = sheet.getCell(row, col);
    scheduleOfClassesCell.border = cellBorders;
    col++;

    const adminPositionCell = sheet.getCell(row, col);
    adminPositionCell.value = adminPosition;
    adminPositionCell.border = cellBorders;
    col++;

    const teachingLoadCreditCell = sheet.getCell(row, col);
    teachingLoadCreditCell.value = teachingLoadCredit;
    teachingLoadCreditCell.numFmt = '0.00';
    teachingLoadCreditCell.border = cellBorders;
    col++;

    const researchLoadCreditCell = sheet.getCell(row, col);
    researchLoadCreditCell.value = researchLoadCredit;
    researchLoadCreditCell.numFmt = '0.00';
    researchLoadCreditCell.border = cellBorders;
    col++;

    const administrativeLoadCreditCell = sheet.getCell(row, col);
    administrativeLoadCreditCell.value = administrativeLoadCredit;
    administrativeLoadCreditCell.numFmt = '0.00';
    administrativeLoadCreditCell.border = cellBorders;
    col++;

    const totalLoadCreditCell = sheet.getCell(row, col);
    const totalLoadCredit = teachingLoadCredit + researchLoadCredit + administrativeLoadCredit;
    totalLoadCreditCell.value = totalLoadCredit;
    totalLoadCreditCell.numFmt = '0.00';
    totalLoadCreditCell.border = cellBorders;
    col++;

    const loadStatusCell = sheet.getCell(row, col);
    loadStatusCell.value = totalLoadCredit - 12;
    loadStatusCell.numFmt = '0.00';
    loadStatusCell.border = cellBorders;
    col++;

    const teachingLoadUnitsCell = sheet.getCell(row, col);
    teachingLoadUnitsCell.value = teachingLoadUnits;
    teachingLoadUnitsCell.numFmt = '0.00';
    teachingLoadUnitsCell.border = cellBorders;
    col++;
  }

  return { sheetName, model: sheet.model };
}
