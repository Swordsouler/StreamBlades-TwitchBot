import { v4 as uuidv4 } from "uuid";
import { RDFBase, Resource } from "../RDFBase";
import { LiveStream } from "../LiveStream";

export abstract class EventSubscription {
    public type: string;
    public condition: Object;
    public version: string;

    constructor(type: string, condition: Object, version: string) {
        this.type = type;
        this.condition = condition;
        this.version = version;
    }

    public abstract callback(data: any): void;
}

export type TwitchEventProps = {
    id?: string;
    triggeredDuring: LiveStream;
};
export abstract class TwitchEvent extends RDFBase {
    protected eventId: string;

    constructor(props: TwitchEventProps) {
        const { triggeredDuring } = props;
        const id = props.id || uuidv4();
        super(new Resource("event_" + id));
        this.eventId = id;
        this.addProperty(
            new Resource("triggeredDuring"),
            triggeredDuring.resource
        );
    }
}
