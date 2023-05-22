import {InsightDataset, InsightDatasetKind, InsightError, NotFoundError} from "./IInsightFacade";
import JSZip from "jszip";
import fs from "fs";
import {CourseSection} from "./CourseSection";
import {Room} from "./Room";
import CourseDatabaseManager from "./CourseDatabaseManager";
import RoomDatabaseManager from "./RoomDatabaseManager";
import {isDefined} from "./Util";

export default class DatabaseManager {

	public dataSetIds: string[] = [];
	private insightDatasets: InsightDataset[] = [];
	private datasets: {[id: string]: CourseSection[] | Room[]} = {};
	private courseDBManager: CourseDatabaseManager = new CourseDatabaseManager();
	private roomDBManager: RoomDatabaseManager = new RoomDatabaseManager();
	private indexContent: string = "";

	constructor() {
		this.dataSetIds = [];
		this.insightDatasets = [];
		this.datasets = {};
		this.courseDBManager = new CourseDatabaseManager();
		this.roomDBManager = new RoomDatabaseManager();
		this.indexContent = "";
	}

	public getDataFromId(id: string): CourseSection[] | Room[] {
		return this.datasets[id];
	}

	public containsId(id: string): boolean {
		return this.dataSetIds.indexOf(id) !== -1;
	}

	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		return new Promise<string[]>((resolve, reject) => {
			let jsZip: JSZip = new JSZip();
			let stringData: string | undefined;
			DatabaseManager.createDataFolder();
			this.assertValidIdOnAdd(id);
			return jsZip.loadAsync(content, {base64: true})
				.then(async (zip: JSZip) => {
					switch (kind) {
						case InsightDatasetKind.Courses:
							this.courseDBManager.getAllZipSectionData(id, zip).then((newDataset: CourseSection[]) => {
								this.saveDataset(newDataset, id, kind);
								resolve(this.dataSetIds);
							}).catch((err) => {
								if (!(err instanceof InsightError)) {
									reject(new InsightError("Not a zip."));
								}
								reject(err);
							});
							break;
						case InsightDatasetKind.Rooms:
							stringData = await zip.file("rooms/index.htm")?.async("string");
							if (stringData !== undefined) {
								this.indexContent = stringData;
							}
							this.roomDBManager.getAllZipRoomData(id, zip, this.indexContent)
								.then((newDataset: Room[]) => {
									this.saveDataset(newDataset, id, kind);
									resolve(this.dataSetIds);
								}).catch((err) => {
									if (!(err instanceof InsightError)) {
										reject(new InsightError("Not a zip."));
									}
									reject(err);
								});
							break;
					}
				}).catch((err) => {
					if (!(err instanceof InsightError)) {
						reject(new InsightError("Not a zip."));
					}
					reject(err);
				});
		});
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return new Promise<InsightDataset[]>((resolve) => {
			resolve(this.insightDatasets);
		});
	}

	public removeDataset(id: string): Promise<string> {

		return new Promise<string>((resolve) => {
			this.assertValidIdOnRemove(id);
			let indexOfIdInLists: number = this.dataSetIds.indexOf(id);
			this.dataSetIds.splice(indexOfIdInLists, 1);
			this.insightDatasets.splice(indexOfIdInLists, 1);
			delete this.datasets[id];
			fs.unlink("./data/" + id, function (err) {
				if (err) {
					throw err;
				}
			});
			resolve(id);
		});
	}

	private static createDataFolder() {
		if (!(fs.existsSync("./data/"))) {
			fs.mkdirSync("./data/");
		}
	}

	private saveDataset(courseSectionsOrRooms: CourseSection[] | Room[], id: string, kind: InsightDatasetKind) {
		if (courseSectionsOrRooms?.length === 0 || courseSectionsOrRooms === undefined) {
			throw new InsightError("No Valid Sections in dataset");
		}
		this.dataSetIds.push(id);
		switch (kind) {
			case InsightDatasetKind.Courses:
				this.insightDatasets.push({
					id: id,
					kind: InsightDatasetKind.Courses,
					numRows: courseSectionsOrRooms.length
				} as InsightDataset);
				this.datasets[id] = courseSectionsOrRooms;
				if (fs.existsSync("./data/")) {
					fs.writeFileSync("./data/" + id, JSON.stringify(courseSectionsOrRooms), "utf8");
				}
				break;
			case InsightDatasetKind.Rooms:
				this.insightDatasets.push({
					id: id,
					kind: InsightDatasetKind.Rooms,
					numRows: courseSectionsOrRooms.length
				} as InsightDataset);
				this.datasets[id] = courseSectionsOrRooms;
				if (fs.existsSync("./data/")) {
					fs.writeFileSync("./data/" + id, JSON.stringify(courseSectionsOrRooms), "utf8");
				}
				break;
		}
	}

	private assertValidIdOnAdd(id: string) {
		if ((/^[^_]+$/.test(id) && /\S/.test(id) && this.datasets[id] === undefined)) {
			return;
		} else {
			throw new InsightError("Invalid Dataset Id");
		}
	}

	public assertValidIdOnRemove(id: string) {
		if (!(/^[^_]+$/.test(id) && /\S/.test(id))) {
			throw new InsightError("Invalid Dataset Id");
		} else if (this.dataSetIds.indexOf(id) === -1) {
			throw new NotFoundError("Dataset Not Found");
		} else {
			return;
		}
	}

	public addDataFolder() {
		DatabaseManager.createDataFolder();
		let filenames = fs.readdirSync("./data/");
		if(this.dataSetIds.length < filenames.length) {
			for (let filename of filenames) {
				let content = fs.readFileSync("./data/" + filename, "utf-8");
				if (this.dataSetIds.indexOf(filename) === -1) {
					if (isDefined(JSON.parse(content)[0].avg)) {
						this.saveDataset(JSON.parse(content), filename, InsightDatasetKind.Courses);
					} else {
						this.saveDataset(JSON.parse(content), filename, InsightDatasetKind.Rooms);
					}
				}
			}
		}
	}
}


