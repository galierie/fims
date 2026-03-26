import { SvelteDate } from 'svelte/reactivity';

function getCurrentAcademicPeriod() {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    
    // If before August (month < 7), subtract 1 from the year
    const acadYear = month < 7 ? year - 1 : year;
    
    let semNum = 1;
    if (month >= 0 && month <= 4) semNum = 2;
    else if (month === 5 || month === 6) semNum = 3;
    
    return { acadYear, semNum };
}

const currentPeriod = getCurrentAcademicPeriod();

export const chosenSemestralRecord = $state({
    acadYear: currentPeriod.acadYear,
    semNum: currentPeriod.semNum, 
});

export function chooseSemestralRecord(newAcadYear: number, newSemNum: number) {
    chosenSemestralRecord.acadYear = newAcadYear;
    chosenSemestralRecord.semNum = newSemNum;
}
