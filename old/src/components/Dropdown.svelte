<script>
    import { selectedCriteria } from '../store/store'

    let selectedOption = '';

    const options = [
        {
            value:'similarity',
            description: 'Similarity between bars'
        }, 
        {
            value:'density',
            description: 'Density of notes per bar'
        }, 
        {
            value:'fret span',
            description: 'Maximum span of frets per bar'
        }, 
        {
            value:'fret span in mm',
            description: 'Maximum span in mm of frets per bar'
        }, 
        {
            value:'string change',
            description: 'Quantity of string changes per bar'
        }, 
        {
            value:'1 on 1 comparison',
            description: 'Direct comparison between bars'
        }, 
        {
            value:'techniques',
            description: 'Different techniques per bar'
        }, 
    ];

    const handleChange = (event) => {
        const { value } = event.target;
        selectedCriteria.update(criteria => criteria = value)
    }

</script>

<div>
    <select class="ui search dropdown" value={$selectedCriteria} on:change={handleChange}>
        {#each options as option}
          <option value={option.value}>{option.description}</option>
        {/each}
    </select>
</div>

<style>
    .dropdown {
        width: 50%;
    }
</style>