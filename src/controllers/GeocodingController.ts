import {Request, Response} from 'express';
import { geocodingmapping } from '../common/fnhelper';
import { Feature } from '../common/types';

const MAPBOX_GEOCODING_URL = process.env.MAPBOX_GEOCODING_URL as string
const MAPBOX_API_KEY = process.env.MAPBOX_API_KEY as string
const MAPBOX_GEOCODING_STATIC_MAP_URL = process.env.MAPBOX_GEOCODING_STATIC_MAP_URL as string

const getGeocodingStaticMap = async (req: Request, res:Response) => {
    try {
        const accessToken = MAPBOX_API_KEY;
        const baseUrl = `${MAPBOX_GEOCODING_STATIC_MAP_URL}`

        const {lat, lon} = req.params;
        //overlay,lon,lat,zoom,size
        const size = '800x400';
        const location = `${lon},${lat},16`;
        const geoJson = `geojson({"type": "Point", "coordinates": [${lon},${lat}]})`;
        const url = `${baseUrl}${geoJson}/${location}/${size}?access_token=${accessToken}`;

        const resStaticImg = await fetch(`${url}`);

        if(resStaticImg.status === 404){
            return res.status(404).json({
                    message: 'Map Not found', 
                    payload: ''
            });
        }
        
        if(!resStaticImg.ok){
            return res.status(resStaticImg.status).json({
                message: 'Error fetching static map',
                payload: await resStaticImg.text()
            })
        }

        const buffer = await resStaticImg.arrayBuffer();
        const base64String = `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`;

        return res.status(200).json({
            message: 'Map fetched successfully',
            payload: base64String,
        });
    } catch (error) {
        console.log(error);
        return res.status(404).json({message: 'Internal error', payload: ''});
    }
}

const getGeocodingForward = async (req: Request, res: Response) => {
    try {
        const accessToken = MAPBOX_API_KEY;
        const url = `${MAPBOX_GEOCODING_URL}forward?`

        const {value} = req.params;

        const buildParams = {
            q:value,
            limits: "5",
            country: "sg",
            types:"postcode,address,secondary_address,street",
            access_token: accessToken,
        }

        const queryString = new URLSearchParams(buildParams).toString();

        const reqOptions = {
            method: 'GET',
        }

        const result = await fetch(`${url}${queryString}`, reqOptions);

        if(!result.ok){
            return res.status(result.status).json({
                message: 'Error fetching',
                payload: await result.text()
            })
        }

        let data = await result.json();

        let features: Feature[] = geocodingmapping(data);

        return res.status(200).json({message: 'Features Found', payload: features});

    } catch (error) {
        console.log(error);
        return res.status(404).json({message: 'Internal error', payload: ''});
    }
}

const getGeocodingReverse = async (req:Request, res:Response) => {
    try {
        const accessToken = MAPBOX_API_KEY;
        const url = `${MAPBOX_GEOCODING_URL}reverse?`

        const {lat, lon} = req.params;

        const buildParams = {
            longitude: lon,
            latitude: lat,
            country:"sg",
            types:"postcode,address,secondary_address,street",
            access_token: accessToken
        }

        const queryString = new URLSearchParams(buildParams).toString();

        const reqOptions = {
            method: 'GET',
        }

        const result = await fetch(`${url}${queryString}`,reqOptions);

        if(!result.ok){
            console.log(res.status);
            return res.status(result.status).json({message: 'Not found', payload: ''});
        }

        const data = await result.json();

        let features: Feature[] = geocodingmapping(data);
        return res.status(200).json({
            message: 'Features Found',
            payload: features,
        })
    } catch (error) {
        console.log(error);
        return res.status(404).json({message: 'Internal error', payload: ''});
    }
}

export default {
    getGeocodingStaticMap,
    getGeocodingForward,
    getGeocodingReverse,
}


