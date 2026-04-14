export interface InputCellValue {
    columnNum: number;
    defaultValue?: string | Date;
    defaultChecked?: boolean;
}

export interface InputColumnType {
    label: string;
    name: string;
    colSpan: number;
    type:
        | 'text'
        | 'number'
        | 'email'
        | 'date'
        | 'checkbox'
        | 'dropdown'
        | 'expandable'
        | 'dependent'
        | 'datalist';
    isImmutable?: boolean;
    isRequired?: boolean;

    // For dropdown columns
    opts?: string[];

    // For dependent columns
    dependentOn?: number;
    dependencyMap?: Map<string, string>;
}

export interface InputRowValue {
    rowNum: number;
    row: InputCellValue[];
    tupleid?: number;
}
