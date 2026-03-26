import {test, expect} from '@playwright/test';
import * as exportHelp from '../../test-helpers/export-test';

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
		let downProm = page.waitForEvent('download');
		await expButton.click();
		let download = await downProm;

		await download.saveAs('tests/temp/output.xlsx');


		let cancel = await exportHelp.getCancel(page);
		await cancel.click()
	})
});

test.describe('export tests', async () => {
	test('faculty export', async ({page}) => {

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

		await fromYearBox.getByText('AY 2025-2026').click()
	});
});