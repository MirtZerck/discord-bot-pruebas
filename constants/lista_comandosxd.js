import {arrayCommands} from '../commands/index.js'


export function getArrayCommandsObject() {
    let objectCommands = {};
    arrayCommands.forEach((comando =>{
        objectCommands[comando.name] = comando.alias.join(', ')
    }));

    return objectCommands;

}