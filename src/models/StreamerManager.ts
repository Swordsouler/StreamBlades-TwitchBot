import AWSAppSyncClient, { AUTH_TYPE } from "aws-appsync";
import { Streamer } from "./Users/Streamer";
import gql from "graphql-tag";
import AWS from "aws-sdk";

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
        this.subscribeUserAccess();
    }

    private addStreamer(owner: string, refresh_token: string) {
        this.streamers.set(
            owner,
            new Streamer(owner.replace("twitch_", ""), "", refresh_token)
        );
    }

    private removeStreamer(owner: string) {
        this.streamers[owner].stop();
        this.streamers.delete(owner);
    }

    async loadStreamers() {
        const premiumUsers = await this.getPremiumUsers();
        this.getCredentials(premiumUsers);
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
            (user) => user.type === "premium+" || user.type === "admin"
        );
        // recursively nextToken
        if (newNextToken) {
            premiumUsers = premiumUsers.concat(
                await this.getPremiumUsers(newNextToken)
            );
        }
        return premiumUsers.map((user) => user.owner);
    }

    async subscribeUserAccess(): Promise<void> {
        const subscriptionCreate = gql`
            subscription MySubscription1 {
                onCreateUserAccess {
                    owner
                    type
                }
            }
        `;
        const subscriptionUpdate = gql`
            subscription MySubscription2 {
                onUpdateUserAccess {
                    owner
                    type
                }
            }
        `;
        const subscriptionDelete = gql`
            subscription MySubscription3 {
                onDeleteUserAccess {
                    owner
                    type
                }
            }
        `;

        const subscription1 = client.subscribe({ query: subscriptionCreate });
        const subscription2 = client.subscribe({ query: subscriptionUpdate });
        const subscription3 = client.subscribe({ query: subscriptionDelete });

        console.log("Subscriptions started");

        subscription1.subscribe({
            next: (eventData) => {
                console.log("Subscription onCreateUserAccess:", eventData);
                // if type is premium+ or admin
                if (
                    (eventData.data.onCreateUserAccess.type === "premium+" ||
                        eventData.data.onCreateUserAccess.type === "admin") &&
                    !this.streamers.has(eventData.data.onCreateUserAccess.owner)
                ) {
                    this.getCredential(
                        eventData.data.onCreateUserAccess.owner
                    ).then((refresh_token) => {
                        this.addStreamer(
                            eventData.data.onCreateUserAccess.owner,
                            refresh_token
                        );
                    });
                }
            },
            error: (error) => {
                console.error("Subscription error onCreateUserAccess:", error);
            },
        });

        subscription2.subscribe({
            next: (eventData) => {
                console.log("Subscription onUpdateUserAccess:", eventData);
                if (
                    (eventData.data.onUpdateUserAccess.type === "premium+" ||
                        eventData.data.onUpdateUserAccess.type === "admin") &&
                    !this.streamers.has(eventData.data.onUpdateUserAccess.owner)
                ) {
                    this.getCredential(
                        eventData.data.onUpdateUserAccess.owner
                    ).then((refresh_token) => {
                        this.addStreamer(
                            eventData.data.onUpdateUserAccess.owner,
                            refresh_token
                        );
                    });
                } else if (
                    eventData.data.onUpdateUserAccess.type !== "premium+" &&
                    eventData.data.onUpdateUserAccess.type !== "admin" &&
                    this.streamers.has(eventData.data.onUpdateUserAccess.owner)
                ) {
                    this.removeStreamer(
                        eventData.data.onUpdateUserAccess.owner
                    );
                }
            },
            error: (error) => {
                console.error("Subscription error onUpdateUserAccess:", error);
            },
        });

        subscription3.subscribe({
            next: (eventData) => {
                console.log("Subscription onDeleteUserAccess:", eventData);
                if (
                    this.streamers.has(eventData.data.onDeleteUserAccess.owner)
                ) {
                    this.removeStreamer(
                        eventData.data.onDeleteUserAccess.owner
                    );
                }
            },
            error: (error) => {
                console.error("Subscription error onDeleteUserAccess:", error);
            },
        });
    }
}
