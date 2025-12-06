<script lang="ts">
  import { onDestroy } from "svelte";
  import { Event, EventPeriod, EventType } from "$lib/types";

  // --- State ---
  let events: Event[] = [];
  $: events.sort((a, b) => a.timestamp - b.timestamp);
  let isMatchRunning = false;
  let startTime: number | null = null;
  let timerDisplay = "0.00";
  let timerInterval: number;
  let gameState: "auto" | "dc" | "eg" | null = null;

  let shotsInAir: Event[] = [];

  let artifactsHeld = 0;

  // --- Logic ---
  function startMatch() {
    artifactsHeld = 0;
    isMatchRunning = true;
    startTime = Date.now();
    events = []; // Clear old events
    shotsInAir = [];
    logEvents(EventType.AUTONOMOUS(getTimestamp()).getEvents());
    gameState = "auto";

    // Start UI timer
    timerInterval = setInterval(() => {
      if (startTime) {
        timerDisplay = ((Date.now() - startTime) / 1000).toFixed(2);
      }
    }, 100);
  }

  function stopMatch() {
    isMatchRunning = false;
    clearInterval(timerInterval);
    saveData(); // Placeholder for saving JSON to local storage/download
  }

  function startTeleOp() {
    gameState = "dc";
    logEvents(EventType.TELEOP(getTimestamp()).getEvents());
    logEvents(EventType.ENDGAME(getTimestamp() + 100).getEvents());
  }

  function logEvent(event: Event) {
    events = [event, ...events];
  }

  function logEvents(newEvents: Event[]) {
    events = [...newEvents, ...events];
  }

  // Placeholder for downloading data
  function saveData() {
    const blob = new Blob([JSON.stringify(events, null, 2)], {
      type: "application/json",
    });
    console.log("Match saved!", events);
    // You could trigger a file download here
  }

  function getTimestamp() {
    return Date.now() / 1000;
  }

  function getMatchTime() {
    if (startTime != null) {
      return (Date.now() - startTime) / 1000;
    } else {
      return 0;
    }
  }

  onDestroy(() => {
    clearInterval(timerInterval);
  });
</script>

<main class="min-h-screen bg-base-200 p-4">
  <!-- Top Bar: Timer & Status -->
  <div class="navbar bg-base-100 shadow-lg rounded-box mb-6">
    <div class="flex-1">
      <h1 class="text-2xl font-bold px-4 text-primary">FTC Scouter</h1>
    </div>
    <div class="flex-none">
      <span class="font-mono text-4xl font-black px-4">{timerDisplay}</span>
    </div>
  </div>

  <!-- Game Controls Grid -->
  <div class="grid grid-cols-2 gap-4 mb-6">
    <!-- Intake (Big Button) -->
    <button
      class="btn btn-primary h-32 text-2xl"
      disabled={!isMatchRunning || artifactsHeld == 0}
      on:click={() => {
        logEvent(EventType.UNINTAKE_ARTIFACT(getTimestamp()));
        artifactsHeld--;
      }}
    >
      -1
    </button>

    {artifactsHeld}

    <button
      class="btn btn-primary h-32 text-2xl"
      disabled={!isMatchRunning}
      on:click={() => {
        logEvent(EventType.INTAKE_ARTIFACT(getTimestamp()));
        artifactsHeld++;
      }}
    >
      +1
    </button>

    <!-- Secondary Actions -->
    <button
      class="btn btn-accent h-24 text-xl"
      disabled={!isMatchRunning || artifactsHeld == 0}
      on:click={() => {
        let event = EventType.LAUNCH_ARTIFACT(getTimestamp());
        logEvent(event);
        shotsInAir = [event, ...shotsInAir];
        artifactsHeld--;
      }}
    >
      Launch
    </button>

    <!-- Event Periods -->
    <!-- <button 
        class="btn btn-neutral text-lg" 
        disabled={!isMatchRunning} 
        on:click={() => logEvents(EventType.DEFENSE(getTimestamp()))}
      >
        Start Defense
      </button> -->

    <button
      class="btn btn-info text-lg"
      disabled={!isMatchRunning}
      on:click={() => logEvent(EventType.OPEN_GATE(getTimestamp()))}
    >
      Open Gate
    </button>
  </div>

  <!-- Master Controls -->
  <div class="flex justify-center gap-4 mb-8">
    {#if !isMatchRunning}
      <button class="btn btn-success btn-wide btn-lg" on:click={startMatch}>
        Start Match
      </button>
    {:else}
      <button class="btn btn-error btn-wide btn-lg" on:click={stopMatch}>
        Stop Match
      </button>
      {#if gameState == "auto"}
        <button class="btn btn-success btn-wide btn-lg" on:click={startTeleOp}>
            Start TeleOp
        </button>
      {/if}
    {/if}
  </div>

  <div class="flex mt-4">
    <ul>
        {#each shotsInAir as shot}
            <li>shot {shot.timestamp}</li>
        {/each}
    </ul>
  </div>

  <!-- Event Log Table -->
  <div class="card bg-base-100 shadow-xl compact">
    <div class="card-body">
      <h2 class="card-title">Event Log</h2>
      <div class="overflow-x-auto h-48">
        <table class="table table-zebra w-full">
          <thead>
            <tr>
              <th>Time</th>
              <th>Event</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {#each events as e}
              <tr>
                <td class="font-mono">{e.timestamp.toFixed(2)}</td>
                <td class="font-bold">{e.event}</td>
                <td class="text-sm opacity-70">
                  {Object.keys(e.data).length ? JSON.stringify(e.data) : "-"}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</main>
