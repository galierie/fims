<script lang="ts">
    import { enhance } from "$app/forms";
    import Icon from "@iconify/svelte";

    import Field from "./Field.svelte";
    import GreenButton from "$lib/ui/GreenButton.svelte";
    import InputTable from "./InputTable.svelte";
    import LoadingScreen from "$lib/ui/LoadingScreen.svelte";
    import RedButton from "$lib/ui/RedButton.svelte";

    import type { FacultyProfileRecordDTO } from "$lib/server/queries/faculty-view.js";
    import type { InputColumnType, InputRowValue } from "$lib/types/input-table.js";

    import { viewState, setToEdit, resetViewState } from '../states/view-state.svelte.js';

    interface Props {
        profile?: FacultyProfileRecordDTO;
        opts?: Map<string, Array<any>>;
        dependencyMaps?: Map<string, Map<string, string>>;
    }

    const { profile, opts, dependencyMaps }: Props = $props();

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
        }))
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
        }))
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
        }))
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
        profile?.educationalAttainments.map(({ tupleid, degree, institution, graduationYear }, index) => ({
            rowNum: index,
            row: [
                { columnNum: 0, defaultValue: degree },
                { columnNum: 1, defaultValue: institution },
                { columnNum: 2, defaultValue: graduationYear?.toString() ?? undefined },
            ],
            tupleid,
        }))
    );

    const fieldsOfInterest = $derived(opts?.get('fieldsOfInterest'));
    const fieldOfInterestColumns: InputColumnType[] = $derived([
        {
            label: 'Fields of Interest',
            name: 'fields-of-interest',
            colSpan: 1,
            type: 'dropdown',
            opts: fieldsOfInterest,
        },
    ]);

    const fieldOfInterestValues: InputRowValue[] | undefined = $derived(
        profile?.fieldsOfInterest.map(({ tupleid, field }, index) => ({
            rowNum: index,
            row: [{ columnNum: 0, defaultValue: field ?? undefined }],
            tupleid,
        }))
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
        },
        {
            label: 'Date of Tenure/Renewal',
            name: 'promotion-history-date',
            colSpan: 2,
            type: 'date',
        },
    ]);

    const promotionHistoryValues: InputRowValue[] | undefined = $derived(
        profile?.promotionHistory.map(({ tupleid, rankTitle, appointmentStatus, dateOfTenureOrRenewal }, index) => ({
            rowNum: index,
            row: [
                { columnNum: 0, defaultValue: rankTitle ?? undefined },
                { columnNum: 1 },
                { columnNum: 2 },
                { columnNum: 3, defaultValue: appointmentStatus },
                { columnNum: 4, defaultValue: dateOfTenureOrRenewal },
            ],
            tupleid,
        }))
    );

    let isLoading = $state(false);

    let profileForm: HTMLFormElement | null = null;
    const profileFormId = 'profile-form';
</script>

<form
    method="POST"
    action="?/update"
    onreset={resetViewState}
    id={profileFormId}
    bind:this={profileForm}
    use:enhance={() => {
        resetViewState();
        isLoading = true;
        return async ({ update }) => {
            await update();
            isLoading = false;
        };
    }}
>
    <div class="flex items-center gap-2">
        {#if viewState.isEditing}
            <GreenButton onclick={() => {
                if (profileForm) profileForm.requestSubmit();
            }}>
                <Icon icon="tabler:device-floppy" class="h-5 w-5 mr-2" />
                <span>Save Record</span>
            </GreenButton>
            <RedButton type="reset">
                <Icon icon="tabler:database-off" class="h-5 w-5 mr-2" />
                <span>Discard Changes</span>
            </RedButton>
        {:else}
            <GreenButton onclick={setToEdit}>
                <Icon icon="tabler:edit" class="h-5 w-5 mr-2" />
                <span>Edit</span>
            </GreenButton>
        {/if}
    </div>

    <div>
        <div class="w-full grid grid-cols-4 mt-4">
            <Field label="Last Name" name="last-name" defaultValue={profile?.lastname} />
            <Field label="First Name" name="first-name" defaultValue={profile?.firstname} />
            <Field label="Middle Name" name="middle-name" defaultValue={profile?.middlename} />
            <Field label="Suffix" name="suffix" defaultValue={profile?.suffix ?? undefined} />
        </div>
        <div class="w-full grid grid-cols-4 mt-4">
            <Field label="Birth Date" name="birth-date" type="date" defaultValue={profile?.birthdate} />
            <Field label="Maiden Name" name="maiden-name" defaultValue={profile?.maidenname ?? undefined} />
        </div>

        <div class="w-full grid grid-cols-4 mt-4">
            <InputTable tableName="emails" rowLabel="Email" columns={emailColumns} rows={emailValues ?? []} numOfColumns={1} />
            <InputTable tableName="contact-numbers" rowLabel="Contact Number" columns={contactNumColumns} rows={contactNumValues ?? []} numOfColumns={1} />
            <InputTable tableName="home-addresses" rowLabel="Home Address" columns={homeAddressColumns} rows={homeAddressValues ?? []} numOfColumns={1} colSpan={2} />
        </div>

        <p class="font-semibold mt-4 px-4">Educational Attainment</p>
        <div class="w-full grid grid-cols-4 mt-4">
            <InputTable tableName="educational-attainments" rowLabel="Educational Attainment" columns={educationalAttainmentColumns} rows={educationalAttainmentValues ?? []} numOfColumns={5} colSpan={2} />
            <InputTable tableName="fields-of-interest" rowLabel="Fields of Interest" columns={fieldOfInterestColumns} rows={fieldOfInterestValues ?? []} numOfColumns={1} />
        </div>

        <div class="w-full grid grid-cols-4 mt-4">
            <Field label="PhilHealth No." name="philhealth" immutable={true} defaultValue={profile?.philhealth} />
            <Field label="Pag-IBIG No." name="pagibig" immutable={true} defaultValue={profile?.pagibig} />
            <Field label="PSI Item No." name="psi-item" immutable={true} defaultValue={profile?.psiitem} />
        </div>
        <div class="w-full grid grid-cols-4 mt-4">
            <Field label="TIN" name="tin" immutable={true} defaultValue={profile?.tin} />
            <Field label="GSIS BP No." name="gsis" immutable={true} defaultValue={profile?.gsis} />
            <Field label="Employee No." name="employee-number" immutable={true} defaultValue={profile?.employeenumber} />
        </div>
        <div class="w-full grid grid-cols-4 mt-4">
            <Field label="Status" name="status" defaultValue={profile?.status} />
            <Field label="Date of Original Appointment" name="date-of-original-appointment" type="date" colSpan={2} defaultValue={profile?.dateoforiginalappointment} />
        </div>

        <p class="font-semibold mt-6 px-4">Promotion History</p>
        <div class="w-full grid grid-cols-11 mt-4">
            <InputTable tableName="promotion-history" rowLabel="Promotion" columns={promotionHistoryColumns} rows={promotionHistoryValues ?? []} numOfColumns={9} colSpan={9} />
        </div>

        <div class="mt-8.5">
            <label for="remarks">
                <span>Remarks</span>
            </label>
            <textarea name="remarks" id="remarks" class="min-h-90 mt-4 h-fit w-full rounded-2xl border-0 bg-white p-1.5 placeholder-fims-gray focus:ring-0" disabled={!viewState.isEditing} defaultValue={profile?.remarks ?? ''}></textarea>
        </div>
    </div>
</form>

{#if isLoading}
    <LoadingScreen />
{/if}
