<script lang="ts">
	import { DialogOverlay, DialogContent } from 'svelte-accessible-dialog';
	import GridCell from './GridCell.svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
	const defaultText = 'Select file';
	let isOpen: boolean;
	let selectedFile: string = defaultText;

	const open = () => {
		isOpen = true;
	};

	const close = () => {
		isOpen = false;
	};

	function handleSubmit(e: any) {
		e.preventDefault();
		const formData = new FormData(e.target);
		fetch('upload', {
			method: 'post',
			body: formData
		}).then(resp => {
			if (resp.ok) {
				dispatch('upload-success');
			} else {
				console.error(`Upload failed: ${resp.statusText}`);
			}
		});
		selectedFile = defaultText;
		close();
	}

	function handleFileChange(e: any) {
		try {
			selectedFile = e.target.files[0].name;
		} catch {
			selectedFile = defaultText;
		}
	}
</script>

<GridCell on:click={open}>
    <img src="Add.svg" alt="Add">
</GridCell>

<DialogOverlay {isOpen} onDismiss={close} class="overlay">
    <DialogContent aria-label="File uploader" class="content">
        <h2>Add a sound</h2>
        <form action="/upload" method="post" enctype="multipart/form-data" on:submit={handleSubmit}>
            <label>
                Sound name: <input type="text" name="name" class="custom-input" required/>
            </label>
            <label>
                Sound file:
                <input type="file" name="sound" accept="audio/mpeg" on:change="{handleFileChange}" required/>
                <p class="custom-input">{selectedFile}</p>
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
        background: hsl(220, 8%, 30%);
		font-family: IBMPlexSans, Arial, sans-serif;
    }

    h2 {
        font-size: 2rem;
        text-align: center;
        color: white;
        margin-bottom: 2rem;
        margin-top: 0;
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
        align-items: center;
        color: white;
    }

    input, input + p {
        flex-grow: 1;
    }

    input + p {
        display: flex;
        justify-content: end;
        cursor: pointer;
        overflow: hidden;
    }

    input[type=file]:focus + p {
        outline: auto;
    }

    .custom-input {
        background: hsl(220, 8%, 20%);
        border-radius: 5px;
        border: none;
        min-height: 29px;
        align-items: center;
        transition: background-color .17s ease;
        color: white;
        padding-left: 0.3em;
        padding-right: 0.3em;
    }

    .custom-input:hover {
        background-color: hsl(220, 8%, 22%);
    }

    input[type=file] {
        width: 0.1px;
        height: 0.1px;
        opacity: 0;
        overflow: hidden;
        position: absolute;
        z-index: -1;
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
