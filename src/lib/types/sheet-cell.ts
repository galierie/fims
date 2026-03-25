import ExcelJS from '@protobi/exceljs';

const cellBorderColor: Partial<ExcelJS.Color> = {
  argb: 'FF000000',
};

export const cellBorderSide: Partial<ExcelJS.Border> = {
  style: 'thin',
  color: cellBorderColor,
};

export const cellBorders: Partial<ExcelJS.Borders> = {
  top: cellBorderSide,
  left: cellBorderSide,
  bottom: cellBorderSide,
  right: cellBorderSide,
};

export interface SheetCellValue {
  value: string;
  cellNum: string;
}