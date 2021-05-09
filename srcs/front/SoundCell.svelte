<script lang="ts">
	import GridCell from './GridCell.svelte';
	export let name: string;
	export let _id: string;
	export let image: string;

	async function handleClick() {
		fetch(`play?p=${_id}`, { method: 'post' });
	}
</script>

<GridCell on:click={handleClick} image_url={image}>
    <p style={image ? 'opacity: 0;' : ''}>{name}</p>
</GridCell>

<style>
	p {
		font-family: 'League Gothic', Arial, sans-serif;
		font-size: 300%;
	}
</style>
