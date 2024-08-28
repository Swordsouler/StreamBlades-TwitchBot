import { v4 as uuidv4 } from "uuid";
import { RDFBase, Resource } from "../RDFBase";
import { LiveStream } from "../LiveStream";
import { Streamer } from "../Users/Streamer";

export type TwitchEventProps = {
    eventId?: string;
    triggeredDuring: LiveStream;
    triggeredOn: Streamer;
};

export abstract class TwitchEvent extends RDFBase {
    protected triggeredDuring: LiveStream;

    constructor(props: TwitchEventProps) {
        const eventId = props.eventId || uuidv4();
        super(new Resource("event_" + eventId), props.triggeredOn.resource);
        this.triggeredDuring = props.triggeredDuring;
        if (this.triggeredDuring) {
            this.addProperty(
                new Resource("triggeredDuring"),
                this.triggeredDuring.resource
            );
        }
        this.addToSemantize(props.triggeredOn);
    }

    public semantize(description: string): Promise<void> {
        if (!this.triggeredDuring) return;
        return super.semantize(description);
    }
}
