<script>
  import { createEventDispatcher } from 'svelte';



  const dispatch = createEventDispatcher();

  let selectedOptions = ['beat', 'note'];

  const handleCheckmarkChange = (event) => {
  const option = event.target.value;
    if (event.target.checked) {
        selectedOptions = [...selectedOptions, option];
    } else {
        selectedOptions = selectedOptions.filter((item) => item !== option);
    }
    dispatch('selectedOptions', selectedOptions);
}
</script>

<div>
    <label>
        <input type="checkbox" value="beat" bind:group={selectedOptions} on:change={handleCheckmarkChange}/>
        Beat
    </label>
    <br>
    <label>
        <input type="checkbox" value="note" bind:group={selectedOptions} on:change={handleCheckmarkChange}/>
        Note
    </label>
</div>

<style>

</style>