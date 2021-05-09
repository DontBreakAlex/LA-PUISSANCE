<script lang="ts">
	export let image_url: string | undefined = undefined;
</script>

<div on:click>
	<div class="content" style="{image_url ? `background-image: url(images/${image_url});` : ''}">
		<slot></slot>
	</div>
</div>

<style>
    div {
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0;
    }

	.content {
        background-color: #7289da;
        margin: 0;
        border-radius: 20px;
        transition: transform .2s ease-in-out, background-color .17s ease,color .17s ease;
        cursor: pointer;
        aspect-ratio: 1/1;
		width: 100%;
		max-width: 50vh;
		background-position: center;
		background-size: cover;
	}

    .content:hover {
        transform: scale(1.05);
        background-color: #677bc4;
    }

    .content:active {
        transform: scale(1.05);
        background-color: #5b6eae;
    }

    .content::before {
        content: "";
        padding-bottom: 100%;
        display: block;
    }
</style>
