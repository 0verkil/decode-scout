from dataclasses import dataclass

@dataclass
class Event:
    timestamp: float
    event: str
    data: dict[str, str] = []

# define some events
class EventType:
    INTAKE_ARTIFACT = lambda timestamp: Event(timestamp, "intake_artifact")
    UNINTAKE_ARTIFACT = lambda timestamp: Event(timestamp, "unintake_artifact")
    LAUNCH_ARTIFACT = lambda timestamp: Event(timestamp, "launch_artifact")

    OPEN_GATE = lambda timestamp: Event(timestamp, "open_gate")

    SCORE_ARTIFACT = lambda timestamp: Event(timestamp, "score_artifact", { 'type': 'unknown' })
    CLASSIFY_ARTIFACT = lambda timestamp: Event(timestamp, "score_artifact", { 'type': 'classify' })
    OVERFLOW_ARTIFACT = lambda timestamp: Event(timestamp, "score_artifact", { 'type': 'overflow' })

    MISS_ARTIFACT = lambda timestamp: Event(timestamp, "miss_artifact")

    AUTONOMOUS = lambda start_time: EventPeriod(start_time, start_time + 30, "autonomous")
    TELEOP = lambda start_time: EventPeriod(start_time, start_time + 100, "teleop")
    ENDGAME = lambda start_time: EventPeriod(start_time, start_time + 20, "endgame")

    DEFENSE = lambda start_time, end_time: EventPeriod(start_time, end_time, "defense")
    DOUBLE_BASE = lambda start_time, match_time: EventPeriod(start_time, 150 - match_time, "double_base") # staying in double base takes the rest of the match

class EventPeriod:

    def __init__(self, start_timestamp: float, end_timestamp: float, period: str, data: dict[str, str] = []):
        self.start_event = Event(start_timestamp, period, data)
        self.end_event = Event(end_timestamp, period, data)

    def getEvents(self):
        return [self.start_event, self.end_event]