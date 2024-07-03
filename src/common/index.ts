import * as fs from 'fs';
import * as path from 'path';

export interface GeocoderCustomData {
    display_name: string;
    name: string;
    lat: string;
    lon: string;
    city: string;
    country: string;
    country_code: string;
    postcode: string;
}

export const readFileSyncData = (filepath: string) => {
    try {
        let _path = path.join(__dirname, filepath);
        return fs.readFileSync(_path, 'utf-8');
    } catch (error) {
        console.error(`Error read file ${error}`);
        throw error;
    }
}

export const importAndRead = () => {

    const read1 = readFileSyncData('random_1.json');
    const read2 = readFileSyncData('random_2.json');

    let resData: any = [];

    const concactObj = (d: string) => {
        let result = <any[]>JSON.parse(d); //convert to json from string
        
        for(let i=0;i<result.length;i++){

            let customData: GeocoderCustomData = {
                display_name: '',
                name: '',
                lat: '',
                lon: '',
                city: '',
                country: '',
                country_code: '',
                postcode: ''
            }
            
            if(result[i]['address']['country_code'] === 'sg' && result[i]['address']['postcode'] !== undefined){
                customData.lat = result[i]['lat'] || '';
                customData.lon = result[i]['lon'] || '';
                customData.name = result[i]['name'] || '';
                customData.display_name = result[i]['display_name'] || '';    
                customData.city = result[i]['address']['city'] || '';
                customData.country = result[i]['address']['country'] || '';
                customData.country_code = result[i]['address']['country_code'] || '';
                customData.postcode = result[i]['address']['postcode'] || '';


                resData.push(customData);
            }
        }
    }

    concactObj(read1);
    concactObj(read2);
    
    return resData; 

}


