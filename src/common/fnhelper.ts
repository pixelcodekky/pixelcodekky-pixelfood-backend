import { Feature } from './types';

export const geocodingmapping = (results: any):Feature[] => {
    let obj = results;
    let collections:Feature[] = [];
    if(obj['features']){
        for(let i=0;i<obj['features'].length;i++){
            collections.push(obj['features'][i]);
        }
    }
    

    return collections;
}