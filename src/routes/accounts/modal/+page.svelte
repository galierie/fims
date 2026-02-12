<script lang="ts">
  import './modal.css';
  import DelConfModal from './deleteConfirmation.svelte';
  import SaveConfModal from './saveConfirmation.svelte';

  let isDelConfModalOpen = false;
  let isSaveConfModalOpen = false;
	
  function toggleDelConfModal() {
		isDelConfModalOpen = !isDelConfModalOpen;
	}

  function handleDelete() {
    toggleDelConfModal();
    alert('Deleted');     // TODO: insert code for deleting the account in database
  }

  function toggleSaveConfModal() {
		isSaveConfModalOpen = !isSaveConfModalOpen;
	}

  function handleSave() {
    toggleSaveConfModal();
    alert('Saved');     // TODO: insert code for saving the account in database
  }
</script>

<button on:click={toggleDelConfModal}>Delete Account</button>
<button on:click={toggleSaveConfModal}>Save Account</button>

{#if isDelConfModalOpen} 
	<DelConfModal onDelete={handleDelete} onCancel={toggleDelConfModal}/>
{:else if isSaveConfModalOpen}
  <SaveConfModal onSave={handleSave} onCancel={toggleSaveConfModal}/>
{/if}
