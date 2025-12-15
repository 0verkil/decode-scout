<script lang="ts">
    // --- NO LONGER NEEDED: fly, createEventDispatcher, onMount ---

    // Props: The container passes these down from the store's item.
    export let type: 'success' | 'error' | 'info'; 
    export let removeFn: () => void; // A function passed from the container to remove the item from the store

    // Helper to map the 'type' prop to the CSS class
    const toastClass = `toast-${type}`;

</script>

<div class="toast {toastClass}" on:click={removeFn}>
    <div class="toast-content">
        <slot />
    </div>
</div>

<style lang="postcss">
    @reference "tailwindcss";
    /* Modernized Styles */
    .toast {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 15px;
        border-radius: 8px; /* Slightly more rounded */
        color: #1f2937; /* Darker text for contrast */
        font-family: sans-serif;
        font-size: 14px;
        font-weight: 500;
        min-width: 280px;
        max-width: 400px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); /* Lighter shadow */
        border: 1px solid rgba(0, 0, 0, 0.05); /* Subtle border */
    }

    .toast-content {
        flex-grow: 1;
        margin-right: 15px;
        word-break: break-word;
    }

    /* Type-specific colors (lighter backgrounds) */
    .toast-success { 
        background-color: var(--color-green-300); /* Light green */
        border: 2px solid var(--color-green-600); /* Darker stripe on the side */
    }
    .toast-error { 
        background-color: var(--color-red-300); /* Light green */
        border: 2px solid var(--color-red-600); /* Darker stripe on the side */
    }
    .toast-info { 
        background-color: var(--color-cyan-300); /* Light green */
        border: 2px solid var(--color-cyan-600); /* Darker stripe on the side */
    }
</style>