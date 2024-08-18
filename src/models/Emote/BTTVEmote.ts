import { Resource } from "../RDFBase";
import { Emote } from "./Emote";

export default class BTTV {
    private static globalEmotes: BTTVEmote[] = [];
    private emotes = [];
    private broadcasterID: string;

    constructor(broadcasterID: string) {
        this.broadcasterID = broadcasterID;
        this.refreshUserEmotes();
    }

    public static async refreshGlobalEmotes() {
        const response = await fetch(
            "https://api.betterttv.net/3/cached/emotes/global"
        );
        const data = await response.json();
        BTTV.globalEmotes = data.map(
            (emote) => new BTTVEmote(emote.id, emote.code)
        );
    }

    public async refreshUserEmotes() {
        const response = await fetch(
            `https://api.betterttv.net/3/cached/users/twitch/${this.broadcasterID}`
        );
        const data = await response.json();
        this.emotes = [
            ...(data["sharedEmotes"]
                ? data["sharedEmotes"].map(
                      (emote: any) => new BTTVEmote(emote.id, emote.code)
                  )
                : []),
            ...(data["channelEmotes"]
                ? data["channelEmotes"].map(
                      (emote: any) => new BTTVEmote(emote.id, emote.code)
                  )
                : []),
        ];
    }

    public findEmotes(message: string): BTTVEmote[] {
        const emotes = [];
        for (const emote of BTTV.globalEmotes) {
            if (message.includes(emote.code)) emotes.push(emote);
        }
        for (const emote of this.emotes) {
            if (message.includes(emote.code)) emotes.push(emote);
        }
        return emotes;
    }
}

export class BTTVEmote extends Emote {
    constructor(id: string, code: string) {
        super(id, code);
        this.addProperty("a", new Resource("BTTVEmote"));
    }
}
