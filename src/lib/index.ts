import { deserializeFromJson } from "./serializer";
import { getArtifactStats, getMatchStats, getMeanTimeBetweenEventTypes } from "./stats";

export const BASE_URL = "/";

// place files you want to import through the `$lib` alias in this folder.
const m = [
    {
        "scored": "true",
        "type": "classified"
    },
    {
        "timestamp": 1765854001.102,
        "event": "autonomous_start",
        "data": {}
    },
    {
        "timestamp": 1765854001.825,
        "event": "intake_artifact",
        "data": {}
    },
    {
        "timestamp": 1765854001.974,
        "event": "intake_artifact",
        "data": {}
    },
    {
        "timestamp": 1765854002.105,
        "event": "intake_artifact",
        "data": {}
    },
    {
        "timestamp": 1765854004.839,
        "event": "launch_artifact",
        "data": {
            "scored": "true",
            "type": "classified"
        }
    },
    {
        "timestamp": 1765854006.32,
        "event": "launch_artifact",
        "data": {
            "scored": "true",
            "type": "classified"
        }
    },
    {
        "timestamp": 1765854007.486,
        "event": "launch_artifact",
        "data": {
            "scored": "true",
            "type": "classified"
        }
    },
    {
        "timestamp": 1765854010.766,
        "event": "intake_artifact",
        "data": {}
    },
    {
        "timestamp": 1765854011.248,
        "event": "intake_artifact",
        "data": {}
    },
    {
        "timestamp": 1765854011.653,
        "event": "intake_artifact",
        "data": {}
    },
    {
        "timestamp": 1765854017.76,
        "event": "launch_artifact",
        "data": {
            "scored": "false",
            "type": "miss"
        }
    },
    {
        "timestamp": 1765854018.958,
        "event": "launch_artifact",
        "data": {
            "scored": "true",
            "type": "classified"
        }
    },
    {
        "timestamp": 1765854020.107,
        "event": "launch_artifact",
        "data": {
            "scored": "true",
            "type": "classified"
        }
    },
    {
        "timestamp": 1765854022.536,
        "event": "intake_artifact",
        "data": {}
    },
    {
        "timestamp": 1765854022.857,
        "event": "intake_artifact",
        "data": {}
    },
    {
        "timestamp": 1765854023.02,
        "event": "intake_artifact",
        "data": {}
    },
    {
        "timestamp": 1765854026.483,
        "event": "launch_artifact",
        "data": {
            "scored": "true",
            "type": "classified"
        }
    },
    {
        "timestamp": 1765854027.751,
        "event": "launch_artifact",
        "data": {
            "scored": "true",
            "type": "classified"
        }
    },
    {
        "timestamp": 1765854028.83,
        "event": "launch_artifact",
        "data": {
            "scored": "true",
            "type": "classified"
        }
    },
    {
        "timestamp": 1765854031.102,
        "event": "autonomous_end",
        "data": {}
    },
    {
        "timestamp": 1765854044.434,
        "event": "intake_artifact",
        "data": {}
    },
    {
        "timestamp": 1765854044.7,
        "event": "intake_artifact",
        "data": {}
    },
    {
        "timestamp": 1765854045.685,
        "event": "intake_artifact",
        "data": {}
    },
    {
        "timestamp": 1765854050.03,
        "event": "launch_artifact",
        "data": {
            "scored": "true",
            "type": "classified"
        }
    },
    {
        "timestamp": 1765854051.129,
        "event": "launch_artifact",
        "data": {
            "scored": "true",
            "type": "classified"
        }
    },
    {
        "timestamp": 1765854052.195,
        "event": "launch_artifact",
        "data": {
            "scored": "true",
            "type": "classified"
        }
    },
    {
        "timestamp": 1765854054.492,
        "event": "intake_artifact",
        "data": {}
    },
    {
        "timestamp": 1765854055.193,
        "event": "intake_artifact",
        "data": {}
    },
    {
        "timestamp": 1765854055.826,
        "event": "intake_artifact",
        "data": {}
    },
    {
        "timestamp": 1765854060.853,
        "event": "launch_artifact",
        "data": {
            "scored": "false",
            "type": "miss"
        }
    },
    {
        "timestamp": 1765854061.955,
        "event": "launch_artifact",
        "data": {
            "scored": "true",
            "type": "classified"
        }
    },
    {
        "timestamp": 1765854063.171,
        "event": "launch_artifact",
        "data": {
            "scored": "true",
            "type": "classified"
        }
    },
    {
        "timestamp": 1765854066.266,
        "event": "intake_artifact",
        "data": {}
    },
    {
        "timestamp": 1765854067.914,
        "event": "unintake_artifact",
        "data": {}
    },
    {
        "timestamp": 1765854068.95,
        "event": "open_gate",
        "data": {}
    },
    {
        "timestamp": 1765854070.129,
        "event": "intake_artifact",
        "data": {}
    },
    {
        "timestamp": 1765854072.079,
        "event": "unintake_artifact",
        "data": {}
    },
    {
        "timestamp": 1765854072.477,
        "event": "intake_artifact",
        "data": {}
    },
    {
        "timestamp": 1765854072.658,
        "event": "intake_artifact",
        "data": {}
    },
    {
        "timestamp": 1765854074.276,
        "event": "intake_artifact",
        "data": {}
    },
    {
        "timestamp": 1765854075.907,
        "event": "unintake_artifact",
        "data": {}
    },
    {
        "timestamp": 1765854076.24,
        "event": "intake_artifact",
        "data": {}
    },
    {
        "timestamp": 1765854078.774,
        "event": "launch_artifact",
        "data": {
            "scored": "true",
            "type": "classified"
        }
    },
    {
        "timestamp": 1765854080.007,
        "event": "launch_artifact",
        "data": {
            "scored": "true",
            "type": "classified"
        }
    },
    {
        "timestamp": 1765854081.136,
        "event": "launch_artifact",
        "data": {
            "scored": "true",
            "type": "classified"
        }
    },
    {
        "timestamp": 1765854084.665,
        "event": "intake_artifact",
        "data": {}
    },
    {
        "timestamp": 1765854086.4,
        "event": "intake_artifact",
        "data": {}
    },
    {
        "timestamp": 1765854092.548,
        "event": "launch_artifact",
        "data": {
            "scored": "true",
            "type": "classified"
        }
    },
    {
        "timestamp": 1765854093.598,
        "event": "launch_artifact",
        "data": {
            "scored": "true",
            "type": "classified"
        }
    },
    {
        "timestamp": 1765854093.964,
        "event": "intake_artifact",
        "data": {}
    },
    {
        "timestamp": 1765854094.583,
        "event": "launch_artifact",
        "data": {
            "scored": "true",
            "type": "classified"
        }
    },
    {
        "timestamp": 1765854097.901,
        "event": "intake_artifact",
        "data": {}
    },
    {
        "timestamp": 1765854098.452,
        "event": "intake_artifact",
        "data": {}
    },
    {
        "timestamp": 1765854101.386,
        "event": "intake_artifact",
        "data": {}
    },
    {
        "timestamp": 1765854106.039,
        "event": "launch_artifact",
        "data": {
            "scored": "false",
            "type": "miss"
        }
    },
    {
        "timestamp": 1765854107.22,
        "event": "launch_artifact",
        "data": {
            "scored": "true",
            "type": "classified"
        }
    },
    {
        "timestamp": 1765854108.489,
        "event": "launch_artifact",
        "data": {
            "scored": "true",
            "type": "classified"
        }
    },
    {
        "timestamp": 1765854157.602,
        "event": "intake_artifact",
        "data": {}
    },
    {
        "timestamp": 1765854158.07,
        "event": "launch_artifact",
        "data": {
            "scored": "true",
            "type": "classified"
        }
    },
    {
        "timestamp": 1765854159.305,
        "event": "double_base_start",
        "data": {}
    },
    {
        "timestamp": 1765854159.305,
        "event": "double_base_end",
        "data": {}
    },
    {
        "scored": "true",
        "type": "classified"
    },
    {
        "scored": "true",
        "type": "classified"
    },
    {
        "scored": "true",
        "type": "classified"
    },
    {
        "timestamp": 1765854111.726,
        "event": "intake_artifact",
        "data": {}
    },
    {
        "timestamp": 1765854113.327,
        "event": "intake_artifact",
        "data": {}
    },
    {
        "timestamp": 1765854147.466,
        "event": "intake_artifact",
        "data": {}
    },
    {
        "timestamp": 1765854149.164,
        "event": "intake_artifact",
        "data": {}
    },
    {
        "timestamp": 1765854152.117,
        "event": "launch_artifact",
        "data": {
            "scored": "true",
            "type": "classified"
        }
    },
    {
        "timestamp": 1765854153.201,
        "event": "launch_artifact",
        "data": {
            "scored": "true",
            "type": "classified"
        }
    },
    {
        "timestamp": 1765854153.833,
        "event": "launch_artifact",
        "data": {
            "scored": "true",
            "type": "classified"
        }
    },
    {
        "scored": "true",
        "type": "classified"
    },
    {
        "scored": "true",
        "type": "classified"
    },
    {
        "timestamp": 1765854114.712,
        "event": "intake_artifact",
        "data": {}
    },
    {
        "timestamp": 1765854129.136,
        "event": "unintake_artifact",
        "data": {}
    },
    {
        "timestamp": 1765854129.385,
        "event": "intake_artifact",
        "data": {}
    },
    {
        "timestamp": 1765854130.402,
        "event": "unintake_artifact",
        "data": {}
    },
    {
        "timestamp": 1765854135.053,
        "event": "intake_artifact",
        "data": {}
    },
    {
        "timestamp": 1765854138.037,
        "event": "launch_artifact",
        "data": {
            "scored": "true",
            "type": "classified"
        }
    },
    {
        "timestamp": 1765854140.07,
        "event": "launch_artifact",
        "data": {
            "scored": "true",
            "type": "classified"
        }
    },
    {
        "scored": "true",
        "type": "classified"
    },
    {
        "scored": "true",
        "type": "classified"
    },
    {
        "scored": "false",
        "type": "miss"
    },
    {
        "scored": "true",
        "type": "classified"
    },
    {
        "scored": "true",
        "type": "classified"
    },
    {
        "scored": "true",
        "type": "classified"
    },
    {
        "scored": "true",
        "type": "classified"
    },
    {
        "scored": "true",
        "type": "classified"
    },
    {
        "scored": "true",
        "type": "classified"
    },
    {
        "scored": "true",
        "type": "classified"
    },
    {
        "scored": "true",
        "type": "classified"
    },
    {
        "scored": "false",
        "type": "miss"
    },
    {
        "scored": "true",
        "type": "classified"
    },
    {
        "scored": "true",
        "type": "classified"
    },
    {
        "scored": "true",
        "type": "classified"
    },
    {
        "scored": "true",
        "type": "classified"
    },
    {
        "scored": "true",
        "type": "classified"
    },
    {
        "scored": "true",
        "type": "classified"
    },
    {
        "scored": "true",
        "type": "classified"
    },
    {
        "scored": "true",
        "type": "classified"
    },
    {
        "scored": "false",
        "type": "miss"
    },
    {
        "scored": "true",
        "type": "classified"
    },
    {
        "scored": "true",
        "type": "classified"
    },
    {
        "scored": "true",
        "type": "classified"
    }
]

export function test() {
    const events = deserializeFromJson(m); //['3805']['USWAPALT1']['5']["raw_events"]);
    events.sort((a, b) => a.timestamp - b.timestamp);
    console.log(events)
    console.log("launch to launch", getMeanTimeBetweenEventTypes(events, "launch_artifact", "launch_artifact", ["intake_artifact", "teleop_start"]))
    console.log("launch to intake", getMeanTimeBetweenEventTypes(events, "launch_artifact", "intake_artifact", ["teleop_start"]))
    console.log("intake to intake", getMeanTimeBetweenEventTypes(events, "intake_artifact", "intake_artifact", ["launch_artifact", "teleop_start"]))
    console.log("intake to launch", getMeanTimeBetweenEventTypes(events, "intake_artifact", "launch_artifact", ["teleop_start"]))
    console.log(getMatchStats(events));
}