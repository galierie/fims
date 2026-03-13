import {test, expect, type Page} from '@playwright/test';
import * as consts from '../../test-consts';
import * as fieldHelp from '../../test-helpers/field-test';


async function getFields(page:Page, fields:string[]) {
	let res:string[] = []
	for (let idx = 0; idx < fields.length; idx++) {
		res.push(await page.getByRole('textbox', {name:fields[idx], exact:true}).innerText())
	}
	return res
}
async function getPrevLists(page:Page, expectedInputs:string[]) {

}

async function editProfileFields(page:Page, inputs:string[]) {
	for (let idx=0; idx<consts.profileTabFields.length; idx++) {
		await fieldHelp.inputField(consts.profileTabFields[idx], inputs[idx], page);
	}
}

async function verifyProfileFields(page:Page, inputs:string[]) {
	for (let idx=0; idx<consts.profileTabFields.length; idx++) {
		await fieldHelp.compareField(consts.profileTabFields[idx], inputs[idx], page);
	}
}

// just filler for now
async function editSemRecFields(page:Page) {
}
async function verifySemRecFields(page:Page) {
}


async function editLists(page:Page, rowInputs:consts.testRowTuple[]) {
	for (let cur of rowInputs) {
		const header = cur[0];
		const addButtonText = cur[1];
		const colInputs = cur[2];
		const inputTypes = cur[3];

		await fieldHelp.testList(header, colInputs, inputTypes, addButtonText, page);
	}
}
async function verifyLists(page:Page, rowInputs:consts.testRowTuple[]) {
	for (let cur of rowInputs) {
		const header = cur[0];
		const colInputs = cur[2];

		await fieldHelp.compareList(header, colInputs, page);
	}
}


test.describe('editing record under profile tab', () => {
	test.use({storageState:consts.AdminConfig});
	let sampleInputs = consts.getFieldTest();
	let sampleListInputs = consts.profileTabListSample();

	test('cancelled editing fields', async ({page}) => {
		//go to faculty record
		await page.goto('/')
		await page.getByText('Camingao, Ericsson Jake').click() // some random record

		//get previous values for comparison
		let prevInputs = await getFields(page, consts.profileTabFields);

		//edit
		let editButton = page.getByRole('button', {name: 'Edit'});

		await expect(editButton).toBeVisible();
		await editButton.click();

		await editProfileFields(page, sampleInputs);

		//cancel changes
		let cancelButton = page.getByRole('button', {name:'Discard Changes', exact:true});
		await expect(cancelButton).toBeVisible();
		await cancelButton.click();

		//check if nothing changed
		await verifyProfileFields(page, prevInputs);

	})
	test('confirmed editing fields', async ({page}) => {
		//go to faculty record
		await page.goto('/')
		await page.getByText('Camingao, Ericsson Jake').click() // some random record

		//edit
		let editButton = page.getByRole('button', {name: 'Edit'});
		await expect(editButton).toBeVisible();
		await editButton.click();

		await editProfileFields(page, sampleInputs);

		//save changes
		let saveButton = page.getByRole('button', {name:'Save Record', exact:true});
		await expect(saveButton).toBeVisible();
		await saveButton.click();

		let confirmButton = page.getByRole('button', {name: consts.SaveConfirmText, exact:true});
		await expect(confirmButton).toBeVisible();
		await confirmButton.click();

		//check if changed
		await verifyProfileFields(page, sampleInputs);
	})

	test('cancelled editing lists', async ({page}) => {
		//go to faculty record
		await page.goto('/')
		await page.getByText('Dela Cruz, Gabrielle Zach').click() // some random record

		//get the last of each list
		let compares:consts.testRowTuple[] = []
		for (let e of sampleListInputs) {
			const header = e[0]
			const addButton = e[1]
			compares.push([
				header, addButton, await fieldHelp.getLastEntry(header, page), e[3]
			])
		}

		//edit
		let editButton = page.getByRole('button', {name: 'Edit'});
		await expect(editButton).toBeVisible();
		await editButton.click();

		await editLists(page, sampleListInputs);

		//cancel changes
		let cancelButton = page.getByRole('button', {name:'Discard Changes', exact:true});
		await expect(cancelButton).toBeVisible();
		await cancelButton.click();

		//check if lists remain unchanged
		verifyLists(page, compares)
	});
	test ('confirm editing of lists by adding entries', async ({page}) => {

		//go to faculty record
		await page.goto('/')
		await page.getByText('Dela Cruz, Gabrielle Zach').click() // some random unmodified record

		//edit
		let editButton = page.getByRole('button', {name: 'Edit'});
		await expect(editButton).toBeVisible();
		await editButton.click();

		await editLists(page, sampleListInputs);

		//save changes
		let saveButton = page.getByRole('button', {name:'Save Record', exact:true});
		await expect(saveButton).toBeVisible();
		await saveButton.click();

		let confirmButton = page.getByRole('button', {name: consts.SaveConfirmText, exact:true});
		await expect(confirmButton).toBeVisible();
		await confirmButton.click();

		//check if lists contain new results
		await verifyLists(page, sampleListInputs);

	});
	test ('cancel editing of lists by deleting entries', async ({page}) => {
		//TODO
	});
});

test.describe('editing record under semestral records tab', () => {
	test.use({storageState:consts.AdminConfig});
	let sampleListInputs = consts.semRecsTabListSample();

	/* i am not sure how to test this at its current state
	test('cancelled editing fields', async ({page}) => {

	})
	test('confirmed editing fields', async ({page}) => {

	})
	*/

	test('cancelled editing lists', async ({page}) => {
		//go to faculty record under semestral records tab
		await page.goto('/');
		await page.getByText('Camingao, Ericsson Jake').click(); // some random unmodified record
		await page.getByRole('link', {name: 'Semestral Records', exact: true}).click();

		//get the last of each list
		let compares:consts.testRowTuple[] = []
		for (let e of sampleListInputs) {
			const header = e[0]
			const addButton = e[1]
			compares.push([
				header, addButton, await fieldHelp.getLastEntry(header, page), e[3]
			])
		}

		//edit
		let editButton = page.getByRole('button', {name: 'Edit'});
		await expect(editButton).toBeVisible();
		await editButton.click();

		await editLists(page, sampleListInputs);

		//cancel changes
		let cancelButton = page.getByRole('button', {name:'Discard Changes', exact:true});
		await expect(cancelButton).toBeVisible();
		await cancelButton.click();

		//check if lists remain unchanged
		verifyLists(page, compares)
	});

	test ('confirm editing of lists by adding entries', async ({page}) => {
		//go to faculty record under semestral records tab
		await page.goto('/');
		await page.getByText('Camingao, Ericsson Jake').click(); // some random unmodified record
		await page.getByRole('link', {name: 'Semestral Records', exact: true}).click();

		//go to faculty record
		await page.goto('/')
		await page.getByText('Dela Cruz, Gabrielle Zach').click() // some random unmodified record

		//edit
		let editButton = page.getByRole('button', {name: 'Edit'});
		await expect(editButton).toBeVisible();
		await editButton.click();

		await editLists(page, sampleListInputs);

		//save changes
		let saveButton = page.getByRole('button', {name:'Save Record', exact:true});
		await expect(saveButton).toBeVisible();
		await saveButton.click();

		let confirmButton = page.getByRole('button', {name: consts.SaveConfirmText, exact:true});
		await expect(confirmButton).toBeVisible();
		await confirmButton.click();

		//check if lists contain new results
		await verifyLists(page, sampleListInputs);
	});
	test ('confirm editing of lists by deleting entries', async ({page}) => {
		// TODO
	});
})