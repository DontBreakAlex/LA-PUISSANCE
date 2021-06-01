<script lang="ts">
	import GridCell from './GridCell.svelte';
	import { createEventDispatcher } from 'svelte';

	export let name: string;
	export let _id: string;
	export let image: string;

	const dispatch = createEventDispatcher();

	async function handleCellClick() {
		fetch(`play?p=${_id}`, { method: 'post' });
	}

	async function handleDeleteClick(e: Event) {
		e.stopPropagation();
		fetch(`delete?p=${_id}`, { method: 'post' }).then(resp => {
			if (resp.ok) {
				dispatch('delete-success');
			} else {
				console.error(`Failed to remove sound: ${resp.statusText}`);
			}
		});
	}
</script>

<div class="content-cell">
	<button on:click={handleDeleteClick}>
		<svg width="100%" height="100%" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path fill-rule="evenodd" clip-rule="evenodd"
				  d="M21.4645 21.5355C23.4171 19.5829 26.5829 19.5829 28.5355 21.5355L127.53 120.53C129.483 122.483 129.483 125.649 127.53 127.602C125.578 129.554 122.412 129.554 120.459 127.602L21.4645 28.6066C19.5118 26.654 19.5118 23.4882 21.4645 21.5355Z"
				  fill="#E21919"/>
			<path fill-rule="evenodd" clip-rule="evenodd"
				  d="M21.5355 127.536C19.5829 125.583 19.5829 122.417 21.5355 120.464L120.53 21.4695C122.483 19.5169 125.649 19.5169 127.602 21.4695C129.554 23.4221 129.554 26.588 127.602 28.5406L28.6066 127.536C26.654 129.488 23.4882 129.488 21.5355 127.536Z"
				  fill="#E21919"/>
		</svg>
	</button>
	<GridCell on:click={handleCellClick} image_url={image}>
		<p style={image ? 'opacity: 0;' : ''}>{name}</p>
	</GridCell>
</div>

<style>
    p {
        font-family: 'League Gothic', Arial, sans-serif;
        font-size: 300%;
    }
	
	div {
        position: relative;
	}

    :global(.content-cell):hover > button {
        transform: scale(1) rotate(180deg);
    }

    button {
        position: absolute;
        top: -1.5em;
        right: -1.5em;
        background-color: white;
        border-radius: 50%;
        width: 3em;
        height: 3em;
        margin: 0;
        border: 0;
		transform: scale(0);
        transition: transform .2s ease-in-out, background-color .17s ease;
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.5em;
    }

    button:hover {
        background-color: lightgray;
    }
</style>
