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



