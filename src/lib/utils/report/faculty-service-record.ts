import ExcelJS from '@protobi/exceljs';
import { getFacultyServiceRecordReport } from '$lib/server/queries/reports';
import { type SheetCellValue, cellBorders } from '$lib/types/sheet-cell';

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
  'Research Credit',
  'Title of Research',
  'Start/End Date',
  'Funding',
  'TOTAL',
  'Number of Units',
  'Remarks',
];

const semNumCellValues = ['Midyear', 'First Semester', 'Second Semester'];

export async function getFacultyServiceRecordWorksheet(facultyid: number, fromAcadYear: number, fromSemNum: number, toAcadYear: number, toSemNum: number) {
  const sheetName = 'Faculty Service Record';
  const { profile, originalTenure, adminPositions, fieldsOfInterest, semestralRecords, currentTeachingLoad, currentAdministrativeLoad, currentResearchLoad } = await getFacultyServiceRecordReport(facultyid, fromAcadYear, fromSemNum, toAcadYear, toSemNum);

  // Create Workbook
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);

  // Set heading cells
  const institutionCell = sheet.getCell('A1');
  institutionCell.value = INSTITUTION;
  institutionCell.alignment = { horizontal: 'center' };
  institutionCell.font = { bold: true };
  sheet.mergeCells('A1:M1');

  const universityCell = sheet.getCell('A2');
  universityCell.value = 'University of the Philippines';
  universityCell.alignment = { horizontal: 'center' };
  sheet.mergeCells('A2:M2');

  const titleCell = sheet.getCell('A4');
  titleCell.value = 'Faculty Service Record';
  titleCell.alignment = { horizontal: 'center' };
  titleCell.font = { bold: true };
  sheet.mergeCells('A4:M4');

  // Populate admin positions
  let adminPositionRow = adminPositionsStartRow;
  adminPositions.forEach(({ adminPosition, office, periods }) => {
    const adminPositionCell = sheet.getCell(adminPositionRow, adminPositionsStartCol);
    adminPositionCell.value = `${adminPosition}, ${office}: ${periods}`;
    adminPositionCell.alignment = defaultNonTableCellAlignment;
    sheet.mergeCells(adminPositionRow, adminPositionsStartCol, adminPositionRow, adminPositionsStartCol + 7);
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
  sheet.mergeCells(adminPositionRow, adminPositionsStartCol, adminPositionRow, adminPositionsStartCol + 7);

  // Populate profile
  let profileRow = adminPositionRow;
  const [{
    lastName,
    firstName,
    middleName,
    currentAppointment,
    currentAppointmentStatus,
    dateOfOriginalAppointment,
    highestEducationalAttainmentDegree,
    highestEducationAttainmentInstitution,
    highestEducationAttainmentGraduationYear,
  }] = profile;

  const educationalAttainmentLabelCell = sheet.getCell(profileRow, profileStartCol);
  educationalAttainmentLabelCell.value = 'Degree:';
  educationalAttainmentLabelCell.alignment = defaultNonTableCellAlignment;

  const educationalAttainmentCell = sheet.getCell(profileRow, profileStartCol + 1);
  const educationalAttainmentStr = [highestEducationalAttainmentDegree, highestEducationAttainmentInstitution, highestEducationAttainmentGraduationYear].filter(str => (str !== null)).join(', ');
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
  let semestralRecordHeaderRow = adminPositionRow + 2;
  let semestralRecordHeaderCol = semestralRecordStartCol;
  constantSemestralRecordHeaderCellValues.forEach(header => {
    const headerCell = sheet.getCell(semestralRecordHeaderRow, semestralRecordHeaderCol);
    headerCell.value = header;
    headerCell.border = cellBorders,
    headerCell.alignment = {
      horizontal: 'center',
      vertical: 'top',
      wrapText: true,
    };
    semestralRecordHeaderCol++;
  });

  let semestralRecordDataRow = semestralRecordHeaderRow + 1;
  let semestralRecordDataCol = semestralRecordStartCol;
  let currentAcadYear = 0;
  semestralRecords.forEach(record => {
    const {
      acadSemesterId,
      acadYear,
      semNum,
      remarks,
    } = record;

    const [{
      currentCoursesTaught,
      teachingLoadCredit,
      numOfStudentsPerCourse,
    }] = currentTeachingLoad.filter(t => t.acadSemesterId === acadSemesterId);
    const [{
      administrativeLoadCredit,
      currentAdminPositions
    }] = currentAdministrativeLoad.filter(a => a.acadSemesterId === acadSemesterId);
    const [{
      researchLoadCredit,
      researchTitles,
      researchPeriods,
      researchFundings,
    }] = currentResearchLoad.filter(r => r.acadSemesterId === acadSemesterId);

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
      
      for (let i = 2; i <= constantSemestralRecordHeaderCellValues.length; i++, semestralRecordDataCol++) {
        sheet.getCell(semestralRecordDataRow, semestralRecordDataCol).border = cellBorders
      }

      semestralRecordDataRow++;
      semestralRecordDataCol = semestralRecordStartCol;
      currentAcadYear = acadYear;
    }

    const semNumCell = sheet.getCell(semestralRecordDataRow, semestralRecordDataCol);
    semNumCell.value = semNumCellValues[semNum];
    semNumCell.border = cellBorders;
    semNumCell.alignment = defaultTableCellAlignment;
    semestralRecordDataCol++;

    const coursesTaughtCell = sheet.getCell(semestralRecordDataRow, semestralRecordDataCol);
    coursesTaughtCell.value = currentCoursesTaught;
    coursesTaughtCell.border = cellBorders;
    coursesTaughtCell.alignment = defaultTableCellAlignment;
    semestralRecordDataCol++;

    const teachingLoadCreditCell = sheet.getCell(semestralRecordDataRow, semestralRecordDataCol);
    teachingLoadCreditCell.value = teachingLoadCredit;
    teachingLoadCreditCell.numFmt = '0.00';
    teachingLoadCreditCell.border = cellBorders;
    teachingLoadCreditCell.alignment = defaultTableCellAlignment;
    semestralRecordDataCol++;

    const numOfStudentsPerCourseCell = sheet.getCell(semestralRecordDataRow, semestralRecordDataCol);
    numOfStudentsPerCourseCell.value = numOfStudentsPerCourse;
    numOfStudentsPerCourseCell.border = cellBorders;
    numOfStudentsPerCourseCell.alignment = defaultTableCellAlignment;
    semestralRecordDataCol++;

    const administrativeLoadCreditCell = sheet.getCell(semestralRecordDataRow, semestralRecordDataCol);
    administrativeLoadCreditCell.value = administrativeLoadCredit;
    administrativeLoadCreditCell.numFmt = '0.00';
    administrativeLoadCreditCell.border = cellBorders;
    administrativeLoadCreditCell.alignment = defaultTableCellAlignment;
    semestralRecordDataCol++;

    const currentAdminPositionsCell = sheet.getCell(semestralRecordDataRow, semestralRecordDataCol);
    currentAdminPositionsCell.value = currentAdminPositions;
    currentAdminPositionsCell.border = cellBorders;
    currentAdminPositionsCell.alignment = defaultTableCellAlignment;
    semestralRecordDataCol++;

    const researchLoadCreditCell = sheet.getCell(semestralRecordDataRow, semestralRecordDataCol);
    researchLoadCreditCell.value = researchLoadCredit;
    researchLoadCreditCell.numFmt = '0.00';
    researchLoadCreditCell.border = cellBorders;
    researchLoadCreditCell.alignment = defaultTableCellAlignment;
    semestralRecordDataCol++;

    const researchTitlesCell = sheet.getCell(semestralRecordDataRow, semestralRecordDataCol);
    researchTitlesCell.value = researchTitles;
    researchTitlesCell.border = cellBorders;
    researchTitlesCell.alignment = defaultTableCellAlignment;
    semestralRecordDataCol++;

    const researchPeriodsCell = sheet.getCell(semestralRecordDataRow, semestralRecordDataCol);
    researchPeriodsCell.value = researchPeriods;
    researchPeriodsCell.border = cellBorders;
    researchPeriodsCell.alignment = defaultTableCellAlignment;
    semestralRecordDataCol++;

    const researchFundingsCell = sheet.getCell(semestralRecordDataRow, semestralRecordDataCol);
    researchFundingsCell.value = researchFundings;
    researchFundingsCell.border = cellBorders;
    researchFundingsCell.alignment = defaultTableCellAlignment;
    semestralRecordDataCol++;

    const totalLoadCreditCell = sheet.getCell(semestralRecordDataRow, semestralRecordDataCol);
    totalLoadCreditCell.value = teachingLoadCredit + administrativeLoadCredit + researchLoadCredit;
    totalLoadCreditCell.numFmt = '0.00';
    totalLoadCreditCell.border = cellBorders;
    totalLoadCreditCell.alignment = defaultTableCellAlignment;
    semestralRecordDataCol++;

    const numOfUnitsCell = sheet.getCell(semestralRecordDataRow, semestralRecordDataCol);
    numOfUnitsCell.border = cellBorders;
    numOfUnitsCell.alignment = defaultTableCellAlignment;
    semestralRecordDataCol++;

    const remarksCell = sheet.getCell(semestralRecordDataRow, semestralRecordDataCol);
    remarksCell.value = remarks;
    remarksCell.border = cellBorders;
    remarksCell.alignment = defaultTableCellAlignment;
    semestralRecordDataCol++;

    semestralRecordDataRow++;
    semestralRecordDataCol = semestralRecordStartCol;
  });

  return { sheetName, model: sheet.model };
}