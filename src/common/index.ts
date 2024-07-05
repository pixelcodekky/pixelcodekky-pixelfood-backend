import * as fs from 'fs';
import * as path from 'path';
import { Coordinates, RestaurantSearchResponse } from './types';

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

export const haversineDistance = (pointAlonlat:[number, number], pointBlonlat:[number, number]):number => {
    const toRadians = (degrees: number): number => degrees * (Math.PI / 180);

    const [lon1, lat1] = pointAlonlat;
    const [lon2, lat2] = pointBlonlat;

    const R = 6371;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =   Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c =   2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in kilometer
}

export const calculateDistanceHelper = (payload: RestaurantSearchResponse, profile: Coordinates): RestaurantSearchResponse => {
    
    let results: RestaurantSearchResponse = {
        data: [],
        pagination: {
            total: 0,
            page: 0,
            pages: 0,
        }
    }

    if(payload.data.length === 0) return results;
    
    let pointA: [number, number] = [profile.lng, profile.lat];
    for(let restaurant of payload.data){
        let tmp = {...restaurant};
        if(tmp.address[0] !== undefined){
            let pointB: [number, number] = [tmp.address[0].lon, tmp.address[0].lat];
            let distance = haversineDistance(pointA, pointB);
            restaurant.distance = distance;
            results.data.push(restaurant);
        }else{
            results.data.push(restaurant);
        }
    }
    results.pagination = payload.pagination;
    return results;
}

export const paginateResult = (payload: RestaurantSearchResponse, pageSize: number) => {
    
    const startIndex = (payload.pagination.page - 1) * pageSize;
    const result = payload.data.slice(startIndex, startIndex + pageSize);
    return result;

}



