import * as fs from "fs-extra";
import InsightFacade from "./InsightFacade";
import {InsightDatasetKind, InsightResult} from "./IInsightFacade";
import {expect} from "chai";
import window = Mocha.reporters.Base.window;
import {CourseSection} from "./CourseSection";

let insightFacade: InsightFacade;

// const persistDir = "./data";
// const datasetContents = new Map<string, string>();
//
// // Reference any datasets you've added to test/resources/archives here and they will
// // automatically be loaded in the 'before' hook.
// const datasetsToLoad: {[key: string]: string} = {
// 	smallCourses: "./test/resources/archives/smallCourses.zip",
// };
//
// let query = {
// 	WHERE: {
// 		OR: [
// 			{
// 				OR: [
// 					{
// 						EQ: {
// 							courses_year: 2012
// 						}
// 					},
// 					{
// 						LT: {
// 							courses_year: 2012
// 						}
// 					}
// 				]
// 			},
// 			{
// 				OR: [
// 					{
// 						EQ: {
// 							courses_year: 2012
// 						}
// 					},
// 					{
// 						GT: {
// 							courses_year: 2012
// 						}
// 					}
// 				]
// 			}
// 		]
// 	},
//
// 	OPTIONS: {
// 		COLUMNS: [
// 			"courses_avg"
// 		],
// 		ORDER: "courses_avg"
// 	}
// };
//
// for (const key of Object.keys(datasetsToLoad)) {
// 	const content = fs.readFileSync(datasetsToLoad[key]).toString("base64");
// 	datasetContents.set(key, content);
// }
// // Just in case there is anything hanging around from a previous run
// fs.removeSync(persistDir);
//
// insightFacade = new InsightFacade();
//
//
// const id: string = "courses";
// const content: string = datasetContents.get("smallCourses") ?? "";
// const expected: string[] = [id];
// Promise.resolve(insightFacade.addDataset(id, content, InsightDatasetKind.Courses))
// 	.then(() => {
// 		insightFacade.performQuery(query)
// 			.then((r) => {
// 				// console.log(r.length);
// 				// console.log(actual.length);
// 			});
// // 	});
// const persistDir = "./data";
// const datasetContents = new Map<string, string>();
//
// // Reference any datasets you've added to test/resources/archives here and they will
// // automatically be loaded in the 'before' hook.
// const datasetsToLoad: {[key: string]: string} = {
// 	smallCourses: "./test/resources/archives/smallCourses.zip",
// 	courses: "./test/resources/archives/courses.zip"
// };
//
// let query = {
// 	WHERE: {
// 		GT: {
// 			courses_avg: 97
// 		}
// 	},
// 	OPTIONS: {
// 		COLUMNS: [
// 			"courses_id",
// 			"courses_year",
// 			"avgMax",
// 			"avgMin"
// 		],
// 		ORDER: {
// 			dir: "UP",
// 			keys: [
// 				"courses_year",
// 				"courses_id"
// 			]
// 		}
// 	},
// 	TRANSFORMATIONS: {
// 		GROUP: [
// 			"courses_id",
// 			"courses_year"
// 		],
// 		APPLY: [
// 			{
// 				avgMax: {
// 					MAX: "courses_avg"
// 				}
// 			},
// 			{
// 				avgMin: {
// 					MIN: "courses_avg"
// 				}
// 			}
// 		]
// 	}
// };
//
// for (const key of Object.keys(datasetsToLoad)) {
// 	const content = fs.readFileSync(datasetsToLoad[key]).toString("base64");
// 	datasetContents.set(key, content);
// }
// // Just in case there is anything hanging around from a previous run
// fs.removeSync(persistDir);

insightFacade = new InsightFacade();
insightFacade.listDatasets();

//
// const id: string = "courses";
// const content: string = datasetContents.get("courses") ?? "";
// const expected: string[] = [id];
// Promise.resolve(insightFacade.addDataset(id, content, InsightDatasetKind.Courses))
// 	.then(() => {
// 		insightFacade.performQuery(query)
// 			.then((r) => {
// 				for(let ir of r) {
// 					console.log(JSON.stringify(ir));
// 				}
// 			});
// 	});
// //
// let d = ["lol"];
// let q = d;
// d = ["dasd"];
//
// let q = "courses_avg".split("_")[0];
// console.log(q);


//
// let where: any = query["WHERE"];
// let keys: any[] = Object.keys(where);
// let currentFilter = keys[0];
// let nextFilters = where[currentFilter];
// let numKeys = Object.keys(nextFilters).length;
// let eqKeys: any[] = Object.keys(nextFilters);
// let eqKey = eqKeys[0];
// let eqQuestion: number = nextFilters[eqKey];
// interface Test {
// 	lol: string
// }
// let blue: Test = {
// 	lol: "sadad"
// };
// let key = "lol" as keyof Test;
//
// console.log(blue[key]);

// let directions = new Set<object>();
//
// const a1 = ["a", "b", "c", "t"];
// const a2 = ["d", "a", "t", "e", "g"];
//
// console.log( a2.filter((x) => !a1.includes(x)) );
let actual: InsightResult[] = [
	// {
	// 	smallCourses_avg: 73.4
	// },
	// {
	// 	smallCourses_avg: 74.79
	// },
	{
		smallCourses_avg: 74.44
	}
];


// QUERY CODE THAT WE NO LONGER USE (from ValidateQuery):
// let validate = require("jsonschema").validate;
// Code taken from https://www.npmjs.com/package/jsonschema
// let schemaContents: string = this.generateSchemaForDataset(datasetId);
// let schemaObject = JSON.parse(schemaContents);
// let queryMatchesSchema: boolean = validate(query, schemaObject);
// if(!queryMatchesSchema) {
// 			throw new InsightError("Query is not valid.");
// }

// QUERY CODE THAT WE NO LONGER USE (from generateSchemaForDataset):
// let generalQuerySchemaFilePath = "./src/schemas/GeneralQuerySchema.json";
// let data = fs.readFileSync(generalQuerySchemaFilePath, "utf8");
//
// 		// replace XXX with the datasetid
// 		let result: string = data.replace(/XXX/g, datasetId);
//
// 		// Create a path to the schema of the inputted query
// 		let newQuerySchemaFilePath = "./src/schemas/" + datasetId + "QuerySchema.json";
//
// 		// Create a new file in the schemas directory if a schema doesn't exist for this id
// 		if (!fs.existsSync(newQuerySchemaFilePath)) {
// 			fs.writeFile(newQuerySchemaFilePath, result, "utf8", function (error) {
// 				if (error) {
// 					throw new InsightError("There was a problem with writing to the new query schema file.");
// 				}
// 			});
// 		}
//
// 		return result;

// let sick = [2,3,1,4124];
// sick.sort((a, b) =>(a > b) ? 1 : -1);
// console.log(sick);
//
//
// const {readdirSync, rename} = require("fs");
// const {resolve} = require("path");
//
// // Get path to image directory
// const imageDirPath = resolve(__dirname, "aerror");
//
// // Get an array of the files inside the folder
// const files = readdirSync(imageDirPath);
//
// // Loop through each file that was retrieved
// files.forEach((file: any) => {
// 	let news = file.slice(-3) === "son" ? imageDirPath + `/${file.slice(0,-5)}` : imageDirPath + `/${file}`;
// 	// let news = imageDirPath + "/" + Math.floor(Math.random() * 100000);
// 	rename(
// 		imageDirPath + `/${file}`,
// 		news,
// 		(err: any) => console.log(file.slice(-3))
// 	);
// });
