<script lang="ts">
    import { getMatchStats, getMeanTimeBetweenEventTypes } from "$lib/stats";
    import { Event } from "$lib/types";

    export let events: Event[];
    export let closeFn: () => void;

    let dropConfirm = false;
    let teamNumber: number = parseInt(localStorage.getItem("teamNumber") || '0', 10);
    let matchNumber: number;
    let eventCode: string = localStorage.getItem('eventCode') || 'unknown';

    function saveData() {
    // 1. Get the statistics once to avoid redundant calls
    const stats = getMatchStats(events);
    const teamKey = teamNumber.toString();
    const matchKey = matchNumber.toString();
    
    // 2. Safely retrieve and parse the existing data
    const teamStorage = localStorage.getItem(teamKey);

    // Default structure: { "eventCode": { "matchNumber": stats } }
    let teamData: any;

    if (teamStorage) {
        // --- Existing Data Found ---
        try {
            teamData = JSON.parse(teamStorage);
        } catch (e) {
            console.error("Failed to parse existing team data:", e);
            teamData = {}; // Initialize as empty if parsing fails
        }

        // a. Ensure the eventCode key exists on the teamData object
        if (!teamData[eventCode]) {
            teamData[eventCode] = {};
        }

        // b. Assign the match stats to the event's object (uses plain object assignment)
        // teamData looks like: { "eventCodeA": { "1": {...}, "2": {...} } }
        teamData[eventCode][matchKey] = stats;

    } else {
        // --- No Existing Data ---
        
        // Create the full structure for the first time
        // Note: The key is 'eventCode', not a placeholder name.
        teamData = {
            [eventCode]: {
                [matchKey]: stats
            }
        };
    }

    // 3. Save the updated structure back to localStorage
    localStorage.setItem(teamKey, JSON.stringify(teamData));
    
    // 4. Finalize
    console.log(stats);
    closeFn();
}

</script>

<div class="absolute bg-black/50 w-full h-full z-20"></div>

<div
  class="bg-zinc-900 border-pink-500 border-2 absolute left-0 top-0 bottom-0 right-0 m-auto z-30 mx-4 w-4/5 rounded-lg"
>
  <div class="flex flex-col m-4 text-center">
    <form onsubmit={() => false}>
      <h1 class="colorful">Match Information</h1>

      <div class="form-row pt-2">
        <label>Team Number</label><input
          bind:value={teamNumber}
          type="number"
          class="border-zinc-200 decoration-0 border-2 rounded-lg ml-4 w-30"
        />
      </div>

      <div class="form-row pt-2">
        <label>Match Number</label><input
          bind:value={matchNumber}
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


      <div>
        <button
          class="mt-2 border-green-700 bg-green-500 rounded-lg py-3 px-4 uppercase active:scale-95 hover:bg-green-700 hover:border-green-900 border-2 hover:text-white/75 transition"
          onclick={saveData}
          >Save Match</button
        >
        <button
          class="mt-2 border-red-700 bg-red-500 rounded-lg py-3 px-4 uppercase active:scale-95 hover:bg-red-700 hover:border-red-900 border-2 hover:text-white/75 transition"
          class:animate-pulse={dropConfirm}
          onclick={() => dropConfirm ? closeFn() : dropConfirm = true}
          >{dropConfirm ? "Confirm Drop" : "Drop Match"}</button
        >
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
