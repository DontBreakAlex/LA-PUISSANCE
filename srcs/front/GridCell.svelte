<script lang="ts">
	export let image_url: string | undefined = undefined;
</script>

<div class="content" on:click style="{image_url ? `background-image: url(images/${image_url});` : ''}">
		<slot></slot>
</div>

<style>
    div {
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0;
		z-index: 0;
        position: relative;
    }

	.content {
        background-color: #7289da;
        margin: 0;
        border-radius: 20px;
        transition: background-color .17s ease, color .17s ease;
        cursor: pointer;
		width: 100%;
        height: 100%;
		background-position: center;
		background-size: cover;
	}

    .content:hover {
        background-color: #677bc4;
    }

    .content:active {
        background-color: #5b6eae;
    }

    .content::before {
        content: "";
        padding-bottom: 100%;
        display: block;
    }
</style>
