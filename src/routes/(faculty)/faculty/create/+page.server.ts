import {
    getAllAppointmentStatuses,
    getAllFieldsOfInterest,
    getAllRanks,
} from '$lib/server/queries/faculty-view';

export async function load() {
    // Get input dropdown options and dependency mappings
    const opts: Map<string, Array<string>> = new Map();
    const dependencyMaps: Map<string, Map<string, string>> = new Map();

    opts.set('fieldsOfInterest', await getAllFieldsOfInterest());
    opts.set('appointmentStatuses', await getAllAppointmentStatuses());

    const ranks = await getAllRanks();
    opts.set(
        'rankTitles',
        ranks.map(({ rankTitle }) => rankTitle),
    );

    const rankTitlesToSalaryGrades: Map<string, string> = new Map(
        ranks.map(({ rankTitle, salaryGrade }) => [rankTitle, salaryGrade]),
    );
    dependencyMaps.set('rankTitlesToSalaryGrades', rankTitlesToSalaryGrades);

    const rankTitlesToSalaryRates: Map<string, string> = new Map(
        ranks.map(({ rankTitle, salaryRate }) => [rankTitle, salaryRate]),
    );
    dependencyMaps.set('rankTitlesToSalaryRates', rankTitlesToSalaryRates);

    return { opts, dependencyMaps };
}
