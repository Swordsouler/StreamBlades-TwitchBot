import { Connection, query } from "stardog";

export class RDFBase {
    private static connection = new Connection({
        username: process.env.STARDOG_USERNAME,
        password: process.env.STARDOG_PASSWORD,
        endpoint: process.env.STARDOG_ENDPOINT,
    });

    private subject: Subject;
    private properties: Map<string, string[]>;

    public get resource(): Resource {
        return this.subject as Resource;
    }

    constructor(subject: Subject) {
        this.subject = subject;
        this.properties = new Map<string, string[]>();
    }

    public addProperty(predicate: Predicate, object: Object): Triple {
        const predicateString = predicate.toString();
        if (!this.properties.has(predicateString))
            this.properties.set(predicateString, []);

        const objectString = object.toString();
        if (!this.properties.get(predicateString)?.includes(objectString))
            this.properties.get(predicateString)?.push(objectString);

        return new Triple(
            this.subject as Resource,
            predicate as Resource,
            object as Resource
        );
    }

    public toString(): string {
        return `${this.subject} ${Array.from(this.properties.entries())
            .map(([predicate, objects]) => {
                return (
                    predicate +
                    " " +
                    objects.map((object) => object.toString()).join(" ,\n\t\t")
                );
            })
            .join(" ;\n\t")} .`;
    }

    public async semantize(context?: Resource): Promise<void> {
        let toSemantize = this.toString();
        if (context) toSemantize = `graph ${context} {\n${toSemantize}\n}`;

        //console.log(toSemantize);
        const updateQuery = `INSERT DATA { ${toSemantize} }`;
        try {
            const result = await query.execute(
                RDFBase.connection,
                process.env.STARDOG_DATABASE,
                updateQuery
            );
            console.log(result.status);
        } catch (error) {
            console.error(error);
        }
    }
}

export class Triple {
    private subject: Resource;
    private predicate: Resource;
    private object: Resource;

    constructor(subject: Resource, predicate: Resource, object: Resource) {
        this.subject = subject;
        this.predicate = predicate;
        this.object = object;
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
        return process.env.ONTOLOGY_PREFIX + this.id;
    }
}

export type DataType = "string" | "integer" | "boolean" | "dateTime";

export class XSDData {
    private value: string;
    private type: DataType;

    constructor(value: string | number | boolean, type: DataType) {
        this.value = value.toString();
        this.type = type;
    }

    toString(): string {
        return `"${this.value}"^^xsd:${this.type}`;
    }
}

export type Subject = Resource | Triple;
export type Predicate = Resource | string;
export type Object = Resource | XSDData;
