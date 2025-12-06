export class Event {
    timestamp: number;
    event: string;
    data: Record<string, string>;

    constructor(timestamp: number, event: string, data: Record<string, string> = {}) {
        this.timestamp = timestamp;
        this.event = event;
        this.data = data;
    }
}

export class EventPeriod {
    start_event: Event;
    end_event: Event;

    constructor(start_timestamp: number, end_timestamp: number, period: string, data: Record<string, string> = {}) {
        this.start_event = new Event(start_timestamp, period + "_start", data);
        this.end_event = new Event(end_timestamp, period + "_end", data);
    }

    getEvents(): Event[] {
        return [this.start_event, this.end_event];
    }
}

export class EventType {
    static INTAKE_ARTIFACT = (timestamp: number) => new Event(timestamp, "intake_artifact");
    static UNINTAKE_ARTIFACT = (timestamp: number) => new Event(timestamp, "unintake_artifact");
    static LAUNCH_ARTIFACT = (timestamp: number) => new Event(timestamp, "launch_artifact", { 'scored': 'unknown', 'type': 'unknown' });

    static OPEN_GATE = (timestamp: number) => new Event(timestamp, "open_gate");

    static SCORE_ARTIFACT = (launch: Event) => launch.data = { 'scored': 'true', 'type': 'unknown' };
    static CLASSIFY_ARTIFACT = (launch: Event) => launch.data = { 'scored': 'true', 'type': 'classified' };
    static OVERFLOW_ARTIFACT = (launch: Event) => launch.data = { 'scored': 'true', 'type': 'overflow' };

    static MISS_ARTIFACT = (launch: Event) => launch.data = { 'scored': 'false', 'type': 'miss' };

    static AUTONOMOUS = (start_time: number) => new EventPeriod(start_time, start_time + 30, "autonomous");
    static TELEOP = (start_time: number) => new EventPeriod(start_time, start_time + 120, "teleop");
    static ENDGAME = (start_time: number) => new EventPeriod(start_time, start_time + 20, "endgame");

    static DEFENSE = (start_time: number, end_time: number) => new EventPeriod(start_time, end_time, "defense");
    
    // staying in double base takes the rest of the match
    static DOUBLE_BASE = (start_time: number, time_left: number) => new EventPeriod(start_time, start_time + time_left, "double_base");
}