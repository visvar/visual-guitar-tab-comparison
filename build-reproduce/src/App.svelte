<script>
  import { onMount } from 'svelte';
  import * as alphaTab from '@coderline/alphatab';

  const settings = {
    display: {
      layoutMode: 'horizontal',
      stretchForce: 1,
      StaveProfile: 'Tab',
      systemsLayoutMode: 'UseModelLayout',
    },
    core: {
      fontDirectory: './alphatabFont/',
      // useWorkers: false, // breaks vite dev
      // scriptFile: '', // TODO: might fix build fail?
      includeNoteBounds: true,
    },
  };

  let main;

  onMount(() => {
    const api = new alphaTab.AlphaTabApi(main, settings);
  });
</script>

<div class="main-container">
  <div bind:this="{main}"></div>
</div>
