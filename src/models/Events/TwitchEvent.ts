import { v4 as uuidv4 } from "uuid";
import { RDFBase, Resource } from "../RDFBase";
import { LiveStream } from "../LiveStream";
import { User } from "../Users/User";

export type TwitchEventProps = {
    eventId?: string;
    triggeredDuring: LiveStream;
};

export abstract class TwitchEvent extends RDFBase {
    triggeredDuring: LiveStream;

    constructor(props: TwitchEventProps) {
        const eventId = props.eventId || uuidv4();
        super(new Resource("event_" + eventId));
        this.triggeredDuring = props.triggeredDuring;
        if (this.triggeredDuring) {
            this.addProperty(
                new Resource("triggeredDuring"),
                this.triggeredDuring.resource
            );
        }
    }
}
