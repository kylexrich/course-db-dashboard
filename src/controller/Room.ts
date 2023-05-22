import {Building} from "./Building";

export interface Room {
	readonly fullname: string;
	readonly shortname: string;
	readonly address: string;
	readonly number: string;
	readonly name: string;
	readonly lat: number;
	readonly lon: number;
	readonly seats: number;
	readonly type: string;
	readonly furniture: string;
	readonly href: string;
	[key: string]: string | number;
}

export interface GeoResponse {

	lat?: number;
	lon?: number;
	error?: string;

}

// ALLARD SCHOOL OF LAW'S ROOMS:
// number -> table.tr.td[0]
// name -> !!!!
// seats -> table.tr.td[1]
// type -> table.tr.td[3]
// furniture -> table.tr.td[2]
// href -> table.tr.td[4]
