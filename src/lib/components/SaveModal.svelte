<script lang="ts">
    import { getMatchStats, getMeanTimeBetweenEventTypes } from "$lib/stats";
    import { Event } from "$lib/types";

    export let events: Event[];
    export let closeFn: () => void;

    let dropConfirm = false;
    let teamNumber: number;
    let matchNumber: number;

    function saveData() {
        localStorage.setItem(teamNumber + " | " + matchNumber, JSON.stringify(getMatchStats(events)));
        console.log(getMatchStats(events));
        closeFn();
    }

</script>

<div class="absolute bg-black/50 w-full h-full z-20"></div>

<div
  class="bg-zinc-900 border-pink-500 border-2 absolute left-1/2 top-1/2 -translate-1/2 z-30 mx-4 w-full md:w-auto ha-auto rounded-lg"
>
  <div class="flex flex-col m-4 text-center">
    <form onsubmit={() => false}>
      <h1 class="colorful">Match Information</h1>

      <div class="form-row pt-2">
        <label>Team Number</label><input
          bind:value={teamNumber}
          type="number"
          class="border-zinc-200 decoration-0 border-2 rounded-lg ml-4 w-20"
        />
      </div>

      <div class="form-row pt-2">
        <label>Match Number</label><input
          bind:value={matchNumber}
          type="number"
          class="border-zinc-200 decoration-0 border-2 rounded-lg ml-4 w-20"
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
