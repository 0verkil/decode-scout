import { Event } from "./types";

export function deserializeFromJson(json: any[]): Event[] {
    let events: Event[] = []

    for (const event of json) {

        if (!event['timestamp'] || !event['event'] || !event['data']) {
            continue;
        }
        
        events.push(new Event(event['timestamp'], event['event'], event['data']))
    }

    return events;
}