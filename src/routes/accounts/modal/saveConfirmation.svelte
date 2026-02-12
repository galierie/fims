<script>
	export let onSave = () => {};
	export let onCancel = () => {};
</script>

<div class="modal-overlay">
  <div class="modal-card">
    <p class="modal-text">Are you sure you want to save the account?</p>
    
    <div class="button-container">
      <button class="btn btn-cancel" on:click={onSave}>Save</button>
			<button class="btn btn-exit" on:click={onCancel}>Cancel</button>
    </div>
  </div>
</div>
<div class='overlay'>
	<div class='modal'>
		<p>Are you sure you want to save the account?</p>
		<button on:click={onSave}>Save</button>
		<button on:click={onCancel}>Cancel</button>
	</div>
</div>