import ExcelJS from '@protobi/exceljs';

import { cellBorders, type SheetCellValue } from '$lib/types/sheet-cell';
import { getFacultyProfileReport } from '$lib/server/queries/reports';

const defaultHeaderCellAlignment: Partial<ExcelJS.Alignment> = {
    horizontal: 'center',
    vertical: 'top',
};

const defaultHeaderCellFont: Partial<ExcelJS.Font> = {
    bold: true,
};

const defaultCellAlignment: Partial<ExcelJS.Alignment> = {
    horizontal: 'left',
    vertical: 'top',
};

const constantHeaderCellValues: SheetCellValue[] = [
    { value: 'Name of Faculty', cellNum: 'A1' },
    { value: 'Home Addresses', cellNum: 'B1' },
    { value: 'Contact Nos.', cellNum: 'C1' },
    { value: 'Email Addresses', cellNum: 'D1' },
    { value: 'Birth Date', cellNum: 'E1' },
    { value: 'Degree / Institution / Year', cellNum: 'F1' },
    { value: 'Field of Interest', cellNum: 'G1' },
    { value: 'Designation / SG', cellNum: 'H1' },
    { value: 'Salary Rate / annum', cellNum: 'I1' },
    { value: 'Appointment Status', cellNum: 'J1' }, // <-- NEW Column J
    { value: 'Date of Original Appointment', cellNum: 'K1' }, // Shisted K
    { value: 'PSI Item Number', cellNum: 'L1' }, // Shifted L
    { value: 'Employee Number', cellNum: 'M1' }, // Shifted M
    { value: 'TIN', cellNum: 'N1' }, // Shifted N
    { value: 'GSIS BP#', cellNum: 'O1' }, // Shifted O
    { value: 'Philhealth#', cellNum: 'P1' }, // Shifted P
    { value: 'Pag-IBIG#', cellNum: 'Q1' }, // Shifted Q
    { value: 'Remarks (Tenure, promotion, etc.)', cellNum: 'R1' }, // Shifted R
];

const dataStartCol = 1;
const dataStartRow = 2;

export async function getFacultyProfileWorksheet(facultyIds: number[]) {
    const sheetName = 'Faculty Profile';
    const rawData = await Promise.all(facultyIds.map((id) => getFacultyProfileReport(id)));
    const data = rawData.filter((datum) => datum !== null);

    if (data.length === 0) return null;

    // Create Workbook
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(sheetName);

    // Set all header cells
    constantHeaderCellValues.map(({ value, cellNum }) => {
        const cell = sheet.getCell(cellNum);
        cell.value = value;
        cell.border = cellBorders;
        cell.alignment = defaultHeaderCellAlignment;
        cell.font = defaultHeaderCellFont;
    });

    // Widen all columns
    for (let i = 1; i <= constantHeaderCellValues.length; i++) sheet.getColumn(i).width = 20;

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
            homeAddresses,
            contactNumbers,
            emailAddresses,
            birthDate,
            educationalAttainments,
            fieldsOfInterest,
            designation,
            salaryGrade,
            salaryRate,
            appointmentStatus,
            dateOfOriginalAppointment,
            psiItem,
            employeeNumber,
            tin,
            gsis,
            philhealth,
            pagIbig,
            remarks,
        } = facultyMember;

        const nameCell = sheet.getCell(row, col);
        nameCell.value = `${lastName}, ${firstName} ${middleName[0]}.`;
        nameCell.border = cellBorders;
        nameCell.alignment = defaultCellAlignment;
        col++;

        const homeAddressCell = sheet.getCell(row, col);
        homeAddressCell.value = homeAddresses;
        homeAddressCell.border = cellBorders;
        homeAddressCell.alignment = defaultCellAlignment;
        col++;

        const contactNumbersCell = sheet.getCell(row, col);
        contactNumbersCell.value = contactNumbers;
        contactNumbersCell.border = cellBorders;
        contactNumbersCell.alignment = defaultCellAlignment;
        col++;

        const emailAddressesCell = sheet.getCell(row, col);
        emailAddressesCell.value = emailAddresses;
        emailAddressesCell.border = cellBorders;
        emailAddressesCell.alignment = defaultCellAlignment;
        col++;

        const birthDateCell = sheet.getCell(row, col);
        birthDateCell.value = birthDate;
        birthDateCell.border = cellBorders;
        birthDateCell.alignment = defaultCellAlignment;
        col++;

        const educationalAttainmentsCell = sheet.getCell(row, col);
        educationalAttainmentsCell.value = educationalAttainments;
        educationalAttainmentsCell.border = cellBorders;
        educationalAttainmentsCell.alignment = defaultCellAlignment;
        col++;

        const fieldsOfInterestCell = sheet.getCell(row, col);
        fieldsOfInterestCell.value = fieldsOfInterest;
        fieldsOfInterestCell.border = cellBorders;
        fieldsOfInterestCell.alignment = defaultCellAlignment;
        col++;

        const designationSalaryGradeCell = sheet.getCell(row, col);
        designationSalaryGradeCell.value =
            designation === null || salaryGrade === null ? '' : `${designation} (${salaryGrade})`;
        designationSalaryGradeCell.border = cellBorders;
        designationSalaryGradeCell.alignment = defaultCellAlignment;
        col++;

        const salaryRateCell = sheet.getCell(row, col);
        salaryRateCell.value = salaryRate === null ? 0 : parseFloat(salaryRate);
        salaryRateCell.numFmt = '0.00';
        salaryRateCell.border = cellBorders;
        salaryRateCell.alignment = defaultCellAlignment;
        col++;

        const appointmentStatusCell = sheet.getCell(row, col);
        appointmentStatusCell.value = appointmentStatus || '';
        appointmentStatusCell.border = cellBorders;
        appointmentStatusCell.alignment = defaultCellAlignment;
        col++;

        const dateOfOriginalAppointmentCell = sheet.getCell(row, col);
        dateOfOriginalAppointmentCell.value = dateOfOriginalAppointment;
        dateOfOriginalAppointmentCell.border = cellBorders;
        dateOfOriginalAppointmentCell.alignment = defaultCellAlignment;
        col++;

        const psiItemCell = sheet.getCell(row, col);
        psiItemCell.value = psiItem;
        psiItemCell.border = cellBorders;
        psiItemCell.alignment = defaultCellAlignment;
        col++;

        const employeeNumberCell = sheet.getCell(row, col);
        employeeNumberCell.value = employeeNumber;
        employeeNumberCell.border = cellBorders;
        employeeNumberCell.alignment = {
            horizontal: 'center',
            vertical: 'top',
        };
        col++;

        const tinCell = sheet.getCell(row, col);
        tinCell.value = tin;
        tinCell.border = cellBorders;
        tinCell.alignment = defaultCellAlignment;
        col++;

        const gsisCell = sheet.getCell(row, col);
        gsisCell.value = gsis;
        gsisCell.border = cellBorders;
        gsisCell.alignment = defaultCellAlignment;
        col++;

        const philhealthCell = sheet.getCell(row, col);
        philhealthCell.value = philhealth;
        philhealthCell.border = cellBorders;
        philhealthCell.alignment = defaultCellAlignment;
        col++;

        const pagIbigCell = sheet.getCell(row, col);
        pagIbigCell.value = pagIbig;
        pagIbigCell.border = cellBorders;
        pagIbigCell.alignment = defaultCellAlignment;
        col++;

        const remarksCell = sheet.getCell(row, col);
        remarksCell.value = remarks;
        remarksCell.border = cellBorders;
        remarksCell.alignment = defaultCellAlignment;
        col++;
    }

    return { sheetName, model: sheet.model };
}
