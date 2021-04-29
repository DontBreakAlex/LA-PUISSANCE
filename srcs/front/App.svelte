<script lang="ts">
	import SoundCell from './SoundCell.svelte';
	import AddSound from './AddSound.svelte';

	export let sounds = async () => {
		const resp = await fetch('/list');
		return await resp.json();
	};
</script>

<main>
    <h1>La Puissance !</h1>
    <div class="grid">
        {#await sounds()}
            <p>Loading...</p>
        {:then sounds}
            {#each sounds as sound}
                <SoundCell {...sound}/>
            {/each}
            <AddSound/>
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
        color: #ff3e00;
        text-transform: uppercase;
        font-size: 3em;
        font-weight: 100;
        margin: 0;
        padding: 1em;
    }

    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
    }
</style>
