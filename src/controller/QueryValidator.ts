import {InsightError, InsightResult} from "./IInsightFacade";
import DatabaseManager from "./DatabaseManager";
import {CourseSection} from "./CourseSection";
import {Room} from "./Room";
import {isDefined, isObject} from "./Util";

export default class QueryValidator {
	private databaseManager: DatabaseManager;
	private datasetId: string = "";
	private validFilterKeyMap: Map<string, string> = new Map<string, string>();
	private validColumnKeySet: Set<string> = new Set<string>();
	private validOrderKeySet: Set<string> = new Set<string>();
	private fakeCourse: CourseSection = {
		uuid: "", id: "", dept: "", title: "", section: "", instructor: "",
		avg: 1, pass: 1, fail: 1, audit: 1, year: 1
	};

	private fakeRoom: Room = {
		fullname: "", shortname: "", number: "", name: "", address: "", lat: 1,
		lon: 1, seats: 1, type: "", furniture: "", href: ""
	};

	constructor(databaseManager: DatabaseManager) {
		this.databaseManager = databaseManager;
	}

	public validateQuery(query: any) {
		try {
			this.validateTopLevelStructure(query);
			let where: any = query["WHERE"], options: any = query["OPTIONS"], transform: any = query["TRANSFORMATIONS"];
			let columns: string[] = options["COLUMNS"];
			if (isDefined(transform)) {
				this.quickValidateTransform(transform);
			}
			this.populateValidationFields(columns, transform);
			this.validateTransform(transform);
			this.validateOptions(options);
			this.validateWHERE(where);
			this.resetValidationFields();
		} catch(e) {
			if(e instanceof InsightError) {
				throw e;
			}
			this.throwInsightError("An unexpected error has occurred. Your Query is invalid.");
		}
	}

	private quickValidateTransform(transformations: any) {
		for (let keyString of Object.keys(transformations)) {
			if (keyString !== "GROUP" && keyString !== "APPLY") {
				this.throwInsightError("Extra unknown key in transformations.");
			}
		}
	}

	private validateTopLevelStructure(query: any) {
		if (!isDefined(query) || !isObject(query["WHERE"])) {
			this.throwInsightError("WHERE must be defined.");
		}
		let options: any = query["OPTIONS"];
		if (!isObject(options)) {
			this.throwInsightError("OPTIONS must be defined.");
		}
		let columns: any[] = options["COLUMNS"];
		if (!isDefined(columns) || !Array.isArray(columns) || columns.length === 0) {
			this.throwInsightError("Please select the columns you want on the table.");
		}
		for (let column of columns) {
			let x = typeof column !== "string" ?
				this.throwInsightError("Please select the columns you want on the table.") : 0;
		}
		for (let keyString of Object.keys(query)) {
			if (keyString !== "WHERE" && keyString !== "OPTIONS" && keyString !== "TRANSFORMATIONS") {
				this.throwInsightError("Extra unknown key in query.");
			}
		}
	}

	private validateTransform(transformations: any) {
		if (!isDefined(transformations)) {
			for (let key of this.validFilterKeyMap.keys()) {
				this.validColumnKeySet.add(key);
			}
			return;
		} else if (!isObject(transformations)) {
			this.throwInsightError("TRANSFORMATIONS must be an object.");
		}
		for (let keyString of Object.keys(transformations)) {
			if (keyString !== "GROUP" && keyString !== "APPLY") {
				this.throwInsightError("Extra unknown key in transformations");
			}
		}
		let group: string[] = transformations["GROUP"];
		let apply: any[] = transformations["APPLY"];
		if (!isDefined(group) || !isDefined(apply)) {
			this.throwInsightError("Both GROUP and APPLY must be specified in TRANSFORMATIONS");
		}
		for (let groupBy of group) {
			if (!this.validFilterKeyMap.has(groupBy)) {
				this.throwInsightError("Invalid group key");
			}
			this.validColumnKeySet.add(groupBy);
		}

		for (let rule of apply) {
			let columnName = Object.keys(rule)[0];
			if (columnName.indexOf("_") !== -1 || this.validFilterKeyMap.has(columnName)
				|| Object.keys(rule[columnName]).length !== 1 || this.validColumnKeySet.has(columnName)) {
				this.throwInsightError("Invalid apply key");
			}
			let ruleType = Object.keys(rule[columnName])[0];
			let targetColumn = rule[columnName][ruleType];
			if (ruleType === "AVG" || ruleType === "MIN" || ruleType === "MAX" || ruleType === "SUM") {
				if(!this.validFilterKeyMap.has(targetColumn) || this.validFilterKeyMap.get(targetColumn) !== "number") {
					this.throwInsightError("Invalid apply key");
				}
			} else if (ruleType === "COUNT") {
				if (!this.validFilterKeyMap.has(targetColumn)) {
					this.throwInsightError("Invalid apply key");
				}
			} else {
				this.throwInsightError("Invalid apply rule type");
			}
			this.validColumnKeySet.add(columnName);
		}
	}

	private validateOptions(options: any) {
		let order: any = options["ORDER"];
		let columns: string[] = options["COLUMNS"];
		for (let key of columns) {
			if (!this.validColumnKeySet.has(key)) {
				this.throwInsightError("Invalid Column key");
			}
			this.validOrderKeySet.add(key);
		}
		if (typeof order === "string") {
			if (!this.validOrderKeySet.has(order)) {
				this.throwInsightError("Invalid Column key");
			}
		} else if (isDefined(order)) {
			let dir = order.dir, keys = order.keys;
			if (!isDefined(dir) || !isDefined(keys)) {
				this.throwInsightError("Missing keys or dir from order");
			}
			if (dir !== "UP" && dir !== "DOWN") {
				this.throwInsightError("dir must be UP or DOWN");
			}
			for (let key of keys) {
				if (!this.validOrderKeySet.has(key)) {
					this.throwInsightError("Order keys must be in columns");
				}
			}
			for (let keyString of Object.keys(order)) {
				if (keyString !== "dir" && keyString !== "keys") {
					this.throwInsightError("Extra unknown key in order");
				}
			}
		} else if (order === null) {
			this.throwInsightError("Order is null");
		}
		for (let keyString of Object.keys(options)) {
			if (keyString !== "COLUMNS" && keyString !== "ORDER") {
				this.throwInsightError("Extra unknown key in options");
			}
		}
	}

	private validateWHERE(filter: any) {
		if (!isDefined(filter)) {
			return;
		}
		let keys: any[] = Object.keys(filter);
		if (keys.length === 1) {
			let currentFilter: string = keys[0];
			let nextFilters: object[] = filter[currentFilter];
			if (!isDefined(nextFilters)) {
				this.throwInsightError("Filter does not exist");
			}
			switch (currentFilter) {
				case "AND":
				case "OR":
					this.validateANDandOR(nextFilters);
					return;
				case "NOT":
					this.validateNOT(nextFilters);
					return;
				case "IS":
					this.validateIS(nextFilters);
					return;
				case "EQ":case "LT":case "GT":
					this.validateEQLTGT(nextFilters);
					return;
			}
			this.throwInsightError("Filter does not exist");
		} else if (keys.length > 1) {
			this.throwInsightError("More than one key in filter");
		}
	}

	private validateANDandOR(ANDORMembers: object[]) {
		if (!isDefined(ANDORMembers) || ANDORMembers.length === 0) {
			this.throwInsightError("AND or OR is missing items in the array.");
		}
		try {
			for (let filter of ANDORMembers) {
				if (!isDefined(filter)) {
					this.throwInsightError("Filter does not exist");
				}
				let keys: any[] = Object.keys(filter);
				if (keys.length !== 0) {
					this.validateWHERE(filter);
				} else {
					this.throwInsightError("No keys in filter");
				}
			}
		} catch (e) {
			if (e instanceof InsightError) {
				throw e;
			} else {
				this.throwInsightError("AND or OR not formatted correctly");
			}
		}
	}

	private validateNOT(NOTMembers: object) {
		this.validateMemberObject(NOTMembers);
		this.validateWHERE(NOTMembers);
	}

	private validateIS(ISMembers: object) {
		this.validateMemberObject(ISMembers);
		if (Object.keys(ISMembers).length > 1) {
			this.throwInsightError("More than one key inside IS");
		}
		let ISKey = Object.keys(ISMembers)[0], ISValue = Object.values(ISMembers)[0];
		if (!isDefined(ISKey) || !isDefined(ISValue)) {
			this.throwInsightError("Please enter a value for all filters");
		} else if (!this.validFilterKeyMap.has(ISKey) || this.validFilterKeyMap.get(ISKey) !== "string") {
			this.throwInsightError("Invalid Key for IS");
		} else if (typeof ISValue !== "string" || (ISValue.length > 1 && ISValue.slice(1, -1).indexOf("*") !== -1)) {
			this.throwInsightError("Invalid value for IS");
		}
	}

	private validateEQLTGT(EQLTGTMembers: object) {
		this.validateMemberObject(EQLTGTMembers);
		if (Object.keys(EQLTGTMembers).length > 1) {
			this.throwInsightError("More than one key inside < > or =");
		}
		let EQLTGTKey = Object.keys(EQLTGTMembers)[0], EQLTGTValue = Object.values(EQLTGTMembers)[0];
		if (!isDefined(EQLTGTValue) || !isDefined(EQLTGTKey)) {
			this.throwInsightError("Please enter a value for all filters");
		} else if (!this.validFilterKeyMap.has(EQLTGTKey) || this.validFilterKeyMap.get(EQLTGTKey) !== "number") {
			this.throwInsightError("Invalid Key for < > or =");
		} else if (typeof EQLTGTValue !== "number") {
			this.throwInsightError("Invalid value for < > or =");
		}
	}

	private populateValidationFields(columns: string[], trans: any) {
		this.datasetId = isDefined(trans) ? trans["GROUP"][0].split("_")[0] : columns[0].split("_")[0];
		try {
			let rawData: InsightResult[] = this.databaseManager.getDataFromId(this.datasetId);
			this.validFilterKeyMap = new Map<string, string>();
			if (typeof rawData[0].avg !== "undefined" && rawData[0].avg !== null) {
				for (let [key, value] of Object.entries(this.fakeCourse)) {
					this.validFilterKeyMap.set(this.datasetId + "_" + key, typeof value);
				}
			} else {
				for (let [key, value] of Object.entries(this.fakeRoom)) {
					this.validFilterKeyMap.set(this.datasetId + "_" + key, typeof value);
				}
			}
		} catch (err) {
			console.log(this.databaseManager.getDataFromId(this.datasetId));
			this.throwInsightError("dataset does not exist");
		}
	}

	private resetValidationFields() {
		this.datasetId = "";
		this.validFilterKeyMap.clear();
		this.validOrderKeySet.clear();
		this.validColumnKeySet.clear();
	}

	private throwInsightError(msg: string) {
		this.resetValidationFields();
		throw new InsightError(msg);
	}

	private validateMemberObject(member: object) {
		if (typeof member !== "object" || !isDefined(Object.keys(member)[0]) || Object.keys(member).length !== 1) {
			this.throwInsightError("comparator not properl formed");
		}
	}
}
