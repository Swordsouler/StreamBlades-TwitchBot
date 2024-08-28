import { Resource, XSDData } from "../RDFBase";
import { TwitchEvent, TwitchEventProps } from "./TwitchEvent";

export type CommunityEventProps = {
    hasStartedAt: Date;
    hasEndedAt: Date;
} & TwitchEventProps;

export abstract class CommunityEvent extends TwitchEvent {
    constructor(props: CommunityEventProps) {
        const { hasStartedAt, hasEndedAt, ...eventProps } = props;
        super(eventProps);
        this.addProperty(
            new Resource("hasEndedAt"),
            new XSDData(hasStartedAt.toISOString(), "dateTime")
        );
        this.addProperty(
            new Resource("hasEndedAt"),
            new XSDData(hasEndedAt.toISOString(), "dateTime")
        );
    }
}
