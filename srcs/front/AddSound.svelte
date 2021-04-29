<script lang="ts">
	import { DialogOverlay, DialogContent } from 'svelte-accessible-dialog';
	import GridCell from './GridCell.svelte';

	let isOpen: boolean;

	const open = () => {
		isOpen = true;
	};

	const close = () => {
		isOpen = false;
	};

	function handleSumbmit(e: any) {
		e.preventDefault()
		const formData = new FormData(e.target)
        for (const data of formData)
        	console.log(data)
		close()
	}
</script>

<GridCell on:click={open}>
    <img src="Add.svg" alt="Add">
</GridCell>

<DialogOverlay {isOpen} onDismiss={close} class="overlay">
    <DialogContent aria-label="File uploader" class="content">
        <h2>Add a sound</h2>
        <form action="/upload" method="post" enctype="multipart/form-data" on:submit={handleSumbmit}>
            <label>
                Sound name: <input type="text" name="name" required/>
            </label>
            <label>
                Sound file: <input type="file" name="sound" accept="audio/mpeg" required/>
            </label>
            <div class="spacer"></div>
            <div class="lastRow">
                <button on:click={close}>Cancel</button>
                <input type="submit" value="Send">
            </div>
        </form>
    </DialogContent>
</DialogOverlay>

<style>
    img {
        max-width: 100%;
        width: max(60%, 150px);
        height: auto;
    }

    :global([data-svelte-dialog-content].content) {
    }

    :global([data-svelte-dialog-overlay].overlay) {
    }

    h2 {
        font-size: 2rem;
        text-align: center;
    }
    form {
        display: flex;
        flex-direction: column;
    }

    label {
        margin-top: 0.3em;
        margin-bottom: 0.3em;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 1em;
        justify-content: center;
    }

    input {
        flex-grow: 1;
    }

    input[type=submit] {
        flex-grow: 0;
    }

    div.lastRow {
        display: flex;
        justify-content: space-between;
    }

    .spacer {
        min-height: 7.5vh;
        flex-grow: 1;
    }
</style>
