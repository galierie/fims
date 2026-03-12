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


async function editProfileLists(page:Page) {

}
async function verifyProfileLists(page:Page) {

}

async function editSemReceLists(page:Page) {

}
async function verifySemRecLists(page:Page) {

}

test.describe('editing record under profile tab', () => {
	test.use({storageState:consts.AdminConfig});
	let sampleInputs = consts.getFieldTest();

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

	});
	test ('confirm editing of lists by adding entries', async ({page}) => {

	});
	test ('confirm editing of lists by deleting entries', async ({page}) => {

	});
	test('confirm deletion of list entry', async ({page}) => {

	});
});

test.describe('editing record under semestral records tab', () => {
	test.use({storageState:consts.AdminConfig});
	/* i am not sure how to test this at its current state
	test('cancelled editing fields', async ({page}) => {

	})
	test('confirmed editing fields', async ({page}) => {

	})
	*/

	test('cancelled editing lists', async ({page}) => {

	});
	test ('confirm editing of lists by adding entries', async ({page}) => {

	});
	test ('confirm editing of lists by deleting entries', async ({page}) => {

	});
	test('confirm deletion of list entry', async ({page}) => {

	});	
})