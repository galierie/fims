import {type Locator, type Page, test, expect} from '@playwright/test';
import * as testConsts from '../../test-consts';
import * as exportHelp from '../../test-helpers/export-test';

const pathPrefix = 'tests/temp/output_'

async function waitDownload(page:Page, action:() => Promise<void>, path:string = 'tests/temp/output.xlsx') {
	let downProm = page.waitForEvent('download');
	await action();
	let download = await downProm;
	await download.saveAs(path);
}

// should hang here if failed
async function downloadManually(page:Page, pathPrefix:string, buttons:Locator[], format:string) {	
	for (let bi = 0; bi < buttons.length; bi++) {
		let b = buttons[bi];
		await waitDownload(page, async() => {await b.click(), pathPrefix.concat(`${bi}`, format)});
	}
}

async function tickBox(page:Page, text:string) {
	let cb =  await exportHelp.getCheckbox(page, text);
	await cb.click();
}

async function tickRadio(page:Page, text:string) {
	let radio = await exportHelp.getRadio(page, text);
	await radio.click();
}

async function setRanges(page:Page, startDate:string = 'AY 2025-2026', endDate:string = 'AY 2025-2026', startSem:string = '1st Semester', endSem:string = '2nd Semester') {
	let fromYearBox = await exportHelp.getDateSelects(page, 'From:', 'Choose Academic Year');
	let fromSemBox = await exportHelp.getDateSelects(page, 'From:', 'Choose Semester');
	let toYearBox = await exportHelp.getDateSelects(page, 'To:', 'Choose Academic Year');
	let toSemBox = await exportHelp.getDateSelects(page, 'To:', 'Choose Semester');

	await fromYearBox.click()
	await fromYearBox.getByText('AY 2025-2026').click()

	await toYearBox.click()
	await toYearBox.getByText('AY 2025-2026').click()

	await fromSemBox.click()
	await fromSemBox.getByText('1st Semester').click()

	await toSemBox.click()
	await toSemBox.getByText('2nd Semester').click()		
};

async function selectRecords(page:Page, recs:string[]) {
	for (let rec of recs) {
		let cb = page.locator('a', {hasText: rec}).last().locator('..').getByRole('checkbox').first()
		await expect(cb).toBeVisible();
		await cb.click();
	}
}

test.describe('ui validation', async () => {
	test.use({storageState: testConsts.AdminConfig})
	// check if ui elements are visible
	test('checking ui', async ({page}) => {
		await page.goto('/')

		await selectRecords(page, [
			'Camingao, Ericsson Jake',
			'Maricris, Mandario',
		]);

		let firstButton = await exportHelp.getExportRecords(page);
		await firstButton.click()

		for (let option of exportHelp.dateRanges) {
			let yearBox = await exportHelp.getDateSelects(page, option, 'Choose Academic Year');
			let semBox = await exportHelp.getDateSelects(page, option, 'Choose Semester');

			for (let yearOption of exportHelp.acadYears)
				await expect(yearBox.getByText(yearOption)).toBeVisible();

			for (let semOption of exportHelp.sems)
				await expect(semBox.getByText(semOption)).toBeVisible();
		}

		let exportButton = await exportHelp.getExportButton(page);
		await exportHelp.getCancel(page);

		await exportButton.click()

		await expect(page.getByRole('button', {name: 'Download All'})).toBeVisible()
		let downloadButtons = await page.getByRole('button', {name: 'Download'}).all()
		expect(downloadButtons.length).toBe(2); // two records selected

		let closeButton = page.getByRole('button', {name: 'Close'});
		await expect(closeButton).toBeVisible();
		await closeButton.click();
	})
});

// note: just downloads the files
// checking file contents itself is too finnicky and tedious atm
test.describe('faculty file tests', async () => {
	test.use({storageState: testConsts.AdminConfig})

	test('faculty profile', async ({page}) => {
		await page.goto('/')
		await selectRecords(page, ['Dela Cruz, Gabrielle Zach']);

		let firstButton = await exportHelp.getExportRecords(page);
		await firstButton.click()


		await setRanges(page);
		await tickBox(page, 'Faculty Profile');
		
		await (await exportHelp.getExportButton(page)).click()
		await downloadManually(page, pathPrefix, await page.getByRole('button', {name: 'Download'}).all(), '.xlsx');
	});

	test('fauclty service record', async ({page}) => {
		await page.goto('/')
		await selectRecords(page, ['Dela Cruz, Gabrielle Zach']);

		let firstButton = await exportHelp.getExportRecords(page);
		await firstButton.click()


		await setRanges(page);
		await tickBox(page, 'Faculty Service Record');
		
		await (await exportHelp.getExportButton(page)).click()
		await downloadManually(page, pathPrefix, await page.getByRole('button', {name: 'Download'}).all(), '.xlsx');
	});


	test('faculty loading', async ({page}) => {
		await page.goto('/')
		await selectRecords(page, ['Dela Cruz, Gabrielle Zach']);

		let firstButton = await exportHelp.getExportRecords(page);
		await firstButton.click()


		await setRanges(page);
		await tickBox(page, 'Faculty Loading');
		
		await (await exportHelp.getExportButton(page)).click()
		await downloadManually(page, pathPrefix, await page.getByRole('button', {name: 'Download'}).all(), '.xlsx');
	});

	test('faculty set avg.', async ({page}) => {
		await page.goto('/')
		await selectRecords(page, ['Dela Cruz, Gabrielle Zach']);

		let firstButton = await exportHelp.getExportRecords(page);
		await firstButton.click()


		await setRanges(page);
		await tickBox(page, 'Faculty SET Average');
		
		await (await exportHelp.getExportButton(page)).click()
		await downloadManually(page, pathPrefix, await page.getByRole('button', {name: 'Download'}).all(), '.xlsx');
	});

	test('aggregate downloads', async ({page}) => {
		await page.goto('/')
		await selectRecords(page, ['Dela Cruz, Gabrielle Zach', 'Camingao, Ericsson Jake B.']);

		let firstButton = await exportHelp.getExportRecords(page);
		await firstButton.click()

		await setRanges(page);
		await tickBox(page, 'Faculty Profiles');
		await tickBox(page, 'Faculty Service Record');
		await tickBox(page, 'Faculty Loading');
		await tickBox(page, 'Faculty SET Average');

		let aggregateBox = page.getByLabel('Aggregate Selected Reports into One File?').getByRole('checkbox').first()
		await expect(aggregateBox).toBeVisible()
		await aggregateBox.click()

		await (await exportHelp.getExportButton(page)).click()
		let downloadButtons = await page.getByRole('button', {name: 'Download'}).all()
		expect(downloadButtons.length).toBe(1) // aggregate, should only be one file
		await downloadManually(page, pathPrefix, downloadButtons, '.xlsx');
	});
});


test.describe('course tests', async () => {
	test.use({storageState: testConsts.AdminConfig});
	test('by faculty - subject taught', async ({page}) => {
		await page.goto('/')
		await selectRecords(page, ['Maricris, Mandario', 'Galinato, Eriene']);

		let firstButton = await exportHelp.getExportRecords(page);
		await firstButton.click()

		await setRanges(page);
		await tickBox(page, 'By Faculty, Subject Taught');
		await tickBox(page, 'By Subject Taught, Faculty');

		await (await exportHelp.getExportButton(page)).click()
		await downloadManually(page, pathPrefix, await page.getByRole('button', {name: 'Download'}).all(), '.xlsx')
	});

	test('aggregate test', async ({page}) => {
		await page.goto('/')
		await selectRecords(page, ['Maricris, Mandario', 'Galinato, Eriene']);

		let firstButton = await exportHelp.getExportRecords(page);
		await firstButton.click()

		await setRanges(page);
		await tickBox(page, 'By Faculty, Subject Taught');
		await tickBox(page, 'By Subject Taught, Faculty');

		let aggregateBox = page.getByLabel('Aggregate Selected Reports into One File?').getByRole('checkbox').last();
		await expect(aggregateBox).toBeVisible()
		await aggregateBox.click()

		await (await exportHelp.getExportButton(page)).click()
		let downloadButtons = await page.getByRole('button', {name: 'Download'}).all()
		expect(downloadButtons.length).toBe(1) // aggregate, should only be one file
		await downloadManually(page, pathPrefix, downloadButtons, '.xlsx');
	});
});

test.describe('csv download', async () => {
	test.use({storageState: testConsts.AdminConfig});

	// just check if you can download with csv
	test('test', async ({page}) => {
		await page.goto('/')
		await selectRecords(page, ['Dela Cruz, Gabrielle Zach']);

		let firstButton = await exportHelp.getExportRecords(page);
		await firstButton.click()


		await setRanges(page);
		await tickBox(page, 'Faculty Profile');
		
		await tickRadio(page, 'CSV');
		
		await (await exportHelp.getExportButton(page)).click()
		await downloadManually(page, pathPrefix, await page.getByRole('button', {name: 'Download'}).all(), '.xlsx');
	});
});