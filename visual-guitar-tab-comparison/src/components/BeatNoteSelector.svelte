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
    };
</script>

<div>
    <label>
        <input
            type="checkbox"
            value="beat"
            bind:group="{selectedOptions}"
            on:change="{handleCheckmarkChange}"
        />
        beat
    </label>
    <label>
        <input
            type="checkbox"
            value="note"
            bind:group="{selectedOptions}"
            on:change="{handleCheckmarkChange}"
        />
        note
    </label>
</div>

<style>
    div {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 30px;
    }
</style>
