import { Resource } from "../RDFBase";
import { Emote } from "./Emote";

export class TwitchEmote extends Emote {
    constructor(id: string, code: string) {
        super(id, code);
        this.addProperty("a", new Resource("TwitchEmote"));
    }
}
