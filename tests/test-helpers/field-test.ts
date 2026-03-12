import {test, expect, type Page} from '@playwright/test'


export async function testField(field:string, input:string, page:Page) {
	await expect(page.getByRole('textbox', {name: field, exact: true})).toBeVisible()
}

export async function testList(listHeader:string, inputs:string[]|string[][], buttonText:string, page:Page) {
	let addButton = page.getByRole('button', {name: buttonText, exact:true});
	let header = page.locator('span').getByText('listHeader');

	await expect(header).toBeVisible()
	await expect(addButton).toBeVisible()
}