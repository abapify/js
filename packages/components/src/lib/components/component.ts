import { toAbapGitXML } from "../abapgit/abapgit";

export abstract class Component<T> {
    input: T
    constructor(input: T) {
        this.input = input
    }
    abstract toAbapgit(): unknown
    abstract get abapgitSerializer(): string;
    toAbapgitXML(): string {
        return toAbapGitXML(this.toAbapgit(), this.abapgitSerializer)
    }
}