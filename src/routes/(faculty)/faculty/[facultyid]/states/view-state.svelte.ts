export const viewState = $state({
    isEditing: false,
});

export function setToEdit() {
    viewState.isEditing = true;
}

export function resetViewState() {
    viewState.isEditing = false;
}
