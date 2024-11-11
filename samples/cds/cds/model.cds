using { projects } from './projects';

@abap.ddic.table: 'ZPROJECTS'
annotate projects with {    
     @abap.ddic: {
        dataElement: {
            generate: true,          
            name: 'ZPROJECT_ID',
            domain: {                
                description: 'Project Id',
                dataType: 'CHAR',
                length: 32                
            }
        }
    }
    id;

     @abap.ddic: {
        dataElement: {            
            generate: true,          
            name: 'ZPROJECT_TYPE',
            domain: {                
                description: 'Project Type',
                dataType: 'CHAR',
                length: 16,
                valueTable: 'ZPROJECT_TYPES'
            }
        }
    }        
    type;
    @abap.ddic: {
        dataElement: {  
            generate: true,          
            name: 'ZPROJECT_STATUS',
            domain: {                
                description: 'Project Status',
                dataType: 'CHAR',
                length: 16                
            }
        }
    }
    status;

    @abap.ddic.dataElement: 'ZPROJECT_DESCRIPTION'
    description;
};
