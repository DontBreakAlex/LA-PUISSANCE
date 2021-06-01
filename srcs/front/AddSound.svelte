<script lang="ts">
	import { DialogOverlay, DialogContent } from 'svelte-accessible-dialog';
	import GridCell from './GridCell.svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
	const defaultText = 'Select file';
	let isOpen: boolean;
	let selectedSound: string = defaultText;
	let selectedImage: string = defaultText;

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
		selectedSound = defaultText;
		selectedImage = defaultText;
		close();
	}

	function handleSoundChange(e: any) {
		try {
			selectedSound = e.target.files[0].name;
		} catch {
			selectedSound = defaultText;
		}
	}

	function handleImageChange(e: any) {
		try {
			selectedImage = e.target.files[0].name;
		} catch {
			selectedImage = defaultText;
		}
	}
</script>

<div class="content-cell">
	<GridCell on:click={open}>
		<img src="Add.svg" alt="Add">
	</GridCell>
</div>

<DialogOverlay {isOpen} onDismiss={close} class="overlay">
	<DialogContent aria-label="File uploader" class="content">
		<h2>Add a sound</h2>
		<form action="upload" method="post" enctype="multipart/form-data" on:submit={handleSubmit}>
			<label>
				<span>Sound name:</span><input type="text" name="name" class="custom-input" required/>
			</label>
			<label>
				Sound file:
				<input type="file" name="sound" accept="audio/mpeg" on:change="{handleSoundChange}" required/>
				<span class="custom-input">{selectedSound}</span>
			</label>
			<label>
				Thumbnail:
				<input type="file" name="image" accept="image/*" on:change="{handleImageChange}"/>
				<span class="custom-input">{selectedImage}</span>
			</label>
			<div class="spacer"></div>
			<div class="lastRow">
				<button on:click={close}>Cancel</button>
				<input type="submit" value="Upload">
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

    @media (max-width: 500px) {
        :global([data-svelte-dialog-content].content) {
            margin: 15vh 3vh auto;
            width: auto;
            padding: 3vh;
        }
    }

    :global([data-svelte-dialog-content].content) {
        background: hsl(220, 8%, 30%);
        font-family: IBMPlexSans, Arial, sans-serif;
        position: relative;
    }

    :global([data-svelte-dialog-overlay].overlay) {
        z-index: 99;
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
        gap: 1em;
        justify-content: center;
        align-items: center;
        color: white;
        white-space: nowrap;
    }

    input, input + span {
        flex-grow: 1;
    }

    input + span {
        display: flex;
        justify-content: center;
        cursor: pointer;
        overflow: hidden;
        margin: 0;
    }

    input[type=file]:focus + span {
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
        min-width: 5em;
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

    button, input[type=submit] {
        background-color: #cccccc;
        border-radius: 1.5em;
        padding: 0.5em 1em;
        text-align: center;
        outline: none;
        color: black;
        border: none;
        font-family: IBMPlexSans, Arial, sans-serif;
        display: block;
        height: 150%;
        width: max(20%, 5em);
        transition: background-color .17s ease;
    }

    button:hover, input[type=submit]:hover {
        background-color: white;
    }

    button:focus, input[type=submit]:focus {
        background-color: white;
    }

    label > span {
        margin: 0;
    }
</style>
