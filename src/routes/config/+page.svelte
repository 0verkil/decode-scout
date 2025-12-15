<script lang="ts">
  import { onMount } from "svelte"; // Import onMount
  import { BASE_URL } from "$lib";
  import ToastHandler from "$lib/components/ToastHandler.svelte";
  import { showToast } from "$lib/store/toast";

  // Initialize state with default values, since localStorage is not available yet
  let teamNumber: number = 0;
  let year: number = 2026;
  let eventCode: string = 'unknown';

  // *** NEW: Load data only after component mounts (in the browser) ***
  onMount(() => {
    // These lines will now only run in the browser where localStorage exists
    teamNumber = parseInt(localStorage.getItem("teamNumber") || '0', 10);
    year = parseInt(localStorage.getItem("year") || '2026', 10);
    eventCode = localStorage.getItem('eventCode') || 'unknown';
  });

  function saveData() {
      // This function already runs correctly when triggered by a button click (after mount)
      localStorage.setItem("teamNumber", "" + teamNumber);
      localStorage.setItem("eventCode", "" + eventCode);
      localStorage.setItem("year", "" + year);
      showToast("Settings saved.", "success", 3000);
  }

</script>

<ToastHandler/>

<div
  class="bg-zinc-900 text-white absolute left-0 top-0 bottom-0 right-0 m-auto z-30 w-full h-full"
>
  <div class="flex flex-col m-4 text-center">
    <form onsubmit={() => false}>
      <h1 class="colorful">Scouting Configuration</h1>

      <div class="form-row pt-2">
        <label>Team Number</label><input
          bind:value={teamNumber}
          type="number"
          class="border-zinc-200 decoration-0 border-2 rounded-lg ml-4 w-30"
        />
      </div>

      <div class="form-row pt-2">
        <label>Event Code</label><input
          bind:value={eventCode}
          type="text"
          class="border-zinc-200 decoration-0 border-2 rounded-lg ml-4 w-30"
        />
      </div>

      <div class="form-row pt-2">
        <label>Year</label><input
          bind:value={year}
          type="number"
          class="border-zinc-200 decoration-0 border-2 rounded-lg ml-4 w-30"
        />
      </div>

      <div class="flex flex-row justify-center space-x-4">

        <div>
          <button
            class="mt-2 border-green-700 bg-green-500 rounded-lg py-3 px-4 uppercase active:scale-95 hover:bg-green-700 hover:border-green-900 border-2 hover:text-white/75 transition"
            onclick={saveData}
            >Save Settings</button
          >
        </div>

        <a href={BASE_URL}>
        <button
            class="mt-2 border-red-700 bg-red-500 rounded-lg py-3 px-4 uppercase active:scale-95 hover:bg-red-700 hover:border-red-900 border-2 hover:text-white/75 transition"
            >Close Settings</button
          >
        </a>
      </div>
      
    </form>
  </div>
</div>

<style lang="postcss">
    @reference "tailwindcss";
  
    .colorful {
      color: theme(--color-pink-300);
      text-shadow: 0 0 5px;
    }
  
    .form-row {
      display: flex;
      flex-direction: row;
      width: 100%;
      justify-content: space-between;
    }
  </style>
  