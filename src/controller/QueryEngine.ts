import {InsightError, InsightResult, ResultTooLargeError} from "./IInsightFacade";
import DatabaseManager from "./DatabaseManager";
import QueryValidator from "./QueryValidator";
import {filter} from "jszip";
import ApplyRule from "./ApplyRule";


export default class QueryEngine {
	private databaseManager: DatabaseManager;
	private queryValidator: QueryValidator;

	constructor(databaseManager: DatabaseManager) {
		this.databaseManager = databaseManager;
		this.queryValidator = new QueryValidator(databaseManager);
	}

	public performQuery(query: any): Promise<InsightResult[]> {
		return new Promise<InsightResult[]>((resolve, reject) => {
			try {
				this.queryValidator.validateQuery(query);
				try {
					let where: any = query["WHERE"];
					let options: any = query["OPTIONS"];
					let columns: string[] = options["COLUMNS"];
					let order: any = options["ORDER"];
					let transformations: any = query["TRANSFORMATIONS"];
					let datasetId: string = QueryEngine.getDatasetId(columns, transformations);
					let rawData: InsightResult[] = this.databaseManager.getDataFromId(datasetId);
					let filteredData: InsightResult[] = QueryEngine.executeFilter(where, rawData);
					let transformedData: InsightResult[];
					if(filteredData.length === 0) {
						resolve(filteredData);
					}
					if(typeof transformations === "undefined") {
						transformedData = filteredData;
					} else {
						transformedData = QueryEngine.executeTransform(transformations, filteredData);
					}
					let orderedData: InsightResult[] = QueryEngine.executeOrder(order, transformedData);
					let selectedData: InsightResult[] = QueryEngine.executeColumnsAndTransform(columns, orderedData);
					if (selectedData.length > 5000) {
						reject(new ResultTooLargeError("More than 5000 results found. Please try another query."));
					} else {
						resolve(selectedData);
					}
				} catch (e) {
					reject(new InsightError("Unknown Error has occured"));
				}
			} catch (err) {
				reject(err);
			}
		});
	}

	private static executeOrder(orderBy: any, filteredData: InsightResult[]): InsightResult[] {
		let finalData = filteredData;
		if (orderBy !== undefined) {
			if (typeof orderBy === "string") {
				let queryKey = QueryEngine.getQueryKey(orderBy);
				if (typeof finalData[0][queryKey] === "string") {
					finalData.sort((a, b) => {
						return String(a[queryKey]).localeCompare(String(b[queryKey]));
					});
				} else if (typeof finalData[0][queryKey] === "number") {
					finalData.sort((a, b) => (a[queryKey] > b[queryKey]) ? 1 : -1);
				}
				return finalData;
			} else {
				let dir: string = orderBy.dir;
				if (typeof dir === "undefined" || dir === null) {
					dir = "UP";
				}
				let keys: string[] = orderBy.keys;
				finalData.sort((a, b) => QueryEngine.recursiveCompare(a, b, keys, dir));
				return filteredData;
			}
		} else {
			return finalData;
		}
	}

	private static recursiveCompare(a: any, b: any, keys: string[], dir: string): number {
		if (keys.length === 0 || typeof keys === "undefined") {
			return 0;
		}
		let queryKey = QueryEngine.getQueryKey(keys[0]);
		if ((a[queryKey] === b[queryKey])) {
			return QueryEngine.recursiveCompare(a, b, keys.slice(1), dir);
		}
		if (typeof a[queryKey] === "string") {
			if (dir === "UP") {
				return String(a[queryKey]).localeCompare(String(b[queryKey]));
			} else {
				return String(b[queryKey]).localeCompare(String(a[queryKey]));
			}
		} else if (typeof a[queryKey] === "number") {
			if (dir === "UP") {
				return (a[queryKey] > b[queryKey]) ? 1 : -1;
			} else {
				return (b[queryKey] > a[queryKey]) ? 1 : -1;
			}
		} else {
			return 0;
		}
	}

	private static executeColumnsAndTransform(columnsList: string[], data: InsightResult[]): InsightResult[] {
		let result: InsightResult[] = [];
		for (let datum of data) {
			let outputDatum: InsightResult = {};
			for (let column of columnsList) {
				let queryKey = QueryEngine.getQueryKey(column);
				outputDatum[column] = datum[queryKey];
			}
			result.push(outputDatum);
		}
		return result;
	}

	private static executeFilter(filterObj: any, data: InsightResult[]): InsightResult[] {
		let keys: any[] = Object.keys(filterObj);
		if (keys.length !== 0) {
			let dataSoFar: InsightResult[] = [];
			let currentFilter: string = keys[0];
			let nextFilters: object[] = filterObj[currentFilter];
			switch (currentFilter) {
				case "AND":
					dataSoFar = QueryEngine.executeAND(nextFilters, data);
					break;
				case "OR":
					dataSoFar = QueryEngine.executeOR(nextFilters, data);
					break;
				case "NOT":
					dataSoFar = QueryEngine.executeNOT(nextFilters, data);
					break;
				case "IS":
					dataSoFar = QueryEngine.executeIS(nextFilters, data);
					break;
				case "EQ":
				case "LT":
				case "GT":
					dataSoFar = QueryEngine.executeIntCompare(currentFilter, nextFilters, data);
					break;
			}
			return dataSoFar;
		}
		return data;
	}

	private static executeAND(ANDMembers: object[], data: InsightResult[]) {
		let andResult: InsightResult[] = data;
		for (let member of ANDMembers) {
			andResult = QueryEngine.executeFilter(member, andResult);
		}
		return andResult;
	}

	private static executeOR(ORMembers: object[], data: InsightResult[]) {
		let finalOrResult = new Set<InsightResult>();
		for (let member of ORMembers) {
			QueryEngine.executeFilter(member, data).forEach((section) => finalOrResult.add(section));
		}
		return Array.from(finalOrResult);
	}

	private static executeNOT(NOTMembers: object[], data: InsightResult[]) {
		let positiveResult: InsightResult[] = QueryEngine.executeFilter(NOTMembers, data);
		return data.filter((section) => !positiveResult.includes(section));
	}

	private static executeIS(ISComparison: object, data: InsightResult[]) {
		let isResult: InsightResult[] = [];
		let filterKey = Object.keys(ISComparison)[0];
		let queryKey = QueryEngine.getQueryKey(filterKey);
		let compareString: string = Object.values(ISComparison)[0];

		if (compareString.indexOf("*") === -1) {
			// EXACT
			isResult = data.filter((datum) => datum[queryKey] === compareString);
		} else if ((compareString.slice(0, 1) === "*") && compareString.slice(-1) === "*") {
			// INCLUDES
			compareString = compareString.slice(1, -1);
			isResult = data.filter((datum) => String(datum[queryKey]).includes(compareString));
		} else if (compareString.slice(0, 1) === "*") {
			// ENDS-WITH
			compareString = compareString.slice(1);
			isResult = data.filter((datum) => String(datum[queryKey]).endsWith(compareString));
		} else if (compareString.slice(-1) === "*") {
			// STARTS-WITH
			compareString = compareString.slice(0, -1);
			isResult = data.filter((datum) => String(datum[queryKey]).startsWith(compareString));
		}

		return isResult;
	}

	private static executeIntCompare(comparisonType: string, numberComparison: object, data: InsightResult[]) {
		let compareResult: InsightResult[] = [];
		let filterKey = Object.keys(numberComparison)[0];
		let queryKey = this.getQueryKey(filterKey);
		let compareNumber: number = Object.values(numberComparison)[0];

		switch (comparisonType) {
			case "GT":
				compareResult = data.filter((datum) => datum[queryKey] > compareNumber);
				break;
			case "LT":
				compareResult = data.filter((datum) => datum[queryKey] < compareNumber);
				break;
			case "EQ":
				compareResult = data.filter((datum) => datum[queryKey] === compareNumber);
				break;
		}

		return compareResult;
	}

	private static getQueryKey(queryKey: string) {
		return queryKey.indexOf("_") !== -1 ? queryKey.split("_")[1] : queryKey;
	}

	private static executeTransform(transformations: any, data: InsightResult[]) {
		let groupKeys: string[] = transformations["GROUP"];
		let groups: Map<string, InsightResult[]> = QueryEngine.createGroups(groupKeys, data);

		let rawRules = transformations["APPLY"];
		let rules: ApplyRule[] = [];
		for(let rule of rawRules) {
			rules.push(new ApplyRule(rule));
		}

		let results: InsightResult[] = [];

		for(let group of groups.values()) {
			for(let i = 1; i < group.length; i++) {
				for(let rule of rules) {
					rule.update(group[i]);
				}
			}
			let newResult: InsightResult = group[0];

			for(let rule of rules) {
				newResult[rule.newColumn] = rule.getResult();
				rule.resetValues();
			}

			results.push(newResult);
		}

		return results;
	}

	private static createGroups(groupKeys: string[], data: InsightResult[]) {
		let groups: Map<string, InsightResult[]> = new Map<string, InsightResult[]>();
		for(let datum of data) {
			let hashKey: string = QueryEngine.createHash(groupKeys, datum);
			if(groups.has(hashKey)) {
				groups.get(hashKey)?.push(datum);
			} else {
				let base: InsightResult = {};
				for(let key of groupKeys) {
					base[QueryEngine.getQueryKey(key)] = datum[QueryEngine.getQueryKey(key)];
				}
				let group: InsightResult[] = [base, datum];
				groups.set(hashKey, group);
			}
		}
		return groups;
	}

	private static createHash(groupKeys: string[], datum: InsightResult): string {
		let hashKey: string = "";

		for(let key of groupKeys) {
			let queryKey = QueryEngine.getQueryKey(key);
			hashKey += String(datum[queryKey]) + ",";
		}

		return hashKey.slice(0, -1);
	}

	private static getDatasetId(columns: string[], transformations: any) {
		if(typeof transformations !== "undefined" && transformations != null) {
			return transformations["GROUP"][0].split("_")[0];
		} else {
			return columns[0].split("_")[0];
		}
	}
}
