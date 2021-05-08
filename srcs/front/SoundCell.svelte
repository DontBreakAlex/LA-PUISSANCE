<script lang="ts">
	import GridCell from './GridCell.svelte';
	export let name: string;
	export let _id: string;

	async function handleClick() {
		console.log(`Clicked ${name} with id ${_id}`);
		fetch(`play?p=${_id}`, { method: 'post' });
	}
</script>

<GridCell on:click={handleClick}>
    <p>{name}</p>
</GridCell>

<style>
	p {
		font-family: 'League Gothic', Arial, sans-serif;
		font-size: 300%;
	}
</style>
