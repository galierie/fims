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

		for (let checkbox of exportHelp.checkboxOptions)
			await exportHelp.getCheckbox(page, checkbox);

		for (let radio of exportHelp.exportOptions)
			await exportHelp.getRadio(page, radio);


		await exportHelp.getExportButton(page);

		let cancel = await exportHelp.getCancel(page);
		await cancel.click()
	})
});