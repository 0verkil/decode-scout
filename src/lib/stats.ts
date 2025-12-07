import { Event } from "$lib/types"


// compute: accuracy, total artifacts, base time, start match time, launch -> intake, intake -> intake, intake -> launch, launch -> launch, intake retain %
export function getMatchStats(events: Event[]) {
    return {
        "launch to launch": getMeanTimeBetweenEventTypes(events, "launch_artifact", "launch_artifact", ["intake_artifact", "teleop_start"]),
        "launch to intake": getMeanTimeBetweenEventTypes(events, "launch_artifact", "intake_artifact", ["teleop_start"]),
        "intake to intake": getMeanTimeBetweenEventTypes(events, "intake_artifact", "intake_artifact", ["launch_artifact", "teleop_start"]),
        "intake to launch": getMeanTimeBetweenEventTypes(events, "intake_artifact", "launch_artifact", ["teleop_start"]),
        "artifact stats": getArtifactStats(events),
        "json": events
    }
}

/**
 * @returns A list of [made, total with known scored states, accuracy percentage, total launched]
 */
export function getArtifactStats(events: Event[]) {
    let made = 0;
    let total = 0;
    let totalKnown = 0;

    for (const event of events) {
        if (event.event == "launch_artifact") {
            if (event.data['scored'] == "true") {
                made += 1
                totalKnown += 1
            } else if (event.data['scored'] == "false") {
                totalKnown += 1
            }
            total += 1
        }
    }

    return [made, totalKnown, made / totalKnown, total];
}

/**
 * @returns The mean timespan (in seconds) between an event of eventType1 occurring and an event of eventType2 occurring. Timespan is ordered.
 */
export function getMeanTimeBetweenEventTypes(events: Event[], eventType1: string, eventType2: string, breakEvents: string[]) {
    events.sort((a, b) => a.timestamp - b.timestamp);
    let startTimeStamp = events[0].timestamp;

    let lastEventType1 = null;

    let totalTimespan = 0;
    let totalOccurrences = 0;

    for (const event of events) {

        // check for eventType2 first in the case that the two are the same, 
        // so we update to the new event timestamp after doing comparison with the previous one
        if (event.event == eventType2 && lastEventType1) {
            // console.log(lastEventType1 - startTimeStamp, event.timestamp - startTimeStamp);
            totalTimespan += event.timestamp - lastEventType1;
            totalOccurrences++;
            lastEventType1 = null; // reset it to null
        }

        if (event.event == eventType1) {
            lastEventType1 = event.timestamp;
        }

        // if the event is in the set of events that break up time between, reset to null
        if (breakEvents.includes(event.event)) {
            lastEventType1 = null;
        }
    }
    
    return totalTimespan / totalOccurrences;
}