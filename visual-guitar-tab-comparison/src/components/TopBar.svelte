<script>
  import TrackModal from './TrackModal.svelte';
  import {
    tabRoutes,
    selectedCriteria,
    overviewInfo,
    tabOrder,
    previousCriteria,
    selectedTracks,
    apiAlignments,
    selectedPanelLayout,
    alignmentActivated,
  } from '../store/store';
  import Dropdown from './Dropdown.svelte';

  let files = [];
  let arrayBuffers = [];
  let showModal = false;
  let fileBtn;

  const handleFilesSelected = async (event) => {
    files = event.target.files;
    if (files.length === 0) {
      // In case the user didn't select any files
      return;
    }
    $tabRoutes = [];
    $selectedTracks = [];
    $previousCriteria = '';
    $selectedCriteria = 'similarity';
    $overviewInfo = [];
    $tabOrder = [];
    $apiAlignments = [];
    arrayBuffers = [];
    const routes = Array.from(files);

    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];
      const arrayBuffer = await readFileAsArrayBuffer(route);
      arrayBuffers.push({
        id: i,
        fileName: route.name,
        buffer: arrayBuffer,
      });
    }
    console.log(arrayBuffers);

    $tabRoutes = arrayBuffers;
  };

  const readFileAsArrayBuffer = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const arrayBuffer = event.target.result;
        resolve(arrayBuffer);
      };

      reader.onerror = (event) => {
        reject(event.target.error);
      };

      reader.readAsArrayBuffer(file);
    });
  };

  const handlePanelLayoutChange = () => {
    if ($selectedPanelLayout === 'horizontal') {
      $selectedPanelLayout = 'vertical';
    } else {
      $selectedPanelLayout = 'horizontal';
    }
  };

  const handleAlignmentMode = () => {
    if ($alignmentActivated) {
      $alignmentActivated = false;
    } else {
      $alignmentActivated = true;
    }
  };
</script>

<nav class="container">
  <h2 class="title">Visual Guitar Tab Comparison</h2>
  <div class="button-group">
    <input
      bind:this="{fileBtn}"
      type="file"
      multiple
      accept=".gp, .gp3, .gp4, .gp5, .gpx, .xml, .cap"
      on:change="{handleFilesSelected}"
      style="display: none"
    />
    <button on:click="{() => fileBtn.click()}"> open files </button>
    <button on:click="{() => (showModal = true)}"> select tracks </button>
  </div>
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <div>
    <label>
      <span>metric</span>
      <Dropdown />
    </label>
  </div>
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <div>
    <label>
      <span>alignment</span>
      <button on:click="{handleAlignmentMode}"
        >{$alignmentActivated ? 'on' : 'off'}</button
      >
    </label>
  </div>
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <div>
    <label>
      <span>layout</span>
      <button on:click="{handlePanelLayoutChange}"
        >{$selectedPanelLayout}</button
      >
    </label>
  </div>
  <div>
    <a
      href="https://github.com/visvar/visual-guitar-tab-comparison"
      target="_blank"
      rel="noreferrer"
      title="Code and publication at GitHub"
    >
      <img src="./ghIcon/github-mark.png" alt="GitHub" width="25px" />
    </a>
  </div>
  <TrackModal bind:showModal="{showModal}" />
</nav>

<style>
  nav {
    height: 45px;
    display: grid;
    grid-template-columns: 350px 200px 280px 150px auto min-content;
    align-items: center;
    align-content: center;
    border-bottom: 1px solid #888;
    background: rgb(142, 184, 219);
    color: #111;
  }

  .title {
    flex: 1;
    margin-left: 20px;
    margin-top: 18px;
    color: #2d3136;
    font-size: 22px;
    text-shadow: #aaaaaa22 1px 1px 1px;
    font-weight: 500;
  }
  .button-group {
    flex: 1;
  }

  input[type='file'] {
    display: none;
  }

  label {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  img {
    margin: 6px 20px 0 0;
  }
</style>
