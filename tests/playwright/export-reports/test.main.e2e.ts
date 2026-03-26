import {type Page, test, expect} from '@playwright/test';
import * as exportHelp from '../../test-helpers/export-test';

async function waitDownload(page:Page, action:() => Promise<void>) {
	let downProm = page.waitForEvent('download');
	await action();
	let download = await downProm;
	await download.saveAs('tests/temp/output.xlsx');
}

test.describe('ui validation', async () => {
	// check if ui elements are visible
	test('checking ui', async ({page}) => {
		await page.goto('/')
		let cb = page.locator('a', {hasText: "Dela Cruz, Gabrielle Zach"}).last().locator('..').getByRole('checkbox').first()
		await expect(cb).toBeVisible();

		await cb.click()
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


		let expButton = await exportHelp.getExportButton(page);
		await expButton.click();
		await waitDownload(page, async () => {await expButton.click()});

		let cancel = await exportHelp.getCancel(page);
		await cancel.click()
	})
});

test.describe('export tests', async () => {
	test('faculty profile', async ({page}) => {

		await page.goto('/')
		let cb = page.locator('a', {hasText: "Dela Cruz, Gabrielle Zach"}).last().locator('..').getByRole('checkbox').first()
		await expect(cb).toBeVisible();

		await cb.click()
		let firstButton = await exportHelp.getExportRecords(page);
		await firstButton.click()

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



	});

	test('fauclty service record', async ({page}) => {

	})

	test('')
});