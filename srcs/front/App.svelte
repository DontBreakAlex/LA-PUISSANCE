<script lang="ts">
	import SoundCell from './SoundCell.svelte';
	import AddSound from './AddSound.svelte';

	export type Sound = {
		name: string
		_id: string
	}

	let sounds: Promise<Sound[]> = (async () => {
		const resp = await fetch('list');
		return await resp.json();
	})();

	async function updateSounds() {
		const resp = await fetch('list');
		sounds = await resp.json();
	}
</script>

<main>
    <h1>La Puissance</h1>
    <div class="grid">
        {#await sounds}
            <p>Loading...</p>
        {:then sounds}
            {#each sounds as sound}
                <SoundCell {...sound}/>
            {/each}
            <AddSound on:upload-success={updateSounds}/>
        {:catch error}
            <p>Error: {error}</p>
        {/await}
    </div>
</main>

<style>
    main {
        text-align: center;
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        padding: 1em;
    }

    h1 {
        color: #ffffff;
        text-transform: uppercase;
        font-size: clamp(1em, 20vw, 15vh);
        margin: 0;
        padding-bottom: 1rem;
        padding-top: 1rem;
		font-family: 'League Gothic Italic', Arial, sans-serif
    }

    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
    }
</style>
