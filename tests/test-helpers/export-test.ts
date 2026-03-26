import {type Page, type Locator, expect} from '@playwright/test'

export const acadYears = [
	'AY 2023-2024',
	'AY 2024-2025',
	'AY 2025-2026',
	'AY 2026-2027',
	'AY 2027-2028',
]

export const sems = [
	'1st Semester',
	'2st Semester',
	'Midyear',
]

export const dateRanges = [
	'From:',
	'To:',
]

export const checkboxOptions = [
	'Faculty Profile',
	'Faculty Service Record',
	'Faculty Loading',
	'Faculty SET Average',

	'Aggregate Selected Reports into One File?',

	'By Faculty, Subject Taught',
	'By Subject Taught, Faculty',

	'Aggregate Selected Reports into One File?', //why are there two
]

export const exportOptions = [
	'CSV',
	'XLSX',
]

export async function getExportRecords(page:Page):Promise<Locator> {
	let loc = page.getByRole('button', {name:'Export Reports', exact:true});
	await expect(loc).toBeVisible();
	return loc
}

export async function getDateSelects(page:Page, rangeText:string, text:string):Promise<Locator> {
	let loc = page.locator('div', {hasText: rangeText}).getByRole('combobox').getByText(text);
	await expect(loc).toBeVisible();
	return loc
};

export async function getCheckbox(page:Page, text:string):Promise<Locator> {
	let loc = page.getByRole('checkbox', {name: text}).first();
	await expect(loc).toBeVisible();
	return loc
}

export async function getRadio(page:Page, text:string):Promise<Locator> {
	let loc = page.getByRole('radio', {name: text}).first();
	await expect(loc).toBeVisible();
	return loc
}

export async function getCancel(page:Page):Promise<Locator> {
	let button = page.getByRole('button', {name: 'Cancel'}).last();
	await expect(button).toBeVisible()
	return button
}

export async function getExportButton(page:Page):Promise<Locator> {
	let button = page.getByRole('button', {name: 'Export', exact:true}).last();
	await expect(button).toBeVisible()
	return button
}