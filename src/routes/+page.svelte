<script lang="ts">
    import { onDestroy } from 'svelte';
  
    // --- Types based on your Python code ---
    interface EventData {
      [key: string]: string;
    }
  
    interface LoggedEvent {
      timestamp: number;
      event: string;
      data: EventData;
    }
  
    // --- State ---
    let events: LoggedEvent[] = [];
    let isMatchRunning = false;
    let startTime: number | null = null;
    let timerDisplay = "0.00";
    let timerInterval: number;
  
    // --- Logic ---
    function startMatch() {
      isMatchRunning = true;
      startTime = Date.now();
      events = []; // Clear old events
      logEvent("match_start", { mode: "autonomous" });
  
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
      logEvent("match_end");
      saveData(); // Placeholder for saving JSON to local storage/download
    }
  
    function logEvent(eventName: string, data: EventData = {}) {
      if (!startTime && eventName !== "match_start") return;
  
      const currentTimestamp = startTime ? (Date.now() - startTime) / 1000 : 0.0;
  
      const newEvent: LoggedEvent = {
        timestamp: currentTimestamp,
        event: eventName,
        data: data
      };
  
      // Svelte Reactivity: reassignment triggers update
      events = [newEvent, ...events]; 
    }
  
    // Placeholder for downloading data
    function saveData() {
      const blob = new Blob([JSON.stringify(events, null, 2)], { type: 'application/json' });
      console.log("Match saved!", events);
      // You could trigger a file download here
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
        disabled={!isMatchRunning} 
        on:click={() => logEvent('intake_artifact')}
      >
        INTAKE
      </button>
  
      <!-- Score (Big Button) -->
      <button 
        class="btn btn-secondary h-32 text-2xl" 
        disabled={!isMatchRunning} 
        on:click={() => logEvent('score_artifact', { type: 'classify' })}
      >
        SCORE
      </button>
  
      <!-- Secondary Actions -->
      <button 
        class="btn btn-accent h-24 text-xl" 
        disabled={!isMatchRunning} 
        on:click={() => logEvent('launch_artifact')}
      >
        Launch
      </button>
  
      <button 
        class="btn btn-warning h-24 text-xl" 
        disabled={!isMatchRunning} 
        on:click={() => logEvent('miss_artifact')}
      >
        Miss
      </button>
  
      <!-- Event Periods -->
      <button 
        class="btn btn-neutral text-lg" 
        disabled={!isMatchRunning} 
        on:click={() => logEvent('defense_start')}
      >
        Start Defense
      </button>
  
      <button 
        class="btn btn-info text-lg" 
        disabled={!isMatchRunning} 
        on:click={() => logEvent('open_gate')}
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
      {/if}
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
                    {Object.keys(e.data).length ? JSON.stringify(e.data) : '-'}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </main>