import {test, expect, type Page, type Locator} from '@playwright/test'
import * as consts from '../test-consts';

export async function profiletab(page:Page):Promise<Locator> {
	let tab =  page.locator('a').getByText('Profile')
	await expect(tab).toBeVisible();

	return tab
}

export async function semrecstab(page:Page):Promise<Locator> {
	let tab =  page.locator('a').getByText('Semestral Records')
	await expect(tab).toBeVisible();

	return tab
}

export async function inputField(field:string, input:string, page:Page) {
	let elem = page.getByRole('textbox', {name: field, exact:true});
	await expect(elem).toBeVisible();
	await elem.fill(input);
}

export async function compareField(field:string, cmp:string, page:Page) {
	let elem = page.getByRole('textbox', {name: field, exact:true});
	await expect(elem).toBeVisible();
	await expect(elem).toHaveText(cmp);
}

//inputs something to the list
export async function testList(listHeader:string, inputs:string[], inputTypes:consts.possibleInputs, buttonText:string, page:Page) {
	let addButton = page.getByRole('button', {name: buttonText, exact:true});
	let header = page.locator('span').getByText(listHeader);

	await expect(header).toBeVisible()
	await expect(addButton).toBeVisible()

	await addButton.click();

	let listDiv = header.locator('..').locator('..');
	await expect(listDiv).toBeVisible();

	let inputRow = listDiv.locator('div').last();
	await expect(inputRow).toBeVisible();

	for (let idx = 0; idx < inputs.length; idx++) {
		let inputDiv = inputRow.locator('*').nth(idx);
		let curInput = inputs[idx];

		switch (inputTypes[idx]) {
			case 'textbox':
				inputDiv.getByRole('textbox').fill(curInput)
				break;
			case 'dropdown':
				await inputDiv.getByRole('button').click();
				await inputDiv.getByText(curInput).first().click();
				break;
			case 'numeric':
				// https://github.com/primefaces/primevue/issues/7504
				await inputDiv.locator('input').focus();
				await page.keyboard.press(inputs[idx]);
				break;
			case 'date':
				await inputDiv.locator('input').fill(curInput);
				break;
			case 'checkbox':
				await inputDiv.getByRole('checkbox').setChecked(curInput === 'true');
			case 'remarks':
				await inputDiv.getByRole('button', {name: 'Expand', exact: true}).click();
				await page.locator('textarea').last().fill(curInput); //get the frontmost text area that appears
				await page.getByRole('button', {name:'Close', exact:true}).click();
		} 
	}
}

//compares the last entry in the header
export async function compareList(listHeader:string, compare:string[], page:Page) {
	let header = page.locator('span').getByText('listHeader');
	await expect(header).toBeVisible();

	let inputRow = header.locator('..').locator('div').last();
	await expect(inputRow).toBeVisible();

	for (let idx = 0; idx < compare.length; idx++) {
		let inputText = inputRow.locator('*').nth(idx);
		await expect(inputText).toBeVisible();
		await expect(inputText).toHaveText(compare[idx]);
	}
}