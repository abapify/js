entity projects {        
    key id: String;    
    type: projectTypes:projectType;    
    status: ProjectStatus;
    description: String;
}

entity projectTypes {
    key projectType: String;
    description: String;        
}

type ProjectStatus: String enum {
    created;
    cancelled;
    approved;
    rejected;
}