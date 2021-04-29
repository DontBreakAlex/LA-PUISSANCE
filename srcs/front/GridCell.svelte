<div on:click>
    <slot></slot>
</div>

<style>
    div {
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #7289da;
        margin: 0;
        border-radius: 20px;
        transition: transform .2s ease-in-out, background-color .17s ease,color .17s ease;
        cursor: pointer;
    }

    div:hover {
        transform: scale(1.05);
        background-color: #677bc4;
    }

    div:active {
        transform: scale(1.05);
        background-color: #5b6eae;
    }

    div::before {
        content: "";
        padding-bottom: 100%;
        display: block;
    }
</style>
