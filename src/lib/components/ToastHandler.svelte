<script lang="ts">
    import { toastQueue } from '$lib/store/toast';
    import { fly } from 'svelte/transition';
    import Toast from './Toast.svelte';

    $: activeToasts = $toastQueue;

    // Function to remove a toast from the queue by its ID (used for manual closing)
    function removeToast(id: number) {
        // The store handles the automatic removal, but we need this for the manual close button.
        toastQueue.update(queue => queue.filter(t => t.id !== id));
    }
</script>

<div class="toast-container">
    {#each activeToasts as toast (toast.id)}
        <div transition:fly|local="{{ y: -100, duration: 200 }}">
            <Toast 
                type={toast.type} 
                removeFn={() => removeToast(toast.id)} 
            >
                {@html toast.message}
            </Toast>
        </div>
    {/each}
</div>

<style>
    .toast-container {
        position: fixed;
        top: 20px;
        left: 50%; 
        transform: translateX(-50%); 
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
</style>