<script lang="ts">
    import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';
    import Icon from '@iconify/svelte';
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';

    import Field from './Field.svelte';
    import GreenButton from '$lib/ui/GreenButton.svelte';
    import InputTable from './InputTable.svelte';
    import LoadingScreen from '$lib/ui/LoadingScreen.svelte';
    import RedButton from '$lib/ui/RedButton.svelte';
    import DeleteConfirmation from '$lib/ui/DeleteConfirmation.svelte';

    import type { FacultyProfileRecordDTO } from '$lib/server/queries/faculty-view.js';
    import type { InputColumnType, InputRowValue } from '$lib/types/input-table.js';

    import { viewState, setToEdit, resetViewState } from '../states/view-state.svelte.js';

    interface Props {
        profile?: FacultyProfileRecordDTO;
        opts?: Map<string, Array<string>>;
        dependencyMaps?: Map<string, Map<string, string>>;
        isCreating?: boolean;
    }

    const { profile, opts, dependencyMaps, isCreating }: Props = $props();

    function toDateString(dateObj: Date | string | null | undefined): string | undefined {
        if (!dateObj) return undefined;
        const d = new Date(dateObj);
        if (isNaN(d.getTime())) return undefined;

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    // Check for changes
    const haveChanges: boolean[] = $state(Array(6).fill(false));
    const hasChange = $derived(haveChanges.some((e) => e === true));

    $effect(() => {
        console.log(`Ping from ProfileForm! hasChange = ${hasChange}`);
    });

    // Set to edit agad if isCreating
    $effect(() => {
        if (isCreating) setToEdit();
    });

    const biologicalSexMapToFull: Record<string, string> = {
        M: 'Male',
        F: 'Female',
        I: 'Intersex',
        U: 'Unknown',
    };

    // Input Table Columns
    const emailColumns: InputColumnType[] = [
        {
            label: 'Emails',
            name: 'emails',
            colSpan: 1,
            type: 'email',
        },
    ];

    const emailValues: InputRowValue[] | undefined = $derived(
        profile?.emailAddresses.map(({ tupleid, email }, index) => ({
            rowNum: index,
            row: [{ columnNum: 0, defaultValue: email }],
            tupleid,
        })),
    );

    const contactNumColumns: InputColumnType[] = [
        {
            label: 'Contact Numbers',
            name: 'contact-numbers',
            colSpan: 1,
            type: 'text',
        },
    ];

    const contactNumValues: InputRowValue[] | undefined = $derived(
        profile?.contactNumbers.map(({ tupleid, contactNum }, index) => ({
            rowNum: index,
            row: [{ columnNum: 0, defaultValue: contactNum }],
            tupleid,
        })),
    );

    const homeAddressColumns: InputColumnType[] = [
        {
            label: 'Home Addresses',
            name: 'home-addresses',
            colSpan: 1,
            type: 'text',
        },
    ];

    const homeAddressValues: InputRowValue[] | undefined = $derived(
        profile?.homeAddresses.map(({ tupleid, homeAddress }, index) => ({
            rowNum: index,
            row: [{ columnNum: 0, defaultValue: homeAddress }],
            tupleid,
        })),
    );

    const educationalAttainmentColumns: InputColumnType[] = [
        {
            label: 'Degree',
            name: 'educational-attainment-degree',
            colSpan: 2,
            type: 'text',
        },
        {
            label: 'Institution',
            name: 'educational-attainment-institution',
            colSpan: 2,
            type: 'text',
        },
        {
            label: 'Year',
            name: 'educational-attainment-gradyear',
            colSpan: 1,
            type: 'number',
        },
    ];

    const educationalAttainmentValues: InputRowValue[] | undefined = $derived(
        profile?.educationalAttainments.map(
            ({ tupleid, degree, institution, graduationYear }, index) => ({
                rowNum: index,
                row: [
                    { columnNum: 0, defaultValue: degree },
                    { columnNum: 1, defaultValue: institution },
                    { columnNum: 2, defaultValue: graduationYear?.toString() ?? undefined },
                ],
                tupleid,
            }),
        ),
    );

    const fieldsOfInterest = $derived(opts?.get('fieldsOfInterest'));
    const fieldOfInterestColumns: InputColumnType[] = $derived([
        {
            label: 'Fields of Interest',
            name: 'fields-of-interest',
            colSpan: 1,
            type: 'datalist',
            opts: fieldsOfInterest,
            isRequired: true,
        },
    ]);

    const fieldOfInterestValues: InputRowValue[] | undefined = $derived(
        profile?.fieldsOfInterest.map(({ tupleid, field }, index) => ({
            rowNum: index,
            row: [{ columnNum: 0, defaultValue: field ?? undefined }],
            tupleid,
        })),
    );

    const rankTitles = $derived(opts?.get('rankTitles'));
    const rankTitlesToSalaryGrades = $derived(dependencyMaps?.get('rankTitlesToSalaryGrades'));
    const rankTitlesToSalaryRates = $derived(dependencyMaps?.get('rankTitlesToSalaryRates'));
    const appointmentStatuses = $derived(opts?.get('appointmentStatuses'));
    const promotionHistoryColumns: InputColumnType[] = $derived([
        {
            label: 'Rank of Renewal/Tenure',
            name: 'promotion-history-rank',
            colSpan: 2,
            type: 'dropdown',
            opts: rankTitles,
        },
        {
            label: 'Salary Grade',
            name: 'promotion-history-salary-grade',
            colSpan: 1,
            type: 'dependent',
            dependentOn: 0,
            dependencyMap: rankTitlesToSalaryGrades,
        },
        {
            label: 'Salary Rate (PHP/annum)',
            name: 'promotion-history-salary-rate',
            colSpan: 2,
            type: 'dependent',
            dependentOn: 0,
            dependencyMap: rankTitlesToSalaryRates,
        },
        {
            label: 'Appointment Status',
            name: 'promotion-history-appointment-status',
            colSpan: 2,
            type: 'dropdown',
            opts: appointmentStatuses,
            isRequired: true,
        },
        {
            label: 'Date of Tenure/Renewal',
            name: 'promotion-history-date',
            colSpan: 2,
            type: 'date',
            isRequired: true,
        },
    ]);

    const promotionHistoryValues: InputRowValue[] | undefined = $derived(
        profile?.promotionHistory.map(
            ({ tupleid, rankTitle, appointmentStatus, dateOfTenureOrRenewal }, index) => ({
                rowNum: index,
                row: [
                    { columnNum: 0, defaultValue: rankTitle ?? undefined },
                    { columnNum: 1 },
                    { columnNum: 2 },
                    { columnNum: 3, defaultValue: appointmentStatus ?? undefined },
                    { columnNum: 4, defaultValue: toDateString(dateOfTenureOrRenewal) },
                ],
                tupleid,
            }),
        ),
    );

    let isLoading = $state(false);
    let willDiscardChanges = $state(false);

    let profileForm: HTMLFormElement | null = null;
    const profileFormId = 'profile-form';

    // Handle tab exit with unsaved changes
    function beforeExit(event: BeforeUnloadEvent) {
        if (viewState.isEditing && hasChange) event.preventDefault();
    }

    onMount(() => {
        if (browser) window.addEventListener('beforeunload', beforeExit);

        return () => {
            if (browser) window.removeEventListener('beforeunload', beforeExit);
        };
    });
</script>

<form
    method="POST"
    action="?/{isCreating ? 'create' : 'update'}"
    onreset={() => {
        resetViewState();
        willDiscardChanges = false;
    }}
    id={profileFormId}
    bind:this={profileForm}
    use:enhance={() => {
        isLoading = true;
        return async ({ update, result }) => {
            await update({ reset: false });
            isLoading = false;

            if (result.type === 'success' || result.type === 'redirect') {
                if (!isCreating) resetViewState();
            } else {
                alert('Failed to save!');
            }
        };
    }}
>
    <div class="flex items-center gap-2">
        {#if viewState.isEditing}
            <GreenButton
                type="button"
                onclick={() => {
                    if (profileForm) profileForm.requestSubmit();
                }}
            >
                <Icon icon="tabler:device-floppy" class="mr-2 h-5 w-5" />
                <span>Save Record</span>
            </GreenButton>

            {#if !isCreating}
                <RedButton
                    type="button"
                    onclick={() => {
                        if (profileForm)
                            if (hasChange) willDiscardChanges = true;
                            else profileForm.reset();
                    }}
                >
                    <Icon icon="tabler:database-off" class="mr-2 h-5 w-5" />
                    <span>Discard Changes</span>
                </RedButton>
            {:else}
                <RedButton
                    type="button"
                    onclick={() => {
                        willDiscardChanges = true;
                    }}
                >
                    <span>Cancel</span>
                </RedButton>
            {/if}
        {:else if !isCreating}
            <GreenButton type="button" onclick={setToEdit}>
                <Icon icon="tabler:edit" class="mr-2 h-5 w-5" />
                <span>Edit</span>
            </GreenButton>
        {/if}
    </div>

    <div>
        <div class="mt-4 grid w-full grid-cols-4">
            <Field
                label="Last Name"
                name="last-name"
                defaultValue={profile?.lastName}
                required={true}
            />
            <Field
                label="First Name"
                name="first-name"
                defaultValue={profile?.firstName}
                required={true}
            />
            <Field
                label="Middle Name"
                name="middle-name"
                defaultValue={profile?.middleName}
                required={true}
            />
            <Field label="Suffix" name="suffix" defaultValue={profile?.suffix ?? undefined} />
        </div>
        <div class="mt-4 grid w-full grid-cols-4">
            <Field
                label="Birth Date"
                name="birth-date"
                type="date"
                defaultValue={toDateString(profile?.birthDate)}
                required={true}
            />
            <Field
                label="Biological Sex"
                name="biological-sex"
                type="dropdown"
                opts={['Male', 'Female', 'Intersex', 'Unknown']}
                defaultValue={profile?.biologicalSex
                    ? biologicalSexMapToFull[profile.biologicalSex]
                    : ''}
                required={true}
            />
            <Field
                label="Maiden Name"
                name="maiden-name"
                defaultValue={profile?.maidenName ?? undefined}
            />
        </div>

        <div class="mt-4 grid w-full grid-cols-4">
            <InputTable
                tableName="emails"
                rowLabel="Email"
                columns={emailColumns}
                rows={emailValues ?? []}
                numOfColumns={1}
                bind:hasChange={haveChanges[0]}
            />
            <InputTable
                tableName="contact-numbers"
                rowLabel="Contact Number"
                columns={contactNumColumns}
                rows={contactNumValues ?? []}
                numOfColumns={1}
                bind:hasChange={haveChanges[1]}
            />
            <InputTable
                tableName="home-addresses"
                rowLabel="Home Address"
                columns={homeAddressColumns}
                rows={homeAddressValues ?? []}
                numOfColumns={1}
                colSpan={2}
                bind:hasChange={haveChanges[2]}
            />
        </div>

        <p class="mt-4 px-4 font-semibold">Educational Attainment</p>
        <div class="mt-4 grid w-full grid-cols-4">
            <InputTable
                tableName="educational-attainments"
                rowLabel="Educational Attainment"
                columns={educationalAttainmentColumns}
                rows={educationalAttainmentValues ?? []}
                numOfColumns={5}
                colSpan={2}
                bind:hasChange={haveChanges[3]}
            />
            <InputTable
                tableName="fields-of-interest"
                rowLabel="Fields of Interest"
                columns={fieldOfInterestColumns}
                rows={fieldOfInterestValues ?? []}
                numOfColumns={1}
                bind:hasChange={haveChanges[4]}
            />
        </div>

        <div class="mt-4 grid w-full grid-cols-4">
            <Field
                label="PhilHealth No."
                name="philhealth"
                immutable={!isCreating}
                defaultValue={profile?.philhealth}
                required={true}
            />
            <Field
                label="Pag-IBIG No."
                name="pagibig"
                immutable={!isCreating}
                defaultValue={profile?.pagibig}
                required={true}
            />
            <Field
                label="PSI Item No."
                name="psi-item"
                immutable={!isCreating}
                defaultValue={profile?.psiItem}
                required={true}
            />
        </div>
        <div class="mt-4 grid w-full grid-cols-4">
            <Field
                label="TIN"
                name="tin"
                immutable={!isCreating}
                defaultValue={profile?.tin}
                required={true}
            />
            <Field
                label="GSIS BP No."
                name="gsis"
                immutable={!isCreating}
                defaultValue={profile?.gsis}
                required={true}
            />
            <Field
                label="Employee No."
                name="employee-number"
                immutable={!isCreating}
                defaultValue={profile?.employeeNumber}
                required={true}
            />
        </div>
        <div class="mt-4 grid w-full grid-cols-4">
            <Field
                label="Status"
                name="status"
                type="dropdown"
                opts={['Active', 'On Leave', 'Sabbatical', 'On Secondment']}
                defaultValue={profile?.status ?? ''}
            />
            <Field
                label="Date of Original Appointment"
                name="date-of-original-appointment"
                type="date"
                colSpan={2}
                defaultValue={toDateString(profile?.dateOfOriginalAppointment)}
                required={true}
            />
        </div>

        <p class="mt-6 px-4 font-semibold">Promotion History</p>
        <div class="mt-4 grid w-full grid-cols-11">
            <InputTable
                tableName="promotion-history"
                rowLabel="Promotion"
                columns={promotionHistoryColumns}
                rows={promotionHistoryValues ?? []}
                numOfColumns={9}
                colSpan={9}
                bind:hasChange={haveChanges[5]}
            />
        </div>

        <div class="mt-8.5">
            <label for="remarks">
                <span>Remarks</span>
            </label>
            <textarea
                name="remarks"
                id="remarks"
                class="mt-4 h-fit min-h-90 w-full rounded-2xl border-0 bg-white p-1.5 placeholder-fims-gray focus:ring-0"
                disabled={!viewState.isEditing}
                defaultValue={profile?.remarks ?? ''}
            ></textarea>
        </div>
    </div>
</form>

{#if isLoading}
    <LoadingScreen />
{/if}

{#if willDiscardChanges}
    <DeleteConfirmation
        onDelete={async () => {
            willDiscardChanges = false;
            if (profileForm) profileForm.reset();

            if (isCreating) {
                isLoading = true;
                await goto('/');
            }
        }}
        onCancel={() => {
            willDiscardChanges = false;
        }}
        text="Are you sure you want to cancel creating this record?"
    />
{/if}
