import { RDFBase } from "../RDFBase";
import { Streamer } from "./Streamer";
import { User } from "./User";

export class ChatBot extends User {
    constructor(userId: string, displayName: string, refreshToken: string) {
        super(userId, displayName, refreshToken);
    }

    public async sendMessage(streamer: Streamer, message: string) {
        if (!this.ready) {
            console.error("ChatBot is not ready");
            return;
        }
        const result = await fetch(
            "https://api.twitch.tv/helix/chat/messages",
            {
                method: "POST",
                headers: {
                    "Client-ID": process.env.TWITCH_CLIENT_ID,
                    Authorization: `Bearer ${this.accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    broadcaster_id: streamer.userId,
                    sender_id: this.userId,
                    message: message,
                }),
            }
        );
        if (!result.ok) {
            const data = await result.json();
            console.error(`Failed to send message to ${streamer.userId}`, data);
        }
    }

    public async deleteDuplicateDisplayName() {
        if (!this.ready) {
            console.error("ChatBot is not ready");
            return;
        }
        fetch(process.env.DELETE_DUPLICATE_DISPLAY_NAME_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${this.accessToken}`,
            },
        })
            .then((res) => {
                console.log("deleteDuplicateDisplayName: OK");
            })
            .catch((error) => {
                console.error("deleteDuplicateDisplayName: " + error.status);
            });
    }

    public async archive() {
        if (!this.ready) {
            console.error("ChatBot is not ready");
            return;
        }
        fetch(process.env.ARCHIVE_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${this.accessToken}`,
            },
        })
            .then(async (res) => {
                const data = await res.json();
                console.log("archive: OK", data);
            })
            .catch((error) => {
                console.error("archive: " + error.status);
            });
    }

    /*public async getCurrentPrediction(streamer: Streamer): Promise<any> {
        if (!this.ready) {
            console.error("ChatBot is not ready");
            return;
        }
        const result = await fetch(
            `https://api.twitch.tv/helix/predictions?broadcaster_id=${streamer.userId}`,
            {
                headers: {
                    "Client-ID": process.env.TWITCH_CLIENT_ID,
                    Authorization: `Bearer ${this.accessToken}`,
                },
            }
        );
        if (!result.ok) {
            const data = await result.json();
            console.error(
                `Failed to get current prediction for ${streamer.userId}`,
                data
            );
            return;
        }
        const data = await result.json();
        // is status === "ACTIVE" ?
        if (data.data.length === 0) return;

        if (data.data[0].status !== "ACTIVE") return;

        return data.data[0];
    }

    public async startPrediction(
        streamer: Streamer,
        title: string,
        outcomes: string[],
        duration: number
    ) {
        if (!this.ready) {
            console.error("ChatBot is not ready");
            return;
        }
        console.log(
            "Starting prediction",
            streamer.userId,
            title,
            outcomes,
            duration
        );
        const result = await fetch("https://api.twitch.tv/helix/predictions", {
            method: "POST",
            headers: {
                "Client-ID": process.env.TWITCH_CLIENT_ID,
                Authorization: `Bearer ${this.accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                broadcaster_id: streamer.userId,
                title: title,
                outcomes: outcomes.map((outcome) => ({ title: outcome })),
                prediction_window: duration,
            }),
        });
        if (!result.ok) {
            const data = await result.json();
            console.error(
                `Failed to start prediction for ${streamer.userId}`,
                data
            );
        }
    }

    public async endPrediction(streamer: Streamer, winningOutcomeId: string) {
        if (!this.ready) {
            console.error("ChatBot is not ready");
            return;
        }
        const predictionId = (await this.getCurrentPrediction(streamer)).id;
        const result = await fetch(
            `https://api.twitch.tv/helix/predictions/${predictionId}`,
            {
                method: "PATCH",
                headers: {
                    "Client-ID": process.env.TWITCH_CLIENT_ID,
                    Authorization: `Bearer ${this.accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    broadcaster_id: streamer.userId,
                    id: predictionId,
                    status: "RESOLVED",
                    winning_outcome_id: winningOutcomeId,
                }),
            }
        );
        if (!result.ok) {
            const data = await result.json();
            console.error(
                `Failed to end prediction for ${streamer.userId}`,
                data
            );
        }
    }

    public async getOutcomeID(
        streamer: Streamer,
        answer: string
    ): Promise<string> {
        if (!this.ready) {
            console.error("ChatBot is not ready");
            return;
        }
        // get current prediction
        const prediction = await this.getCurrentPrediction(streamer);
        prediction.outcomes.forEach((outcome: any) => {
            if (outcome.title === answer) return outcome.id;
        });
        return null;
    }

    public async getModerators(streamer: Streamer): Promise<string[]> {
        try {
            const result = await RDFBase.query(
                `SELECT DISTINCT ?name
                WHERE {
                    graph sb:twitch_${streamer.userId} {
                        ?message sb:hasBadge sb:badge_moderator ;
                                sb:triggeredDuring sb:livestream_${streamer.livestream.liveStreamId} ;
                                sb:triggeredBy ?moderator .
                    }
                    ?moderator sb:hasDisplayName ?name .
                }`
            );
            return result.body.map((binding: any) => binding.name.value);
        } catch (error) {
            console.error("Failed to get moderators");
            return [];
        }
    }

    public async getBestModerator(
        streamer: Streamer,
        since?: Date
    ): Promise<{
        name: string;
        bans: number;
    }> {
        try {
            since = since || new Date(0);
            const result = await RDFBase.query(
                `SELECT ?moderator ?name (COUNT(*) AS ?bans)
                WHERE {
                    VALUES ?streamer { sb:twitch_${streamer.userId} }
                    graph ?streamer {
                        ?ban a sb:Ban ;
                            sb:triggeredDuring sb:livestream_${
                                streamer.livestream.liveStreamId
                            } ;
                            sb:bannedBy ?moderator ;
                            sb:hasTimestamp ?timestamp .
                    }
                    ?moderator sb:hasDisplayName ?name .
                    FILTER(?timestamp > "${since.toISOString()}"^^xsd:dateTime)
                } GROUP BY ?moderator ?name ORDER BY DESC(?bans) LIMIT 1`
            );
            return result.body.map((binding: any) => ({
                name: binding.name.value,
                bans: parseInt(binding.bans.value),
            }))[0];
        } catch (error) {
            console.error("Failed to get moderators");
            return null;
        }
    }*/
}

export const StreamBlades = new ChatBot(
    process.env.TWITCH_BOT_ID,
    "StreamBlades",
    process.env.TWITCH_BOT_REFRESH_TOKEN
);
