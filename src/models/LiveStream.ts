import { RDFBase, Resource, XSDData } from "./RDFBase";
import { Streamer } from "./Users/Streamer";

export class LiveStream extends RDFBase {
    constructor(
        broadcaster: Streamer,
        livestreamId: string,
        hasStartedAt: Date
    ) {
        super(new Resource("livestream_" + livestreamId), broadcaster.resource);
        this.addProperty("a", new Resource("LiveStream"));
        this.addProperty(
            new Resource("hasStartedAt"),
            new XSDData(hasStartedAt.toISOString(), "dateTime")
        );
        this.addProperty(new Resource("broadcastedBy"), broadcaster.resource);

        this.addToSemantize(broadcaster);
    }

    public finishStream(): void {
        const hasEndedAt = new Date();
        this.addProperty(
            new Resource("hasEndedAt"),
            new XSDData(hasEndedAt.toISOString(), "dateTime")
        );
    }
}
