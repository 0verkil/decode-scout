<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    // Define the component's props
    export let isModalOpen: boolean;
    export let modalTitle: string;
    export let modalData: string;

    // Dispatcher for communicating back to the parent component
    const dispatch = createEventDispatcher();

    function closeModal() {
        dispatch('close');
    }
</script>

{#if isModalOpen}
    <div 
        class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity"
        on:click|self={closeModal}
    >
        <div 
            class="bg-zinc-900 w-full max-w-2xl max-h-[90vh] rounded-lg shadow-2xl flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <header class="p-4 border-b border-zinc-800 flex justify-between items-center">
                <h4 id="modal-title" class="text-lg font-bold text-pink-400">{modalTitle}</h4>
                <button class="text-zinc-400 hover:text-white" on:click={closeModal}>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </header>
            <div class="p-4 overflow-y-auto flex-grow">
                <pre class="bg-zinc-800 p-3 rounded text-xs overflow-x-auto whitespace-pre-wrap">{modalData}</pre>
            </div>
        </div>
    </div>
{/if}