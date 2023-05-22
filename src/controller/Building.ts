import {GeoResponse} from "./Room";

export interface Building {
	readonly fullname: string,
	readonly shortname: string,
	readonly address: string,
	readonly hrefBuilding: string,
	geoLocation: GeoResponse
}

