import { expect, test } from '@playwright/test';

test.describe('faculty record', () => {
    test.use({ storageState: 'playwright/.auth/it.json' });
    test.describe.configure({ mode: 'parallel' });

    test.describe('it', () => {
        test.describe('profile', () => {
            test('cancel', async ({ page }) => {
                // No redirection since user is logged-in
                await page.goto('/');
                await expect(page).toHaveURL('/');

                // Click Add Record
                await page.getByRole('button', { name: 'Add record' }).first().click();
                await expect(page).toHaveURL('/faculty/create');

                // Fill form
                await page.getByLabel('Last Name *', { exact: true }).first().fill('lastName');
                await page.getByLabel('First Name *', { exact: true }).first().fill('firstName');
                await page.getByLabel('Middle Name *', { exact: true }).first().fill('middleName');
                await page.getByLabel('Birth Date *', { exact: true }).first().fill('2004-01-20');
                await page
                    .getByLabel('PhilHealth No. *', { exact: true })
                    .first()
                    .fill('random-id');
                await page.getByLabel('Pag-IBIG No. *', { exact: true }).first().fill('random-id');
                await page.getByLabel('PSI Item No. *', { exact: true }).first().fill('random-id');
                await page.getByLabel('TIN *', { exact: true }).first().fill('random-id');
                await page.getByLabel('GSIS BP No. *', { exact: true }).first().fill('random-id');
                await page.getByLabel('Employee No. *', { exact: true }).first().fill('random-id');
                await page
                    .getByLabel('Date of Original Appointment *', { exact: true })
                    .first()
                    .fill('2026-04-30');
                await page.getByLabel('Remarks', { exact: true }).first().fill('random remark');

                await page.getByLabel('Biological Sex *').first().selectOption({ label: 'Male' });
                await page.getByLabel('Status').first().selectOption({ label: 'Active' });

                await page
                    .getByRole('button', { name: '+ Add Email', exact: true })
                    .first()
                    .click();
                await page
                    .getByRole('button', { name: '+ Add Contact Number', exact: true })
                    .first()
                    .click();
                await page
                    .getByRole('button', { name: '+ Add Home Address', exact: true })
                    .first()
                    .click();
                await page
                    .getByRole('button', { name: '+ Add Educational Attainment', exact: true })
                    .first()
                    .click();
                await page
                    .getByRole('button', { name: '+ Add Fields of Interest', exact: true })
                    .first()
                    .click();
                await page
                    .getByRole('button', { name: '+ Add Promotion', exact: true })
                    .first()
                    .click();

                await page.locator('[name="0[emails]"]').first().fill('random@gmail.com');
                await page.locator('[name="0[contact-numbers]"]').first().fill('09236542864');
                await page
                    .locator('[name="0[home-addresses]"]')
                    .first()
                    .fill('somewhere in a far off place');
                await page
                    .locator('[name="0[educational-attainment-degree]"]')
                    .first()
                    .fill('Bachelor of Science in Computer Science');
                await page
                    .locator('[name="0[educational-attainment-institution]"]')
                    .first()
                    .fill('University of the Philippines - Diliman');
                await page
                    .locator('[name="0[educational-attainment-gradyear]"]')
                    .first()
                    .fill('2025');

                await page
                    .getByTestId('0[fields-of-interest]-combobox')
                    .first()
                    .fill('Software Engineering');
                await page.getByTestId('0[promotion-history-rank]').click();
                await page
                    .getByRole('button', { name: 'Instructor 1', exact: true })
                    .first()
                    .click();
                await page.getByTestId('0[promotion-history-appointment-status]').click();
                await page.getByRole('button', { name: 'Part-Time', exact: true }).first().click();
                await page.locator('[name="0[promotion-history-date]"]').first().fill('2026-04-30');

                // Cancel
                await page.getByRole('button', { name: 'Cancel', exact: true }).first().click();
                await page.getByRole('button', { name: 'Keep', exact: true }).first().click();
                await page.getByRole('button', { name: 'Cancel', exact: true }).first().click();
                await page.getByRole('button', { name: 'Discard', exact: true }).first().click();

                await expect(page).toHaveURL('/');
            });

            test('create and delete', async ({ page }) => {
                // No redirection since user is logged-in
                await page.goto('/');
                await expect(page).toHaveURL('/');

                // Click Add Record
                await page.getByRole('button', { name: 'Add record' }).first().click();
                await expect(page).toHaveURL('/faculty/create');

                // Fill form
                await page.getByLabel('Last Name *', { exact: true }).first().fill('lastName');
                await page.getByLabel('First Name *', { exact: true }).first().fill('firstName');
                await page.getByLabel('Middle Name *', { exact: true }).first().fill('middleName');
                await page.getByLabel('Birth Date *', { exact: true }).first().fill('2004-01-20');
                await page
                    .getByLabel('PhilHealth No. *', { exact: true })
                    .first()
                    .fill('random-id');
                await page.getByLabel('Pag-IBIG No. *', { exact: true }).first().fill('random-id');
                await page.getByLabel('PSI Item No. *', { exact: true }).first().fill('random-id');
                await page.getByLabel('TIN *', { exact: true }).first().fill('random-id');
                await page.getByLabel('GSIS BP No. *', { exact: true }).first().fill('random-id');
                await page.getByLabel('Employee No. *', { exact: true }).first().fill('random-id');
                await page
                    .getByLabel('Date of Original Appointment *', { exact: true })
                    .first()
                    .fill('2026-04-30');
                await page.getByLabel('Remarks', { exact: true }).first().fill('random remark');

                await page.getByLabel('Biological Sex *').first().selectOption({ label: 'Male' });
                await page.getByLabel('Status').first().selectOption({ label: 'Active' });

                await page
                    .getByRole('button', { name: '+ Add Email', exact: true })
                    .first()
                    .click();
                await page
                    .getByRole('button', { name: '+ Add Contact Number', exact: true })
                    .first()
                    .click();
                await page
                    .getByRole('button', { name: '+ Add Home Address', exact: true })
                    .first()
                    .click();
                await page
                    .getByRole('button', { name: '+ Add Educational Attainment', exact: true })
                    .first()
                    .click();
                await page
                    .getByRole('button', { name: '+ Add Fields of Interest', exact: true })
                    .first()
                    .click();
                await page
                    .getByRole('button', { name: '+ Add Promotion', exact: true })
                    .first()
                    .click();

                await page.locator('[name="0[emails]"]').first().fill('random@gmail.com');
                await page.locator('[name="0[contact-numbers]"]').first().fill('09236542864');
                await page
                    .locator('[name="0[home-addresses]"]')
                    .first()
                    .fill('somewhere in a far off place');
                await page
                    .locator('[name="0[educational-attainment-degree]"]')
                    .first()
                    .fill('Bachelor of Science in Computer Science');
                await page
                    .locator('[name="0[educational-attainment-institution]"]')
                    .first()
                    .fill('University of the Philippines - Diliman');
                await page
                    .locator('[name="0[educational-attainment-gradyear]"]')
                    .first()
                    .fill('2025');

                await page
                    .getByTestId('0[fields-of-interest]-combobox')
                    .first()
                    .fill('Software Engineering');
                await page.getByTestId('0[promotion-history-rank]').click();
                await page
                    .getByRole('button', { name: 'Instructor 1', exact: true })
                    .first()
                    .click();
                await page.getByTestId('0[promotion-history-appointment-status]').click();
                await page.getByRole('button', { name: 'Part-Time', exact: true }).first().click();
                await page.locator('[name="0[promotion-history-date]"]').first().fill('2026-04-30');

                // Create
                await page.getByRole('button', { name: 'Save Record' }).first().click();
                await expect(page.getByText('lastName, firstName').first()).toBeVisible();

                // No redirection since user is logged-in
                await page.goto('/');
                await expect(page).toHaveURL('/');

                // Go to faculty profile
                await expect(page.getByText('lastName, firstName').first()).toBeVisible();
                await page.getByText('lastName, firstName').first().click();
                await expect(page.getByText('lastName, firstName').first()).toBeVisible();

                // Delete
                await page.getByRole('button', { name: 'Delete Record' }).first().click();
                await page.getByRole('button', { name: 'Delete', exact: true }).first().click();

                await expect(page).toHaveURL('/');
                await expect(page.getByText('lastName, firstName')).not.toBeVisible();
            });

            test('edit', async ({ page }) => {
                // No redirection since user is logged-in
                await page.goto('/');
                await expect(page).toHaveURL('/');

                // Go to faculty profile
                await expect(page.getByText('Galinato, Eriene').first()).toBeVisible();
                await page.getByText('Galinato, Eriene').first().click();
                await expect(page.getByText('Galinato, Eriene').first()).toBeVisible();

                // Edit
                await page.getByRole('button', { name: 'Edit' }).first().click();

                await page.getByLabel('Status').first().selectOption({ label: 'Sabbatical' });

                await page
                    .getByRole('button', { name: '+ Add Promotion', exact: true })
                    .first()
                    .click();
                await page.getByTestId('0[promotion-history-rank]').click();
                await page
                    .getByRole('button', { name: 'Instructor 2', exact: true })
                    .first()
                    .click();
                await page.getByTestId('0[promotion-history-appointment-status]').click();
                await page.getByRole('button', { name: 'Part-Time', exact: true }).first().click();
                await page.locator('[name="0[promotion-history-date]"]').first().fill('2026-05-07');

                await page.getByRole('button', { name: 'Save Record' }).first().click();

                // Check if I can go back
                await page
                    .getByRole('link', { name: 'Back to List of Faculty Records' })
                    .first()
                    .click();
                await expect(page).toHaveURL('/');

                // Go to faculty profile again
                await expect(page.getByText('Galinato, Eriene').first()).toBeVisible();
                await page.getByText('Galinato, Eriene').first().click();
                await expect(page.getByText('Galinato, Eriene').first()).toBeVisible();

                // Check new values
                await expect(page.getByLabel('Status').first()).toHaveValue('Sabbatical');
                await expect(page.getByText('Instructor 2').first()).toBeVisible();
                await expect(page.getByText('15-1').first()).toBeVisible();
            });
        });

        test.describe('semestral record', () => {
            test('create and edit', async ({ page }) => {
                // No redirection since user is logged-in
                await page.goto('/');
                await expect(page).toHaveURL('/');

                // Go to faculty profile
                await expect(page.getByText('Galinato, Eriene').first()).toBeVisible();
                await page.getByText('Galinato, Eriene').first().click();
                await expect(page.getByText('Galinato, Eriene').first()).toBeVisible();

                // Navigate to Semestral Records Tab
                await page
                    .getByRole('link', { name: 'Semestral Records', exact: true })
                    .first()
                    .click();

                // Create
                await page.getByRole('button', { name: 'Semester: Midyear' }).first().click();
                await page.getByRole('button', { name: '2nd Semester' }).first().click();

                await page
                    .getByRole('button', { name: '+ Add Position', exact: true })
                    .first()
                    .click();
                await page
                    .getByRole('button', { name: '+ Add Committee Membership', exact: true })
                    .first()
                    .click();
                await page
                    .getByRole('button', { name: '+ Add Administrative Work', exact: true })
                    .first()
                    .click();
                await page
                    .getByRole('button', { name: '+ Add Class', exact: true })
                    .first()
                    .click();
                await page
                    .getByRole('button', { name: '+ Add Mentee', exact: true })
                    .first()
                    .click();
                await page
                    .getByRole('button', {
                        name: '+ Add Research/Textbook Writing/Creative Work',
                        exact: true,
                    })
                    .first()
                    .click();
                await page
                    .getByRole('button', {
                        name: '+ Add Extension Work/Community Service',
                        exact: true,
                    })
                    .first()
                    .click();
                await page
                    .getByRole('button', { name: '+ Add Degree Program', exact: true })
                    .first()
                    .click();

                // Administrative Positions
                await page.getByTestId('0[administrative-position-title]').click();
                await page
                    .getByRole('button', { name: 'Department Head', exact: true })
                    .first()
                    .click();
                await page.getByTestId('0[administrative-position-office]').click();
                await page
                    .getByRole('button', { name: 'Test Office', exact: true })
                    .first()
                    .click();
                await page
                    .locator('[name="0[administrative-position-start-date]"]')
                    .first()
                    .fill('2026-04-30');
                await page
                    .locator('[name="0[administrative-position-end-date]"]')
                    .first()
                    .fill('2026-05-07');
                await page
                    .locator('[name="0[administrative-position-load-credit]"]')
                    .first()
                    .fill('3.00');

                // Committee Memberships
                await page
                    .locator('[name="0[committee-membership-nature]"]')
                    .first()
                    .fill('Deputy Director for Engineering');
                await page
                    .locator('[name="0[committee-membership-committee]"]')
                    .first()
                    .fill('Engineering');
                await page
                    .locator('[name="0[committee-membership-start-date]"]')
                    .first()
                    .fill('2026-04-30');
                await page
                    .locator('[name="0[committee-membership-end-date]"]')
                    .first()
                    .fill('2026-05-07');
                await page
                    .locator('[name="0[committee-membership-load-credit]"]')
                    .first()
                    .fill('3.00');

                // Administrative Work
                await page
                    .locator('[name="0[administrative-work-nature]"]')
                    .first()
                    .fill('Externals Officer');
                await page.getByTestId('0[administrative-work-committee]').click();
                await page
                    .getByRole('button', { name: 'Test Office', exact: true })
                    .first()
                    .click();
                await page
                    .locator('[name="0[administrative-work-start-date]"]')
                    .first()
                    .fill('2026-04-30');
                await page
                    .locator('[name="0[administrative-work-end-date]"]')
                    .first()
                    .fill('2026-05-07');
                await page
                    .locator('[name="0[administrative-work-load-credit]"]')
                    .first()
                    .fill('3.00');

                // Classes Taught
                await page.getByTestId('0[course-title]').click();
                await page.getByRole('button', { name: 'Econ 11', exact: true }).first().click();
                await page.locator('[name="0[course-section]"]').first().fill('WFX');
                await page.locator('[name="0[course-num-of-students]"]').first().fill('30');
                await page.locator('[name="0[course-load-credit]"]').first().fill('3.00');
                await page.locator('[name="0[course-section-set]"]').first().fill('4.732');

                // Mentoring
                await page.locator('[name="0[mentee-lastname]"]').first().fill('Rizzler');
                await page.locator('[name="0[mentee-firstname]"]').first().fill('Skibidiah');
                await page.locator('[name="0[mentee-middlename]"]').first().fill('Ohio');
                await page.locator('[name="0[mentee-category]"]').first().fill('Engineering');
                await page.locator('[name="0[mentee-start-date]"]').first().fill('2026-04-30');
                await page.locator('[name="0[mentee-end-date]"]').first().fill('2026-05-07');
                await page.locator('[name="0[mentee-remarks]"]').first().fill('wide language gap');

                // Research/Textbook Writing/Creative Work
                await page.getByTestId('0[research-title]').click();
                await page
                    .getByRole('button', { name: 'Project NOAH', exact: true })
                    .first()
                    .click();
                await page.locator('[name="0[research-load-credit]"]').first().fill('3.00');

                // Committee Memberships
                await page.locator('[name="0[extension-nature]"]').first().fill('taga-urong');
                await page.locator('[name="0[extension-agency]"]').first().fill('sa bahay');
                await page.locator('[name="0[extension-start-date]"]').first().fill('2026-04-30');
                await page.locator('[name="0[extension-end-date]"]').first().fill('2026-05-07');
                await page.locator('[name="0[extension-load-credit]"]').first().fill('3.00');

                // Study Load
                await page
                    .locator('[name="0[study-load-degree]"]')
                    .first()
                    .fill('Master of Science in Computer Science');
                await page
                    .locator('[name="0[study-load-university]"]')
                    .first()
                    .fill('University of the Philippines - Diliman');
                await page.locator('[name="0[study-load-units]"]').first().fill('3.00');
                await page
                    .locator('[name="0[study-load-on-leave-with-pay]"]')
                    .first()
                    .setChecked(true);
                await page
                    .locator('[name="0[study-load-fellowship-recipient]"]')
                    .first()
                    .setChecked(false);
                await page.locator('[name="0[study-load-credit]"]').first().fill('3.00');

                // Discard but keep
                await page.getByRole('button', { name: 'Discard Changes' }).first().click();
                await page.getByRole('button', { name: 'Keep', exact: true }).first().click();

                // Save
                await page.getByRole('button', { name: 'Save Record' }).first().click();

                // Check if I can go back
                await page
                    .getByRole('link', { name: 'Back to List of Faculty Records' })
                    .first()
                    .click();
                await expect(page).toHaveURL('/');

                // Go to faculty profile again
                await expect(page.getByText('Galinato, Eriene').first()).toBeVisible();
                await page.getByText('Galinato, Eriene').first().click();
                await expect(page.getByText('Galinato, Eriene').first()).toBeVisible();

                // Navigate to Semestral Records Tab
                await page
                    .getByRole('link', { name: 'Semestral Records', exact: true })
                    .first()
                    .click();
                // Selected academic year and semester number is saved

                await expect(
                    page.getByText('Department Head', { exact: true }).first(),
                ).toBeVisible();
                await expect(
                    page.locator('[name="0[committee-membership-nature]"]').first(),
                ).toHaveValue('Deputy Director for Engineering');
                await expect(
                    page.locator('[name="0[administrative-work-nature]"]').first(),
                ).toHaveValue('Externals Officer');
                await expect(page.getByText('Econ 11', { exact: true }).first()).toBeVisible();
                await expect(page.locator('[name="0[mentee-lastname]"]').first()).toHaveValue(
                    'Rizzler',
                );
                await expect(page.locator('[name="0[mentee-firstname]"]').first()).toHaveValue(
                    'Skibidiah',
                );
                await expect(page.locator('[name="0[mentee-middlename]"]').first()).toHaveValue(
                    'Ohio',
                );
                await expect(page.getByText('Project NOAH', { exact: true }).first()).toBeVisible();
                await expect(page.locator('[name="0[extension-nature]"]').first()).toHaveValue(
                    'taga-urong',
                );
                await expect(page.locator('[name="0[extension-agency]"]').first()).toHaveValue(
                    'sa bahay',
                );
                await expect(page.locator('[name="0[study-load-degree]"]').first()).toHaveValue(
                    'Master of Science in Computer Science',
                );
                await expect(page.locator('[name="0[study-load-university]"]').first()).toHaveValue(
                    'University of the Philippines - Diliman',
                );

                // Edit
                await page.getByRole('button', { name: 'Edit' }).first().click();

                await page.getByTestId('0[research-title]').click();
                await page
                    .getByRole('button', { name: 'Project BUHAY', exact: true })
                    .first()
                    .click();

                // Save
                await page.getByRole('button', { name: 'Save Record' }).first().click();

                // Check if I can go back
                await page
                    .getByRole('link', { name: 'Back to List of Faculty Records' })
                    .first()
                    .click();
                await expect(page).toHaveURL('/');

                // Go to faculty profile again
                await expect(page.getByText('Galinato, Eriene').first()).toBeVisible();
                await page.getByText('Galinato, Eriene').first().click();
                await expect(page.getByText('Galinato, Eriene').first()).toBeVisible();

                // Navigate to Semestral Records Tab
                await page
                    .getByRole('link', { name: 'Semestral Records', exact: true })
                    .first()
                    .click();
                // Selected academic year and semester number is saved

                await expect(
                    page.getByText('Project BUHAY', { exact: true }).first(),
                ).toBeVisible();
            });
        });
    });
});
