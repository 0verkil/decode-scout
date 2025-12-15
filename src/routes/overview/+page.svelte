<script lang="ts">
  import DataModal from "$lib/components/DataModal.svelte";
    import { onMount } from "svelte";
    // IMPORT THE NEW MODAL COMPONENT
    // NOTE: Adjust the path above if RawDataModal.svelte is in a different directory relative to +page.svelte

    // --- 1. CORE INTERFACES (Kept for completeness) ---

    type ArtifactStatsTuple = [made: number, totalKnown: number, accuracy: number, totalLaunched: number];

    interface StatsPayload {
        launch_to_launch_mean_time: number;
        launch_to_intake_mean_time: number;
        intake_to_intake_mean_time: number;
        intake_to_launch_mean_time: number;
        artifact_stats: ArtifactStatsTuple; 
        raw_events: any[]; 
    }

    interface MatchData {
        [matchNumber: string]: StatsPayload;
    }

    interface EventData {
        [eventCode: string]: MatchData;
    }

    interface OverallStats {
        [teamNumber: string]: EventData;
    }
    
    // --- 2. RAW DATA INTERFACE (For parsing local storage) ---
    interface RawStatsPayload {
        'launch to launch': number | string;
        'launch to intake': number | string;
        'intake to intake': number | string;
        'intake to launch': number | string;
        'artifact stats': (number | string)[]; 
        'json': any[]; 
        [key: string]: any; 
    }
    interface RawEventData {
        [eventCode: string]: {
            [matchNumber: string]: RawStatsPayload;
        };
    }
    
    // --- 3. STATE MANAGEMENT ---

    let overallStats: OverallStats = {};
    let teamNumbers: string[] = [];

    // State for the Modal/Raw Data Viewer
    let isModalOpen = false;
    let modalData: string = ''; // Must be type string for the prop
    let modalTitle: string = '';

    onMount(() => {
        loadAllStats();
    });

    // --- 4. DATA LOADING AND CLEANING ---

    function loadAllStats() {
        const keys = Object.keys(localStorage);
        const stats: OverallStats = {};
        const teamKeys: string[] = [];

        keys.forEach(key => {
            if (!isNaN(parseInt(key)) && key.trim() !== '' && localStorage.getItem(key)) {
                const dataString = localStorage.getItem(key);
                if (dataString) {
                    try {
                        const rawTeamStats: RawEventData = JSON.parse(dataString);
                        const cleanedTeamStats: EventData = {};
                        
                        for (const eventCode in rawTeamStats) {
                            const rawMatchData = rawTeamStats[eventCode];
                            const cleanedMatchData: MatchData = {};

                            for (const matchNumber in rawMatchData) {
                                const rawPayload: RawStatsPayload = rawMatchData[matchNumber];
                                
                                const cleanedPayload: StatsPayload = {
                                    launch_to_launch_mean_time: parseFloat(rawPayload['launch to launch'] as any) || 0,
                                    launch_to_intake_mean_time: parseFloat(rawPayload['launch to intake'] as any) || 0,
                                    intake_to_intake_mean_time: parseFloat(rawPayload['intake to intake'] as any) || 0,
                                    intake_to_launch_mean_time: parseFloat(rawPayload['intake to launch'] as any) || 0,
                                    
                                    artifact_stats: (Array.isArray(rawPayload['artifact stats']) 
                                        ? (rawPayload['artifact stats'] as (number|string)[]).map(val => parseFloat(val as any) || 0)
                                        : [0, 0, 0, 0]
                                    ) as ArtifactStatsTuple,
                                    
                                    raw_events: rawPayload['json'] || [],
                                };

                                cleanedMatchData[matchNumber] = cleanedPayload;
                            }
                            cleanedTeamStats[eventCode] = cleanedMatchData;
                        }
                        
                        stats[key] = cleanedTeamStats;
                        teamKeys.push(key);

                    } catch (e) {
                        console.error(`Error parsing stats for team ${key}:`, e);
                    }
                }
            }
        });

        overallStats = stats;
        teamNumbers = teamKeys.sort((a, b) => parseInt(a) - parseInt(b));
    }

    // --- 5. CALCULATIONS ---
    type AvgCalculableKey = keyof StatsPayload | 'total_made';

    function calculateAverage(teamStats: EventData, eventCode: string, statKey: AvgCalculableKey): number | string {
        const eventData = teamStats[eventCode];
        if (!eventData) return 'N/A';
        const matchKeys = Object.keys(eventData);
        if (matchKeys.length === 0) return 'N/A';
        let total = 0;
        let count = 0;

        matchKeys.forEach(matchKey => {
            const matchPayload = eventData[matchKey];
            
            if (statKey === 'artifact_stats') {
                const accuracy = matchPayload.artifact_stats?.[2];
                if (typeof accuracy === 'number') {
                    total += accuracy;
                    count++;
                }
            } else if (statKey === 'total_made') {
                const made = matchPayload.artifact_stats?.[0];
                if (typeof made === 'number') {
                    total += made;
                    count++;
                }
            } else {
                 const value = matchPayload[statKey as keyof StatsPayload];
                 if (typeof value === 'number') {
                     total += value;
                     count++;
                 }
            }
        });

        if (count === 0) return 'N/A';
        
        if (statKey === 'artifact_stats') {
            return `${(total / count * 100).toFixed(1)}%`;
        } else if (statKey === 'total_made') {
             return total.toFixed(0); 
        } else {
             return (total / count).toFixed(2);
        }
    }

    /**
     * NEW FUNCTION: Calculates the weighted composite cycle time.
     */
     function calculateCompositeCycleTime(teamStats: EventData, eventCode: string): string {
        // Calculate the individual average times first.
        // We use the calculateAverage function and manually parse the result back to a number.
        
        const launchToIntake = parseFloat(calculateAverage(teamStats, eventCode, 'launch_to_intake_mean_time') as string) || 0;
        const intakeToIntake = parseFloat(calculateAverage(teamStats, eventCode, 'intake_to_intake_mean_time') as string) || 0;
        const intakeToLaunch = parseFloat(calculateAverage(teamStats, eventCode, 'intake_to_launch_mean_time') as string) || 0;
        const launchToLaunch = parseFloat(calculateAverage(teamStats, eventCode, 'launch_to_launch_mean_time') as string) || 0;

        // Formula: l->i + 2*i->i + i->l + 2*l->l
        const compositeTime = 
            launchToIntake + 
            (2 * intakeToIntake) + 
            intakeToLaunch + 
            (2 * launchToLaunch);
            
        // Handle case where all inputs resulted in 'N/A' (i.e., time components are 0)
        // If all inputs are 0, we can safely assume 'N/A' if no matches were logged, but the parent template
        // already handles the 'N/A' from calculateAverage, so we return 0.00 if it can't calculate.
        if (isNaN(compositeTime) || compositeTime === 0 && (launchToIntake + intakeToIntake + intakeToLaunch + launchToLaunch) === 0) {
             // A more robust check might be needed here, but for now, rely on calculateAverage's 'N/A' for single components.
             return compositeTime.toFixed(2);
        }

        return compositeTime.toFixed(2);
    }
    
    // --- 6. UTILITIES ---
    
    function downloadStats() {
        const jsonString = JSON.stringify(overallStats, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `scouting_data_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // --- 7. MODAL FUNCTIONS (Simplified to just set state) ---
    
    function showRawData(teamNumber: string, eventCode: string, matchNumber: string, rawEvents: any[]) {
        modalTitle = `Raw Events - Team ${teamNumber}, ${eventCode} (Match ${matchNumber})`;
        modalData = JSON.stringify(rawEvents, null, 2);
        isModalOpen = true;
    }

    function closeModal() {
        // This function is now only called by the child component's 'close' event
        isModalOpen = false;
        modalData = '';
        modalTitle = '';
    }
</script>

<main class="min-h-screen w-full bg-zinc-950 text-white font-mono p-6">
    <div class="max-w-4xl mx-auto">
        
        <header class="pb-6 border-b border-zinc-800 flex justify-between items-center">
            <h1 class="text-4xl font-black text-pink-500">Scouting Data Analysis</h1>
            <div class="flex gap-2">
                <button 
                    class="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded text-sm font-bold transition"
                    on:click={loadAllStats}
                >
                    Refresh Data
                </button>
                <button 
                    class="bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded text-sm font-bold transition"
                    on:click={downloadStats}
                >
                    Download JSON
                </button>
            </div>
        </header>

        {#if teamNumbers.length === 0}
            <div class="text-center py-20 text-zinc-600">
                <span class="text-6xl mb-4 block">∅</span>
                <p class="text-xl">No match data found in local storage. Please ensure data is present and refresh.</p>
                <a href="/" class="text-pink-500 underline mt-4 block">Go back to scouting</a>
            </div>
        {:else}
            <section class="mt-8 space-y-10">
                {#each teamNumbers as teamNumber}
                    {@const teamStats = overallStats[teamNumber]}

                    <div class="bg-zinc-900 p-4 rounded-lg shadow-xl border border-zinc-800">
                        <h2 class="text-3xl font-black text-pink-400 mb-4 border-b border-zinc-700 pb-2">Team {teamNumber}</h2>

                        {#each Object.keys(teamStats) as eventCode}
                            {@const eventData = teamStats[eventCode]}

                            <div class="mb-8">
                                <h3 class="text-2xl font-bold text-gray-300 mb-3 border-b border-zinc-700 pb-1">📊 Event: {eventCode}</h3>

                                <div class="grid grid-cols-4 gap-4 text-center mb-6 text-sm font-bold">
                                    <div class="bg-zinc-800 p-3 rounded">
                                        <div class="text-xs text-zinc-500 uppercase">Avg. Cycle Time</div>
                                        <div class="text-xl text-green-400">{calculateCompositeCycleTime(teamStats, eventCode)}s</div>
                                    </div>
                                    <div class="bg-zinc-800 p-3 rounded">
                                        <div class="text-xs text-zinc-500 uppercase">Avg. Accuracy</div>
                                        <div class="text-xl text-blue-400">{calculateAverage(teamStats, eventCode, 'artifact_stats')}</div>
                                    </div>
                                    <div class="bg-zinc-800 p-3 rounded">
                                        <div class="text-xs text-zinc-500 uppercase">Total Artifacts Made</div>
                                        <div class="text-xl text-yellow-400">{calculateAverage(teamStats, eventCode, 'total_made')}</div>
                                    </div>
                                     <div class="bg-zinc-800 p-3 rounded">
                                        <div class="text-xs text-zinc-500 uppercase">Matches Logged</div>
                                        <div class="text-xl text-pink-400">{Object.keys(eventData).length}</div>
                                    </div>
                                </div>
                                
                                <table class="w-full text-left text-sm mt-4">
                                    <thead class="text-zinc-400 uppercase text-xs border-b border-zinc-700">
                                        <tr>
                                            <th class="py-2">Match #</th>
                                            <th class="py-2">Accuracy (Hit/Attempt)</th>
                                            <th class="py-2">I->I Time (s)</th>
                                            <th class="py-2">I->L Time (s)</th>
                                            <th class="py-2">L->I Time (s)</th>
                                            <th class="py-2">L->L Time (s)</th>
                                            <th class="py-2">Total Launched</th>
                                            <th class="py-2">Raw Events</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {#each Object.entries(eventData) as [matchNumber, payload]}
                                            {@const [made, known, accuracy, totalLaunched] = payload.artifact_stats}
                                            <tr class="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                                                <td class="py-2 font-bold">{matchNumber}</td>
                                                <td class="py-2 text-blue-400">{(accuracy * 100).toFixed(1)}% ({made}/{known})</td>
                                                <td class="py-2 text-green-400">{payload.intake_to_intake_mean_time.toFixed(2)}</td>
                                                <td class="py-2 text-green-400">{payload.intake_to_launch_mean_time.toFixed(2)}</td>
                                                <td class="py-2 text-green-400">{payload.launch_to_intake_mean_time.toFixed(2)}</td>
                                                <td class="py-2 text-green-400">{payload.launch_to_launch_mean_time.toFixed(2)}</td>
                                                <td class="py-2 text-pink-400">{totalLaunched}</td>
                                                <td class="py-2 text-xs text-zinc-500 cursor-pointer">
                                                    <span 
                                                        on:click={() => showRawData(teamNumber, eventCode, matchNumber, payload.raw_events)}
                                                        class="hover:text-white underline"
                                                    >
                                                        View
                                                    </span>
                                                </td>
                                            </tr>
                                        {/each}
                                    </tbody>
                                </table>
                            </div>
                        {/each}
                    </div>
                {/each}
            </section>
        {/if}
    </div>
    
    <DataModal
        isModalOpen={isModalOpen}
        modalTitle={modalTitle}
        modalData={modalData}
        on:close={closeModal}
    />
</main>