<script lang="ts">
	import GridCell from './GridCell.svelte';
	export let name: string;
</script>

<GridCell>
    <p>{name}</p>
</GridCell>
