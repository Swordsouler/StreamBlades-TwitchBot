import { Resource, XSDData } from "../RDFBase";
import { Viewer } from "../Users/Viewer";
import { TwitchEvent, TwitchEventProps } from "./TwitchEvent";

export type ViewerEventProps = TwitchEventProps & {
    triggeredBy: Viewer;
    timestamp?: Date;
};
export abstract class ViewerEvent extends TwitchEvent {
    constructor(props: ViewerEventProps) {
        const { triggeredBy, timestamp = new Date(), ...eventProps } = props;
        super(eventProps);
        this.addProperty(new Resource("triggeredBy"), triggeredBy.resource);
        this.addProperty(
            new Resource("hasTimestamp"),
            new XSDData(timestamp.toISOString(), "dateTime")
        );
    }
}
