import AWSAppSyncClient, { AUTH_TYPE } from "aws-appsync";
import { Streamer } from "./Users/Streamer";
import gql from "graphql-tag";
var AWS = require("aws-sdk");

AWS.config.update({
    region: process.env.AWS_REGION,
    credentials: new AWS.Credentials({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }),
});

const client = new AWSAppSyncClient({
    url: process.env.APPSYNC_API_URL,
    region: process.env.AWS_REGION,
    auth: {
        type: AUTH_TYPE.AWS_IAM,
        credentials: AWS.config.credentials,
    },
    disableOffline: true,
});

export class StreamerManager {
    private streamers: Map<string, Streamer>;

    constructor() {
        this.streamers = new Map<string, Streamer>();
        this.loadStreamers();
    }

    private addStreamer(owner: string, refresh_token: string) {
        if (this.streamers.has(owner)) {
            return;
        }
        this.streamers.set(
            owner,
            new Streamer(owner.replace("twitch_", ""), "", refresh_token)
        );
    }

    private removeStreamer(owner: string) {
        this.streamers[owner].stop();
        this.streamers.delete(owner);
    }

    public async loadStreamers() {
        const newStreamers = await this.getPremiumUsers();
        const currentStreamers = new Map(this.streamers);

        // Stop and remove streamers that are no longer present
        for (const [id, streamer] of currentStreamers) {
            if (!newStreamers.includes(id)) {
                await streamer.stop();
                this.streamers.delete(id);
            }
        }

        this.getCredentials(newStreamers);
    }

    async getCredential(owner: string): Promise<string> {
        try {
            const query = gql`
                query MyQuery($nextToken: String) {
                    getTwitchCredential(owner: $owner) {
                        items {
                            owner
                            refresh_token
                        }
                    }
                }
            `;
            const result = await client.query({
                query,
                variables: { owner },
            });
            return result.data["getTwitchCredential"]?.refresh_token;
        } catch (error) {
            console.error("Erreur lors de la requête GraphQL:", error);
        }
        return null;
    }

    async getCredentials(
        owners: string[],
        nextToken: string = null
    ): Promise<void> {
        try {
            const query = gql`
                query MyQuery($nextToken: String) {
                    listTwitchCredentials(nextToken: $nextToken) {
                        items {
                            owner
                            refresh_token
                        }
                        nextToken
                    }
                }
            `;
            const result = await client.query({
                query,
                variables: { nextToken },
            });
            const newNextToken = result.data["listTwitchCredentials"].nextToken;
            let credentials = result.data["listTwitchCredentials"].items.filter(
                (credential) => owners.includes(credential.owner)
            );
            if (newNextToken) {
                credentials = credentials.concat(
                    await this.getCredentials(owners, newNextToken)
                );
            }
            for (const credential of credentials) {
                this.addStreamer(credential.owner, credential.refresh_token);
            }
        } catch (error) {
            console.error("Erreur lors de la requête GraphQL:", error);
        }
    }

    async getPremiumUsers(nextToken: string = null): Promise<string[]> {
        const query = gql`
            query MyQuery($nextToken: String) {
                listUserAccesses(nextToken: $nextToken) {
                    items {
                        owner
                        type
                    }
                    nextToken
                }
            }
        `;
        const result = await client.query({
            query,
            variables: { nextToken },
        });
        const newNextToken = result.data["listUserAccesses"].nextToken;
        const users = result.data["listUserAccesses"].items;
        let premiumUsers = users.filter(
            (user) => user.type === "premium_plus" || user.type === "admin"
        );
        // recursively nextToken
        if (newNextToken) {
            premiumUsers = premiumUsers.concat(
                await this.getPremiumUsers(newNextToken)
            );
        }
        return premiumUsers.map((user) => user.owner);
    }
}
