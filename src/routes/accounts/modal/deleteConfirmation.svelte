<script>
	export let onDelete = () => {};
	export let onCancel = () => {};
</script>

<div class="modal-overlay">
  <div class="modal-card">
    <p class="modal-text">Are you sure you want to delete the account?</p>
    
    <div class="button-container">
      <button class="btn btn-cancel" on:click={onDelete}>Delete</button>
			<button class="btn btn-exit" on:click={onCancel}>Cancel</button>
    </div>
  </div>
</div>