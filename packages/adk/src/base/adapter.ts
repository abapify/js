import { Spec } from "../specs/spec";

export abstract class BaseAdapter<T extends Spec<unknown>> {
    private input: T;
    constructor(input: T) {
        this.input = input;
    }
    get kind(): string {
        return this.input.kind;
    }
    get name(): string {
        return this.input.metadata.name;
    }
    get description() {
        return this.input.metadata.description;
    }
    get spec() {
        return this.input.spec;
    }
}