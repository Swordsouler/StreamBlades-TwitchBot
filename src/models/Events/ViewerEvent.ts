import { Resource, XSDData } from "../RDFBase";
import { Viewer } from "../Users/Viewer";
import { TwitchEvent, TwitchEventProps } from "./TwitchEvent";

export type ViewerEventProps = {
    triggeredBy: Viewer;
    timestamp?: Date;
} & TwitchEventProps;

export abstract class ViewerEvent extends TwitchEvent {
    triggeredBy: Viewer;

    constructor(props: ViewerEventProps) {
        const { triggeredBy, timestamp = new Date(), ...eventProps } = props;
        super(eventProps);
        this.triggeredBy = triggeredBy;
        this.addProperty(new Resource("triggeredBy"), triggeredBy.resource);
        this.addProperty(
            new Resource("hasTimestamp"),
            new XSDData(timestamp.toISOString(), "dateTime")
        );
    }

    public toString(): string {
        return `${super.toString()}\n${this.triggeredBy.toString()}`;
    }

    public async semantize(
        context?: Resource,
        description?: string
    ): Promise<void> {
        if (!this.triggeredDuring) return;
        super.semantize(context, description);
    }
}
