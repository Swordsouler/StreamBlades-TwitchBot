import { RDFBase, Resource } from "./RDFBase";

export class LiveStream extends RDFBase {
    public livestreamId: string;
    protected startedAt: string;
    protected endedAt: string;
    protected duration: string;

    constructor(id: string) {
        super(new Resource("livestream_" + id));
        this.livestreamId = id;
    }
}
