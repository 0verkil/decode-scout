<script lang="ts">
    import { onDestroy } from "svelte";
    import { Event, EventPeriod, EventType } from "$lib/types"; 
  
    // --- State ---
    let events: any[] = [];
    
    // Match Status
    let isMatchRunning = false;
    let periodStartTime: number | null = null;
    let periodDuration = 0; // in seconds
    let gameState: "auto" | "teleop" | "endgame" | "finished" | null = null;
    let timerDisplay = "00:00";
    let timeLeftSeconds = 0;
    let timerInterval: any;
  
    // Game Data
    let shotsInAir: Event[] = [];
    $: shotsInAir.sort((a, b) => a.timestamp - b.timestamp);
    
    let artifactsHeld = 0;
    let score = 0; // Gauge: Classified (+3), Overflow (+1)
    let totalScoredCount = 0; // Count: Classified, Overflow, Scored
  
    // Defense & Endgame UI State
    let isDefenseActive = false;
    let isBaseAttempt = false;
  
    // --- Logic ---
    
    function startMatch() {
      resetState();
      isMatchRunning = true;
      startPeriod("auto");
    }
  
    function startTeleOp() {
      startPeriod("teleop");
    }
  
    function stopMatch() {
      isMatchRunning = false;
      gameState = "finished";
      clearInterval(timerInterval);
      saveData();
    }
  
    function startPeriod(period: "auto" | "teleop") {
      clearInterval(timerInterval);
      gameState = period;
      periodStartTime = Date.now();
      
      // FTC Standard Times
      if (period === "auto") {
          periodDuration = 30;
          logEvents(EventType.AUTONOMOUS(getTimestamp()).getEvents());
      } else {
          periodDuration = 120; // 2 minutes
          logEvents(EventType.TELEOP(getTimestamp()).getEvents());
          logEvents(EventType.ENDGAME(getTimestamp() + 100).getEvents());
      }
  
      timerInterval = setInterval(updateTimer, 100);
      updateTimer();
    }
  
    function updateTimer() {
      if (!periodStartTime) return;
      
      const elapsed = (Date.now() - periodStartTime) / 1000;
      timeLeftSeconds = Math.max(0, periodDuration - elapsed);
      
      // Format MM:SS
      const m = Math.floor(timeLeftSeconds / 60);
      const s = Math.floor(timeLeftSeconds % 60);
      const ms = Math.floor((timeLeftSeconds % 1) * 10); // Tenths
      timerDisplay = `${m}:${s.toString().padStart(2, '0')}`;
  
      // Handle Endgame Transition logic for UI purposes
      if (gameState === "teleop" && timeLeftSeconds <= 20 && timeLeftSeconds > 0) {
          // Technically still teleop, but visually endgame
          // We don't change gameState enum to keep logic simple, 
          // but we use timeLeftSeconds in template to show buttons
      }
      
      if (timeLeftSeconds === 0 && isMatchRunning) {
          // Auto-stop period if needed, or just let it sit at 0:00
          // clearInterval(timerInterval);
      }
    }
  
    function resetState() {
      artifactsHeld = 0;
      events = [];
      shotsInAir = [];
      score = 0;
      totalScoredCount = 0;
      isDefenseActive = false;
      isBaseAttempt = false;
    }
  
    // --- Event Logging & Scoring ---
  
    function logEvent(event: any) {
      events = [event, ...events];
    }
  
    function logEvents(newEvents: any[]) {
      events = [...newEvents, ...events];
    }
  
    function handleResolution(type: "score" | "classify" | "overflow" | "miss", shot: any) {
      // Log the event
      let eventFn;
      
      switch(type) {
          case "score":
              eventFn = EventType.SCORE_ARTIFACT;
              totalScoredCount++;
              break;
          case "classify":
              eventFn = EventType.CLASSIFY_ARTIFACT;
              score += 3;
              totalScoredCount++;
              break;
          case "overflow":
              eventFn = EventType.OVERFLOW_ARTIFACT;
              score += 1;
              totalScoredCount++;
              break;
          case "miss":
              eventFn = EventType.MISS_ARTIFACT;
              break;
      }
  
      if (eventFn) {
          logEvent(eventFn(shot));
      }
  
      // Remove from air
      shotsInAir = shotsInAir.filter(s => s !== shot);
    }
  
    function saveData() {
      console.log("Match saved!", events);
    }
  
    function getTimestamp() {
      return Date.now() / 1000;
    }
  
    onDestroy(() => {
      clearInterval(timerInterval);
    });
  </script>
  
  <main class="h-screen w-full bg-black text-white font-mono flex flex-col overflow-hidden select-none touch-manipulation">
    
    <!-- TOP BAR: Status & Score -->
    <div class="h-16 shrink-0 bg-zinc-900 border-b border-pink-900 flex items-center justify-between px-4 z-20 shadow-xl">
      
      <!-- Left: Score Gauge (Points) -->
      <div class="flex flex-col">
          <span class="text-[10px] text-pink-500 tracking-widest uppercase">Points</span>
          <span class="text-3xl font-black text-pink-400 leading-none">{score}</span>
      </div>
  
      <!-- Center: Timer & Period Indicator -->
      <div class="flex flex-col items-center">
          {#if !isMatchRunning}
              <div class="text-gray-500 font-bold tracking-widest">READY</div>
          {:else}
              <!-- Period Label -->
              <div class="text-[10px] font-bold tracking-[0.2em] animate-pulse" 
                   class:text-green-400={gameState === 'auto'}
                   class:text-yellow-400={gameState === 'teleop' && timeLeftSeconds > 30}
                   class:text-red-500={gameState === 'teleop' && timeLeftSeconds <= 30}>
                  {#if gameState === 'auto'} AUTONOMOUS
                  {:else if gameState === 'teleop' && timeLeftSeconds <= 30} ENDGAME
                  {:else} TELEOP
                  {/if}
              </div>
              <!-- Timer -->
              <div class="text-4xl font-black tabular-nums leading-none">
                  {timerDisplay}
              </div>
          {/if}
      </div>
  
      <!-- Right: Total Scored Counter -->
      <div class="flex flex-col items-end">
          <span class="text-[10px] text-blue-400 tracking-widest uppercase">Scored</span>
          <span class="text-3xl font-black text-blue-300 leading-none">{totalScoredCount}</span>
      </div>
    </div>
  
    <!-- MAIN GRID -->
    <div class="flex-1 grid grid-cols-2 min-h-0 divide-x divide-zinc-800">
      
      <!-- LEFT COLUMN: Interaction -->
      <div class="flex flex-col h-full bg-zinc-950">
          
          <!-- TOP: Held Artifacts (Expanded Size) -->
          <!-- Taking up roughly 60% of vertical space for easy access -->
          <div class="flex-[3] flex flex-col border-b border-zinc-800 p-2 relative">
              <div class="absolute top-2 left-2 text-xs text-zinc-600 font-bold">INTAKE CONTROL</div>
              
              <div class="flex-1 flex items-center justify-center gap-2">
                  <!-- Minus -->
                  <button 
                      class="h-24 w-24 md:h-32 md:w-32 rounded-full border-4 border-zinc-700 text-zinc-500 text-4xl hover:bg-zinc-800 hover:text-white active:scale-95 transition-all flex items-center justify-center disabled:opacity-20"
                      disabled={!isMatchRunning || artifactsHeld == 0}
                      on:click={() => {
                          logEvent(EventType.UNINTAKE_ARTIFACT(getTimestamp()));
                          artifactsHeld--;
                      }}
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-10 h-10">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15" />
                      </svg>
                  </button>
  
                  <!-- Number Display -->
                  <div class="flex flex-col items-center justify-center w-20 md:w-32 z-10">
                      <span class="text-7xl md:text-8xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                          {artifactsHeld}
                      </span>
                      <span class="text-[10px] uppercase text-zinc-500 tracking-widest">Held</span>
                  </div>
  
                  <!-- Plus -->
                  <button 
                      class="h-24 w-24 md:h-32 md:w-32 rounded-full bg-pink-600 text-white shadow-[0_0_20px_rgba(219,39,119,0.4)] active:bg-pink-500 active:scale-95 transition-all flex items-center justify-center disabled:opacity-20"
                      disabled={!isMatchRunning}
                      on:click={() => {
                          logEvent(EventType.INTAKE_ARTIFACT(getTimestamp()));
                          artifactsHeld++;
                      }}
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-12 h-12">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                  </button>
              </div>
          </div>
  
          <!-- BOTTOM: Launch (Shrunk slightly) -->
          <button 
              class="flex-[2] bg-zinc-900 relative group overflow-hidden disabled:opacity-50 disabled:grayscale transition-colors hover:bg-zinc-800"
              disabled={!isMatchRunning || artifactsHeld == 0}
              on:click={() => {
                  let event = EventType.LAUNCH_ARTIFACT(getTimestamp());
                  logEvent(event);
                  shotsInAir = [event, ...shotsInAir];
                  artifactsHeld--;
              }}
          >   
              <!-- Target Visual -->
              <div class="absolute inset-0 flex items-center justify-center">
                  <div class="w-40 h-40 rounded-full border-4 border-dashed border-pink-500/50 flex flex-col items-center justify-center group-hover:bg-pink-500/10 group-active:bg-pink-500/20 transition-all">
                      <span class="text-2xl font-black text-pink-500 tracking-wider">LAUNCH</span>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-pink-500 mt-1">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                      </svg>
                  </div>
              </div>
              
              <div class="absolute bottom-2 left-2 text-[10px] text-zinc-600">/// TARGET_LOCKED</div>
          </button>
      </div>
  
      <!-- RIGHT COLUMN: Controls & Shots -->
      <div class="flex flex-col h-full bg-black">
          
          <!-- TOP SPLIT: Control Panel -->
          <div class="h-1/3 min-h-40 border-b border-zinc-800 p-3 grid grid-cols-2 gap-3 bg-zinc-900/50">
              
              <!-- Global Match Controls (Small, at top of split) -->
              <div class="col-span-2 flex gap-2 mb-1">
                  {#if !isMatchRunning}
                      <button class="flex-1 bg-green-600 hover:bg-green-500 font-bold rounded text-sm uppercase" on:click={startMatch}>
                          Start Match
                      </button>
                  {:else}
                      <button class="{gameState == "auto" ? "w-1/2" : "w-full"} bg-red-600 hover:bg-red-500 font-bold rounded text-sm uppercase" on:click={stopMatch}>
                          Stop
                      </button>
                      {#if gameState == "auto"}
                          <button class="flex-1 border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black font-bold rounded text-sm uppercase" on:click={startTeleOp}>
                              Start TeleOp
                          </button>
                      {/if}
                  {/if}
              </div>
  
              <!-- Open Gate (Highly Visible) -->
              <button 
                  class="col-span-1 bg-cyan-900 border-2 border-cyan-400 text-cyan-100 rounded-lg font-bold text-lg leading-tight shadow-[0_0_15px_rgba(34,211,238,0.2)] active:scale-95 transition-all hover:bg-cyan-800"
                  disabled={!isMatchRunning}
                  on:click={() => logEvent(EventType.OPEN_GATE(getTimestamp()))}
              >
                  OPEN<br>GATE
              </button>
  
              <!-- Defense Toggle -->
              <button 
                  class="col-span-1 text-orange-100 rounded-lg font-bold text-lg uppercase border-2 transition-all active:scale-95 flex flex-col shadow-[0_0_15px_rgba(34,211,238,0.2)] items-center justify-center gap-1 {!isDefenseActive ? "hover:bg-orange-900/75" : ""}"
                  class:bg-orange-950={!isDefenseActive}
                  class:border-orange-700={!isDefenseActive}
                  class:bg-orange-900={isDefenseActive}
                  class:border-orange-500={isDefenseActive}
                  class:animate-pulse={isDefenseActive}
                  disabled={!isMatchRunning}
                  on:click={() => {
                    if (isDefenseActive) {
                        logEvent(EventType.DEFENSE(getTimestamp(), getTimestamp()).end_event);
                    } else {
                        logEvent(EventType.DEFENSE(getTimestamp(), getTimestamp()).start_event);
                    }
                    isDefenseActive = !isDefenseActive;
                  }}
              >
                  {#if isDefenseActive}
                      <span>End<br>Defense</span>
                  {:else}
                      <span>Begin<br>Defense</span>
                  {/if}
              </button>
  
                  <button 
                      class="col-span-2 bg-purple-900 hover:bg-purple-700 transition-all border border-purple-400 text-purple-100 font-bold rounded shadow-lg active:scale-95"
                      class:animate-pulse={isBaseAttempt}
                      disabled={!isMatchRunning}
                      on:click={() =>{
                        if (!isBaseAttempt) {
                            logEvents(EventType.DOUBLE_BASE(getTimestamp(), timeLeftSeconds).getEvents());
                        }
                        isBaseAttempt = !isBaseAttempt;
                    }}
                  >
                    {#if !isBaseAttempt}
                      BEGIN BASE ATTEMPT
                    {:else}
                      ATTEMPTING BASE...
                    {/if}
                      
                  </button>
          </div>
  
          <!-- BOTTOM SPLIT: Shot List -->
          <div class="flex-1 p-3 flex flex-col gap-3 bg-zinc-950 relative overflow-y-hidden">
              
              <div class="sticky top-0 z-10 bg-zinc-950/90 backdrop-blur-sm text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-2 mb-2">
                  Shot Resolution
              </div>
  
              {#if shotsInAir.length === 0}
                  <div class="flex-1 flex flex-col items-center justify-center text-zinc-800 border-2 border-dashed border-zinc-900 rounded-xl m-4">
                      <span class="text-4xl mb-2">∅</span>
                      <span class="text-xs">AWAITING LAUNCH</span>
                  </div>
              {/if}
  
              {#each shotsInAir as shot (shot.timestamp)}
                  <div class="bg-zinc-900 border-l-4 border-pink-500 rounded shadow-md flex flex-col animate-in-slide">
                      
                      <!-- Header -->
                      <div class="bg-zinc-800/50 px-2 py-1 flex justify-between items-center">
                          <span class="text-[10px] font-mono text-zinc-400">T: {shot.timestamp.toFixed(1)}</span>
                          <span class="badge badge-xs bg-pink-500/20 text-pink-500 border-none rounded px-1">PENDING</span>
                      </div>
                      
                      <!-- Controls Grid -->
                      <div class="grid grid-cols-2 gap-1 p-2 h-40">
                          
                          <!-- Score -->
                          <button 
                              class="col-span-2 bg-green-900/40 border border-green-600/50 text-green-400 hover:bg-green-600 hover:text-white font-bold rounded transition-colors text-xl"
                              on:click={() => handleResolution('score', shot)}
                          >
                              SCORE
                          </button>
  
                          <!-- Classify -->
                          <button 
                              class="bg-blue-900/40 border border-blue-600/50 text-blue-400 hover:bg-blue-600 hover:text-white font-bold rounded transition-colors"
                              on:click={() => handleResolution('classify', shot)}
                          >
                              CLASSIFY (+3)
                          </button>
  
                          <!-- Overflow -->
                          <button 
                              class="bg-yellow-900/40 border border-yellow-600/50 text-yellow-400 hover:bg-yellow-600 hover:text-black font-bold rounded transition-colors"
                              on:click={() => handleResolution('overflow', shot)}
                          >
                              OVERFLOW (+1)
                          </button>
  
                          <!-- Miss -->
                          <button 
                              class="col-span-2 bg-red-900/40 border border-red-600/50 text-red-400 hover:bg-red-600 hover:text-white font-bold rounded transition-colors text-sm uppercase"
                              on:click={() => handleResolution('miss', shot)}
                          >
                              MISS
                          </button>
                      </div>
                  </div>
              {/each}
          </div>
      </div>
    </div>
  </main>
  
  <style>
      /* Utility animation classes */
      .animate-in-slide {
          animation: slideIn 0.2s cubic-bezier(0, 0, 0.2, 1) forwards;
      }
      .animate-bounce-in {
          animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
  
      @keyframes slideIn {
          from { opacity: 0; transform: translateX(10px); }
          to { opacity: 1; transform: translateX(0); }
      }
      @keyframes popIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
      }

      .grid > * { min-height: 0; }
  </style>