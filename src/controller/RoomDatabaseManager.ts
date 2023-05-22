import JSZip from "jszip";
import {GeoResponse, Room} from "./Room";
import {InsightError} from "./IInsightFacade";
import treeAdapter from "parse5/lib/tree-adapters/default";
import parse5, {Attribute, Document, Element} from "parse5";
import {Building} from "./Building";
import * as http from "http";
import {IncomingMessage} from "http";

export default class RoomDatabaseManager {
	private buildingsFromIndex: Building[] = [];
	private listOfGeoResponses: GeoResponse[] = [];
	private arrayOfBuildingInformation: string[] = ["", "", "", ""];
	private arrayOfRoomInformation: string[] = ["", "", "", "", ""];
	public getAllZipRoomData(id: string, zip: JSZip, indexContent: string): Promise<Room[]> {
		return new Promise<Room[]>( (resolve) => {
			let rooms: Room[] = [];
			let promisedData: any[] = [];
			this.handleIndexHtm(indexContent);
			if (this.buildingsFromIndex.length === 0) {
				throw new InsightError("Invalid dataset. No rooms are linked from index.htm.");
			}
			this.getGeoResponseForBuildings().then((r: GeoResponse[]) => {
				this.listOfGeoResponses = r;
				zip.folder("rooms")?.forEach( (relativePath: string, file: any) => {
					for (let building of this.buildingsFromIndex) {
						let buildingPath = building.hrefBuilding.slice(2);
						if (relativePath === buildingPath) {
							promisedData.push(this.parseAndPushAllLinkedRooms(file, rooms, building));
						}
					}
				});
				Promise.all(promisedData)
					.then(() => {
						this.buildingsFromIndex = [];
						this.listOfGeoResponses = [];
						resolve(rooms);
					});
			});
		});
	}

	private async parseAndPushAllLinkedRooms(file: any, rooms: Room[], building: Building): Promise<Room> {
		return file.async("string")
			.then((stringData: string) => {
				const options = {treeAdapter};
				let htmlData = parse5.parse(stringData, options);
				this.parseAndPushLinkedRooms(htmlData, building, rooms);
			}).catch((err: any) => {
				// skip this file
				return;
			});
	}

	private parseAndPushLinkedRooms(data: any, building: Building, rooms: Room[]) {
		if (RoomDatabaseManager.isLeafNode(data)) {
			return;
		}
		for (let item of data.childNodes) {
			if (item.tagName === "table" || item.tagName === "table") {
				this.processHtmlTableForRoom(item, building, rooms);
				break;
			}
			this.parseAndPushLinkedRooms(item, building, rooms);
		}
	}

	private processHtmlTableForRoom(table: any, building: Building, rooms: Room[]) {
		if (RoomDatabaseManager.isLeafNode(table)) {
			return;
		}
		let row: Element;
		for (row of table.childNodes) {
			if (row.nodeName !== "thead" && row.nodeName !== "tfoot") {
				this.processTableItemsForRoom(row, building, [], rooms);
			}
		}
	}

	private processTableItemsForRoom(row: Element, building: Building, attributes: Attribute[], rooms: Room[]) {
		if (RoomDatabaseManager.isLeafNode(row)) {
			return;
		}
		let item: any;
		for (item of row.childNodes) {
			if (item.tagName === "td" || item.nodeName === "td") {
				attributes = item.attrs;
			} else if (item.tagName === "tr" || item.nodeName === "tr"){
				this.arrayOfRoomInformation = ["", "", "", "", ""]; // number, capacity, furniture, type, href of building
			}
			if (!RoomDatabaseManager.isLeafNode(item)) {
				this.processTableItemsForRoom(item, building, attributes, rooms);
			}
			if (treeAdapter.isTextNode(item) && item.nodeName === "#text") {
				let trimmedValueString: string = item.value.trim();
				if (trimmedValueString.length !== 0) {
					this.evaluateAttributeValuesForRoom(item, attributes);
				}
			}
			if(this.arrayOfRoomInformation[4] !== "") {
				this.createRoom(building, rooms);
				this.arrayOfRoomInformation = ["", "", "", "", ""];
			}
		}
	}

	private handleIndexHtm(stringData: string) {
		if (stringData === ""){
			throw new InsightError("Invalid index.htm.");
		}
		const options = {treeAdapter};
		try {
			let htmlData: Document = parse5.parse(stringData, options);
			if (!RoomDatabaseManager.isLeafNode(htmlData)) {
				this.findRoomsInIndex(htmlData.childNodes);
			}
		} catch (err) {
			throw new InsightError("There's been a problem parsing index.htm.");
		}
	}

	private findRoomsInIndex(childNodes: any[]) {
		for (let item of childNodes) {
			if (item.tagName === "table") {
				this.processHtmlTableForBuilding(item);
				break;
			}
			if(!RoomDatabaseManager.isLeafNode(item)) {
				let children = treeAdapter.getChildNodes(item);
				this.findRoomsInIndex(children);
			}
		}
	}

	private processHtmlTableForBuilding(table: any) {
		if (RoomDatabaseManager.isLeafNode(table)) {
			return;
		}
		let row: Element; // Each row is a building!
		for (row of table.childNodes) {
			if (row.nodeName !== "thead" && row.nodeName !== "tfoot") {
				this.processHtmlTableItemsForBuilding(row, []);
			}
		}
	}

	private processHtmlTableItemsForBuilding(row: any, attributes: Attribute[]) {
		if (RoomDatabaseManager.isLeafNode(row)) {
			return;
		}
		let item: Element;
		for (item of row.childNodes) {
			if (item.tagName === "td" || item.nodeName === "td") {
				attributes = item.attrs;
			} else if (item.tagName === "tr" || item.nodeName === "tr") {
				this.arrayOfBuildingInformation = ["", "", "", ""]; // fullname, shortname, address, href of building
			}
			if (!RoomDatabaseManager.isLeafNode(item)) {
				this.processHtmlTableItemsForBuilding(item, attributes);
			}
			if (treeAdapter.isTextNode(item) && item.nodeName === "#text") {
				let trimmedValueString: string = item.value.trim();
				if (trimmedValueString.length !== 0) {
					this.evaluateAttributesBuilding(item, attributes);
				}
			}
			if (this.arrayOfBuildingInformation[3] !== "") {
				this.createBuilding();
				this.arrayOfBuildingInformation = ["", "", "", ""];
			}
		}
	}

	private evaluateAttributesBuilding(item: any, attributes: Attribute[]) {
		let trimmedValue: string = item.value.trim();
		for (let attribute of attributes) {
			if (attribute.value.includes("building-code")) {
				this.arrayOfBuildingInformation[1] = trimmedValue;
			} else if (attribute.value.includes("building-address")) {
				this.arrayOfBuildingInformation[2] = trimmedValue;
			} else if (attribute.value.includes("field-title")) {
				this.arrayOfBuildingInformation[0] = trimmedValue;
			} else if (attribute.value.includes("field-nothing")) {
				this.arrayOfBuildingInformation[3] = RoomDatabaseManager.getHref(item);
			}
		}
	}

	private static isLeafNode(item: any) {
		return item.childNodes === undefined || item.childNodes.length === 0;
	}

	private evaluateAttributeValuesForRoom(item: any, attributes: Attribute[]) {
		let trimmedValue: string = item.value.trim();
		for (let attribute of attributes) {
			if (attribute.value.includes("room-capacity")) {
				this.arrayOfRoomInformation[1] = trimmedValue;
			} else if (attribute.value.includes("room-number")) {
				this.arrayOfRoomInformation[0] = trimmedValue;
			} else if (attribute.value.includes("room-furniture")) {
				this.arrayOfRoomInformation[2] = trimmedValue;
			} else if (attribute.value.includes("room-type")) {
				this.arrayOfRoomInformation[3] = trimmedValue;
			} else if (attribute.value.includes("field-nothing")) {
				this.arrayOfRoomInformation[4] = RoomDatabaseManager.getHref(item);
			}
		}
	}

	private getGeoResponseForBuildings(): Promise<GeoResponse[]> {
		return new Promise<GeoResponse[]>((resolve, reject) => {
			let promisedData: any[] = [];
			for (let building of this.buildingsFromIndex) {
				let addressForUrl: string = building.address.replaceAll(" ", "%20");
				let fullUrl: string = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team685/" + addressForUrl;
				promisedData.push(this.getGeoResponseForBuilding(fullUrl,building));
			}
			Promise.allSettled(promisedData)
				.then(() => {
					resolve(this.listOfGeoResponses);
				});
		});
	}

	private createBuilding() {
		let building: Building = {
			fullname: this.arrayOfBuildingInformation[0], shortname: this.arrayOfBuildingInformation[1],
			address: this.arrayOfBuildingInformation[2], hrefBuilding: this.arrayOfBuildingInformation[3],
			geoLocation: {error: "GeoLocation hasn't been fetched yet."}
		};
		this.buildingsFromIndex.push(building);
	}

	private static getHref(item: any) {
		let parent: Element = item.parentNode;
		if (parent.tagName === "a" || parent.nodeName === "a") {
			let attributesList = treeAdapter.getAttrList(parent);
			return attributesList[0].value;
		}
		return "";
	}

	private createRoom(building: Building, rooms: Room[]) {
		let bGeo = building.geoLocation;
		if (bGeo.error !== undefined || (bGeo.lat === undefined && bGeo.lon === undefined)) {
			return; // skip this room
		}
		if (isNaN(Number(this.arrayOfRoomInformation[1]))) {
			return; // skip this room
		}
		let room: Room = {
			fullname: building.fullname, shortname: building.shortname, address: building.address,
			number: this.arrayOfRoomInformation[0], name: building.shortname + "_" + this.arrayOfRoomInformation[0],
			lat: bGeo.lat as number,  lon: bGeo.lon as number, seats: Number(this.arrayOfRoomInformation[1]),
			type: this.arrayOfRoomInformation[3], furniture: this.arrayOfRoomInformation[2],
			href: this.arrayOfRoomInformation[4]
		};
		rooms.push(room);
	}

	private addGeoLocationToBuildings() {
		if (this.listOfGeoResponses.length !== this.buildingsFromIndex.length){
			throw new InsightError("Some geolocations couldn't be fetched (even with an error).");
		}
		let count: number = 0;
		let buildingListLength: number = this.buildingsFromIndex.length;
		for(let geoResult of this.listOfGeoResponses) {
			if(count > buildingListLength){
				throw new InsightError("Somehow, there were extra geolocations that were fetched.");
			}
			this.buildingsFromIndex[count].geoLocation = geoResult;
			count++;
		}
	}

	private getGeoResponseForBuilding(url: string, building: Building): Promise<GeoResponse> {
		return new Promise<GeoResponse>((resolve, reject) => {
			http.get(url, (res: IncomingMessage) => {
				let rawData = "";
				res.on("data", (chunk: any) => {
					rawData += chunk;
				});
				res.on("end", () => {
					try {
						const parsedData = JSON.parse(rawData);
						this.listOfGeoResponses.push({lat: parsedData["lat"], lon: parsedData["lon"]});
						building.geoLocation = {lat: parsedData["lat"], lon: parsedData["lon"]};
						resolve({lat: parsedData["lat"], lon: parsedData["lon"]});
					} catch (e) {
						this.listOfGeoResponses.push({error: "GeoResponse cannot be fetched"});
						reject({error: "GeoResponse cannot be fetched"});
					}
				});
			}).on("error", () => {
				this.listOfGeoResponses.push({error: "GeoResponse cannot be fetched"});
				reject({error: "GeoResponse cannot be fetched"});
			});
		});
	}
}
