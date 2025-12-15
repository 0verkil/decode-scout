import { writable, type Writable } from 'svelte/store';

// 1. Define the type/interface for a single Toast object
interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info'; // Use a union type for strictness
    duration: number;
}

// 2. Initialize the writable store with the correct type (an array of Toast objects)
export const toastQueue: Writable<Toast[]> = writable([]);

// Function exposed globally to add a new toast
// The parameters are already well-typed, but adding the return type (void) is good practice.
export function showToast(message: string, type: Toast['type'] = 'info', duration = 3000): void {
    const id = Date.now(); // Unique ID for keying/removal

    // Add the new toast object to the queue
    toastQueue.update(queue => [
        ...queue, 
        // TypeScript now confirms this object matches the Toast interface
        { id, message, type, duration } 
    ]);

    // Set a timer to automatically remove the toast
    setTimeout(() => {
        // Remove the toast by filtering out its ID
        toastQueue.update(queue => queue.filter(t => t.id !== id));
    }, duration);
}