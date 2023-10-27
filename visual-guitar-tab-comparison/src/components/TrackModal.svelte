<script>
  import { alphaApis, selectedTracks, tabRoutes } from '../store/store';
  export let showModal; // boolean

  let dialog; // HTMLDialogElement

  let chosenTracks = [];

  $: if (dialog && showModal) dialog.showModal();

  const handleSelect = (event) => {
    const { value } = event.target;
    const selectedValue = JSON.parse(value);
    chosenTracks[selectedValue.api] = selectedValue;
  };

  const handleChanges = () => {
    // console.log(chosenTracks)
    $selectedTracks = chosenTracks;
    dialog.close();
    chosenTracks = [];
  };

  const cancelChanges = () => {
    dialog.close();
    chosenTracks = [];
  };

  const file = (api) => $tabRoutes.filter((d) => d.id === api.id)[0].fileName;
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<dialog
  bind:this="{dialog}"
  on:close="{() => (showModal = false)}"
  on:click|self="{() => dialog.close()}"
  on:keypress="{() => console.log('hola')}"
>
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div on:click|stopPropagation on:keypress="{() => console.log('hola')}">
    <h2>Select one track for each version</h2>
    {#if $alphaApis.length > 0}
      <div class="grid">
        {#each $alphaApis as api, i}
          <div>
            {i + 1}
          </div>
          <div title="{file(api)}">
            {file(api).substring(0, 30)}
          </div>
          <select
            class="version-select"
            name=""
            id=""
            on:change="{handleSelect}"
          >
            {#each api.content.score.tracks as track, j}
              <option
                value="{JSON.stringify({
                  name: track.name,
                  track: j,
                  api: i,
                })}">{track.name}</option
              >
            {/each}
          </select>
        {/each}
      </div>
    {/if}
  </div>
  <div class="button-group">
    <button class="ui primary button" on:click="{() => handleChanges()}">
      apply
    </button>
    <button class="ui button" on:click="{() => cancelChanges()}">
      cancel
    </button>
  </div>
</dialog>

<style>
  dialog {
    /* max-width: 32em; */
    border-radius: 0.2em;
    border: none;
    padding: 0;
    user-select: none;
  }
  div.grid {
    display: grid;
    grid-template-columns: 20px auto auto;
    align-items: start;
  }
  dialog::backdrop {
    background: rgba(0, 0, 0, 0.3);
  }
  dialog > div {
    padding: 1em;
  }
  dialog[open] {
    animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  @keyframes zoom {
    from {
      transform: scale(0.95);
    }
    to {
      transform: scale(1);
    }
  }
  dialog[open]::backdrop {
    animation: fade 0.2s ease-out;
  }
  @keyframes fade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  .version-select {
    margin-bottom: 15px;
  }
  button {
    flex: 1;
  }
  .button-group {
    display: flex;
  }
</style>
