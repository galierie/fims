import { SvelteDate } from 'svelte/reactivity';

export const chosenSemestralRecord = $state({
    acadYear: new SvelteDate().getFullYear(),
    semNum: 2, // TODO: Find a better way to know current semester
});

export function chooseSemestralRecord(newAcadYear: number, newSemNum: number) {
    chosenSemestralRecord.acadYear = newAcadYear;
    chosenSemestralRecord.semNum = newSemNum;
}
