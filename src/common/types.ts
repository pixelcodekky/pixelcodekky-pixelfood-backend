export type RestaurantSearchResponse = {
    data: Restaurant[],
    pagination: {
        total: number;
        page: number;
        pages: number;
    },
}

export type Coordinates = {
    lat: number;
    lng: number;
}

export type Restaurant = {
    _id: string;
    user: string;
    restaurantName: string;
    city: string;
    country: string;
    deliveryPrice: number;
    estimatedDeliveryTime: number;
    cuisines: string[];
    menuItems: MenuItem[];
    imageUrl: string;
    address: [{
        display_name: string;
        name: string;
        lat: number;
        lon: number;
        city: string;
        country: string;
        country_code: string;
        postcode: string;
    }],
    distance?:number,
}

export type MenuItem = {
    _id: string;
    name: string;
    price: number;
}

export type RestaurantRequestPayload = {
    searchQuery: string;
    page: number;
    selectedCuisines: string;
    sortOption: string;
    latitude: number;
    longtitude: number;
}

export interface Feature {
    type: string;
    id: string;
    geometry: {
      type: string;
      coordinates: [number, number]; // [longitude, latitude]
    };
    properties: {
        bbox?:[],
      mapbox_id: string;
      feature_type: string; // Can be "address" or "street"
      full_address: string;
      name: string;
      name_preferred: string;
      coordinates: {
        longitude: number;
        latitude: number;
        accuracy?: string; // Optional property for "address" features
        routable_points?: Array<{
          name: string;
          latitude: number;
          longitude: number;
        }>; // Optional property for "address" features
      };
      place_formatted: string;
      match_code?: { // Optional property for "address" features
        address_number: string;
        street: string;
        postcode:string;
        place:string;
        region: string;
        locality:string;
        country: string;
        confidence: string;
      };
      context: {
        address?: { // Optional property for "street" features
          mapbox_id: string;
          address_number: string;
          street_name: string;
          name: string;
        };
        street: {
          mapbox_id: string;
          name: string;
        };
        postcode: {
          mapbox_id: string;
          name: string;
        };
        locality: {
          mapbox_id: string;
          name: string;
          wikidata_id?: string; // Optional property
        };
        place: {
          mapbox_id: string;
          name: string;
          wikidata_id?: string; // Optional property
        };
        district?: { // Optional property
          mapbox_id: string;
          name: string;
          wikidata_id?: string; // Optional property
        };
        region: {
          mapbox_id: string;
          name: string;
          wikidata_id: string;
          region_code: string;
          region_code_full: string;
        };
        country: {
          mapbox_id: string;
          name: string;
          wikidata_id: string;
          country_code: string;
          country_code_alpha_3: string;
        };
      };
    };
  }



