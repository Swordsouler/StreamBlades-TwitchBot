import { LiveStream } from "../LiveStream";
import { Resource } from "../RDFBase";
import { Viewer } from "../Users/Viewer";
import { ViewerEvent, ViewerEventProps } from "./ViewerEvent";

export type SubscriptionProps = {
    hasTier: string;
} & ViewerEventProps;

export abstract class Subscription extends ViewerEvent {
    constructor(props: SubscriptionProps) {
        const { hasTier, ...viewerEventProps } = props;
        super(viewerEventProps);
        this.addProperty(new Resource("hasTier"), new Resource(hasTier));
    }
}
