<script>
    import TrackModal from './TrackModal.svelte';
    import { tabRoutes, selectedCriteria, overviewInfo, tabOrder, previousCriteria, selectedTracks } from '../store/store'

    let files = [];
    let arrayBuffers = [];
    let showModal = false;

    const handleFilesSelected = async (event) => {
        files = event.target.files;
        if (files.length === 0) {
            // In case the user didn't select any files
            return;
        }
        $tabRoutes = [];
        $selectedTracks = [];
        $selectedCriteria = '';
        $previousCriteria = '';
        $overviewInfo = [];
        $tabOrder = [];
        arrayBuffers = [];
        const routes = Array.from(files);

        for (let i = 0; i < routes.length; i++) {
            const route = routes[i];
            const arrayBuffer = await readFileAsArrayBuffer(route);
            arrayBuffers.push({
                id: i,
                buffer: arrayBuffer
            });
        }

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

</script>

<nav class="container">
    <TrackModal bind:showModal/>
    <h2 class="title">
        Tab Visualization
    </h2>
    <div class="button-group">
        <label class="ui right labeled icon button">
            Upload files
            <i class="upload icon"></i>
            <input 
                type="file" 
                multiple accept=".gp, .gp3, .gp4, .gp5, .gpx, .xml, .cap" 
                on:change={handleFilesSelected} />
        </label>
        <button class="ui right labeled icon button" on:click={() => (showModal = true)}>
            Select Tracks
            <i class="headphones icon"></i>
        </button>
    </div>
</nav>

<style>
    .container {
        display: flex;
        width: 100%;
        background-color: #333;
        color: white;
        height: 50px;
        align-items: center;
    }
    .title {
        flex: 1;
        margin-left: 10px;
        margin-top: 10px;
    }
    .button-group {
        flex: 1;
    }

    input[type="file"] {
        display: none;
    }
</style>