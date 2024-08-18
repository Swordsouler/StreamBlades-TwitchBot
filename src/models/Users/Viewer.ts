import { Resource } from "../RDFBase";
import { User } from "./User";

export class Viewer extends User {
    constructor(userId: string, displayName: string) {
        super(userId, displayName);
        this.addProperty(new Resource("a"), new Resource("Viewer"));
    }
}
