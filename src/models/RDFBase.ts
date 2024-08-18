export class RDFBase {
    private subject: Subject;
    private properties: Map<string, string[]>;

    public get resource(): Resource {
        return this.subject as Resource;
    }

    constructor(subject: Subject) {
        this.subject = subject;
        this.properties = new Map<string, string[]>();
    }

    public addProperty(predicate: Predicate, object: Object) {
        const predicateString = predicate.toString();
        if (!this.properties.has(predicateString))
            this.properties.set(predicateString, []);

        const objectString = object.toString();
        if (!this.properties.get(predicateString)?.includes(objectString))
            this.properties.get(predicateString)?.push(objectString);
    }

    public toString(): string {
        return `${this.subject} ${Array.from(this.properties.entries())
            .map(([predicate, objects]) => {
                return (
                    predicate +
                    " " +
                    objects.map((object) => object.toString()).join(" , ")
                );
            })
            .join(" ; ")} .`;
    }

    public async semantize(context?: Resource): Promise<void> {
        // semantize and send it to the server
    }
}

export class Triple {
    private subject: Resource;
    private predicate: Resource;
    private object: Resource;

    constructor(subject: string, predicate: string, object: string) {
        this.subject = new Resource(subject);
        this.predicate = new Resource(predicate);
        this.object = new Resource(object);
    }

    public toString(): string {
        return `<<${this.subject} ${this.predicate} ${this.object}>>`;
    }
}

export class Resource {
    private id: string;

    constructor(id: string) {
        this.id = id;
    }

    public toString(): string {
        if (this.id === "a") return "a";
        else return process.env.ONTOLOGY_PREFIX + this.id;
    }
}

export type DataType =
    | "string"
    | "integer"
    | "boolean"
    | "dateTime"
    | "dateTimeDuration";

export class XSDData {
    private value: string;
    private type: DataType;

    constructor(value: string, type: DataType) {
        this.value = value;
        this.type = type;
    }

    toString(): string {
        return `"${this.value}"^^xsd:${this.type}`;
    }
}

export type Subject = Resource | Triple;
export type Predicate = Resource;
export type Object = Resource | XSDData;
