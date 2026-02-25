import type { PgColumn } from 'drizzle-orm/pg-core';

export interface FilterObject {
    name: string;
    filter: string;
    opts: string[];
    selectedOpts: string[];
}

export interface FilterColumn {
    obj: FilterObject;
    column: PgColumn;
}
