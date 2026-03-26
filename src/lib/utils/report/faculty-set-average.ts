import ExcelJS from '@protobi/exceljs';
import { getFacultySETReport } from "$lib/server/queries/reports";
import { type SheetCellValue, cellBorders } from '$lib/types/sheet-cell';

const defaultHeaderCellAlignment: Partial<ExcelJS.Alignment> = {
  horizontal: 'center',
  vertical: 'middle',
};

const defaultHeaderCellFont: Partial<ExcelJS.Font> = {
  bold: true,
};

const constantHeaderCellValues: SheetCellValue[] = [
  {
    value: 'Faculty',
    cellNum: 'A6:A7',
  },
  {
    value: 'Semester',
    cellNum: 'B6:B7',
  },
  {
    value: 'Course/Section',
    cellNum: 'C6:C7',
  },
  {
    value: 'Teacher Average',
    cellNum: 'D6:D7',
  },
  {
    value: 'Average',
    cellNum: 'E6:E7'
  },
];

const dataStartRow = 8;
const dataStartCol = 1;

export async function getFacultySETAverageWorksheet(facultyIds: number[], acadYear: number) {
  const sheetName = 'Faculty SET Average';
  const data = await Promise.all(facultyIds.map((id) => (getFacultySETReport(id, acadYear))));

  // Create Workbook
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);

  // Set all header cells
  constantHeaderCellValues.map(({ value, cellNum, alignment, font }) => {
    const cellNums = cellNum.split(':');
    const cell = sheet.getCell(cellNums[0]);
    cell.value = value;
    cell.border = cellBorders;
    cell.alignment = (typeof alignment === 'undefined') ? defaultHeaderCellAlignment : alignment;
    cell.font = (typeof font === 'undefined') ? defaultHeaderCellFont : font;

    if (cellNums.length > 1) sheet.mergeCells(cellNum);
  });

  const titleCell = sheet.getCell('A3');
  titleCell.value = `S E T   Results for AY ${acadYear}-${acadYear + 1}`;
  titleCell.font = { bold: true };

  // Set data cells
  let row = dataStartRow;
  for (let i = 0; i < data.length; i++) {
    let col = dataStartCol;
    const { facultyInfo, semestralCoursesInfo } = data[i];

    console.log(facultyInfo);

    // Faculty Info
    const { lastName, firstName, middleName } = facultyInfo;

    const nameCell = sheet.getCell(row, col);
    nameCell.value = `${lastName}, ${firstName} ${middleName[0]}.`;
    nameCell.border = cellBorders;
    col++;

    // Semester-specific data
    const semCellValues = ['1st Semester', '2nd Semester', 'Midyear'];
    semestralCoursesInfo.forEach((coursesInfo, coursesInfoIdx) => {
      if (coursesInfo.length !== 0) {
        const semCell = sheet.getCell(row, col);
        semCell.value = semCellValues[coursesInfoIdx];
        semCell.border = cellBorders;
        col++;

        let totalSemSET = 0;
        coursesInfo.forEach(({ courseName, section, sectionSET }, courseIdx) => {
          const sectionSETNum = sectionSET === null ? 0 : parseFloat(sectionSET);
          totalSemSET += sectionSETNum;

          if (courseIdx !== 0) {
            sheet.getCell(row, col).border = cellBorders;
            col++;

            sheet.getCell(row, col).border = cellBorders;
            col++;
          }

          const courseSectionCell = sheet.getCell(row, col);
          courseSectionCell.value = `${courseName} ${section ?? ''}`;
          courseSectionCell.border = cellBorders;
          col++;

          const sectionSETCell = sheet.getCell(row, col);
          sectionSETCell.value = sectionSETNum;
          sectionSETCell.numFmt = '0.0000';
          sectionSETCell.border = cellBorders;
          col++;

          if (courseIdx === coursesInfo.length - 1) {
            const semSETAverageCell = sheet.getCell(row, col);
            semSETAverageCell.value = totalSemSET / coursesInfo.length;
            semSETAverageCell.border = cellBorders;
            col++;
          } else {
            sheet.getCell(row, col).border = cellBorders;
            col++;
          }

          row++;
          col = dataStartCol;
        });

        // Spacing
        sheet.getCell(row, col).border = cellBorders;
        col++;

        sheet.getCell(row, col).border = cellBorders;
        col++;

        sheet.getCell(row, col).border = cellBorders;
        col++;

        sheet.getCell(row, col).border = cellBorders;
        col++;

        sheet.getCell(row, col).border = cellBorders;
        col++;

        row++;
        col = dataStartCol + 1;
      }
    });
  }

  return { sheetName, model: sheet.model };
}