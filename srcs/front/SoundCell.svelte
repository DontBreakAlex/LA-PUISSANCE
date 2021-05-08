<script lang="ts">
	import GridCell from './GridCell.svelte';
	export let name: string;
</script>

<GridCell>
    <p>{name}</p>
</GridCell>

<style>
	p {
		font-family: 'League Gothic', Arial, sans-serif;
		font-size: 300%;
	}
</style>
