<script>
  import { selectedTechniques } from '../store/store';
  import { onMount } from 'svelte';
  let selectedColors = [
    '#e41a1c',
    '#377eb8',
    '#4daf4a',
    '#984ea3',
    '#ff7f00',
    '#ffff33',
    'lightblue',
    'lime',
    'pink',
    'gray',
    'black',
  ];

  const handleCheckboxChange = (event, color) => {
    if (event.target.checked) {
      selectedColors = [...selectedColors, color];
    } else {
      selectedColors = selectedColors.filter((c) => c !== color);
    }
    $selectedTechniques = selectedColors;
  };

  onMount(() => {
    $selectedTechniques = selectedColors;
  });
</script>

<div class="table-techniques-container">
  <div>
    <input
      type="checkbox"
      style="accent-color: #e41a1c"
      checked
      on:change="{(e) => handleCheckboxChange(e, '#e41a1c')}"
    />
    bend
  </div>
  <div>
    <input
      type="checkbox"
      style="accent-color: #377eb8"
      checked
      on:change="{(e) => handleCheckboxChange(e, '#377eb8')}"
    />
    hammer-on
  </div>
  <div>
    <input
      type="checkbox"
      style="accent-color: #4daf4a"
      checked
      on:change="{(e) => handleCheckboxChange(e, '#4daf4a')}"
    />
    harmonic
  </div>
  <div>
    <input
      type="checkbox"
      style="accent-color: #984ea3"
      checked
      on:change="{(e) => handleCheckboxChange(e, '#984ea3')}"
    />
    dead note
  </div>
  <div>
    <input
      type="checkbox"
      style="accent-color: #ff7f00"
      checked
      on:change="{(e) => handleCheckboxChange(e, '#ff7f00')}"
    />
    palm mute
  </div>
  <div>
    <input
      type="checkbox"
      style="accent-color: #ffff33"
      checked
      on:change="{(e) => handleCheckboxChange(e, '#ffff33')}"
    />
    staccato
  </div>
  <div>
    <input
      type="checkbox"
      style="accent-color: lightblue"
      checked
      on:change="{(e) => handleCheckboxChange(e, 'lightblue')}"
    />
    slide
  </div>
  <div>
    <input
      type="checkbox"
      style="accent-color: lime"
      checked
      on:change="{(e) => handleCheckboxChange(e, 'lime')}"
    />
    ghost note
  </div>
  <div>
    <input
      type="checkbox"
      style="accent-color: pink"
      checked
      on:change="{(e) => handleCheckboxChange(e, 'pink')}"
    />
    tap
  </div>
  <div>
    <input
      type="checkbox"
      style="accent-color: gray"
      checked
      on:change="{(e) => handleCheckboxChange(e, 'gray')}"
    />
    slap
  </div>
  <div>
    <input
      type="checkbox"
      style="accent-color: black"
      checked
      on:change="{(e) => handleCheckboxChange(e, 'black')}"
    />
    rasgueado
  </div>
</div>

<style>
  .table-techniques-container {
    margin-left: 10px;
    margin-top: 10px;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }

  div {
    margin-left: 5px;
  }
</style>
