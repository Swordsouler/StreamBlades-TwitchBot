import { RDFBase, Resource, XSDData } from "../RDFBase";

export abstract class Emote extends RDFBase {
    public id: string;
    public code: string;

    constructor(id: string, code: string) {
        super(new Resource("emote_" + id));
        this.id = id;
        this.code = code;
        this.addProperty(new Resource("hasCode"), new XSDData(code, "string"));
    }
}
