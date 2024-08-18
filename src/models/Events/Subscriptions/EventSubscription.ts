import { Streamer } from "../../Users/Streamer";

export abstract class EventSubscription {
    public type: string;
    public condition: Object;
    public version: string;
    public callback: (data: any) => void;

    constructor(
        type: string,
        condition: Object,
        version: string,
        callback: (data: any) => void
    ) {
        this.type = type;
        this.condition = condition;
        this.version = version;
        this.callback = callback;
    }
}
