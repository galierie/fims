export function assertAllRequiredFormInputs(
    formInputs: Array<string | null>,
): asserts formInputs is string[] {
    if (formInputs.some((formInput) => formInput === null || formInput === ''))
        throw new Error('One or more variables are not valid strings');
}
