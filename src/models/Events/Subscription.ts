import { Resource, XSDData } from "../RDFBase";
import { ViewerEvent, ViewerEventProps } from "./ViewerEvent";

export type SubscriptionProps = {
    hasTier: string;
} & ViewerEventProps;

export abstract class Subscription extends ViewerEvent {
    constructor(props: SubscriptionProps) {
        const { hasTier, ...viewerEventProps } = props;
        super(viewerEventProps);
        this.addProperty(
            new Resource("hasTier"),
            new XSDData(hasTier, "string")
        );
    }
}
