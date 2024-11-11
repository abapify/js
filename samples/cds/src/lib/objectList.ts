import { ObjectTypes } from "./objectTypes"
import { Domain, DataElement } from "@abapify/components"

export type ObjectList = Array<DomainItem | DataElementItem>

interface DomainItem {
    type: ObjectTypes.domain,
    domain: Domain
}

interface DataElementItem {
    type: ObjectTypes.dataElement,
    dataElement: DataElement
}