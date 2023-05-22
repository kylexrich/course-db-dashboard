import {
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError
} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";

import * as fs from "fs-extra";

import {folderTest} from "@ubccpsc310/folder-test";
import {expect} from "chai";

describe("InsightFacade", function () {
	let insightFacade: InsightFacade;

	const persistDir = "./data";
	const datasetContents = new Map<string, string>();

	// Reference any datasets you've added to test/resources/archives here and they will
	// automatically be loaded in the 'before' hook.
	const datasetsToLoad: {[key: string]: string} = {
		rooms: "./test/resources/archives/rooms.zip",
		validRooms1: "./test/resources/archives/validRooms1.zip",
		validRooms2: "./test/resources/archives/validRooms2.zip",
		invalidNotZipRoom: "./test/resources/archives/invalidNotZipRoom.htm",
		invalidEmptyRooms: "./test/resources/archives/invalidEmptyRooms.zip",
		_invalidUnderscoreRooms: "./test/resources/archives/validRooms1.zip",
		invalidNoRoomsFolder: "./test/resources/archives/invalidNoRoomsFolder.zip",
		invalidNoValidRooms: "./test/resources/archives/invalidNoValidRooms.zip",
		courses: "./test/resources/archives/courses.zip",
		validCourses: "./test/resources/archives/validCourses.zip",
		validCourses2: "./test/resources/archives/validCourses2.zip",
		_invalidUnderscore: "./test/resources/archives/validCourses.zip",
		[" "]: "./test/resources/archives/validCourses.zip",
		invalidNotZip: "./test/resources/archives/invalidNotZip.txt",
		invalidNoCourseFolder: "./test/resources/archives/invalidNoCourseFolder.zip",
		invalidNoValidCourses: "./test/resources/archives/invalidNoValidCourses.zip",
		invalidEmpty: "./test/resources/archives/invalidEmpty.zip"
	};

	before(function () {
		// This section runs once and loads all datasets specified in the datasetsToLoad object
		for (const key of Object.keys(datasetsToLoad)) {
			const content = fs.readFileSync(datasetsToLoad[key]).toString("base64");
			datasetContents.set(key, content);
		}
		// Just in case there is anything hanging around from a previous run
		fs.removeSync(persistDir);
	});

	describe("Add/Remove/List Dataset", function () {
		before(function () {
			console.info(`Before: ${this.test?.parent?.title}`);
		});

		beforeEach(function () {
			// This section resets the insightFacade instance
			// This runs before each test
			console.info(`BeforeTest: ${this.currentTest?.title}`);
			insightFacade = new InsightFacade();
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
		});

		afterEach(function () {
			// This section resets the data directory (removing any cached data)
			// This runs after each test, which should make each test independent from the previous one
			console.info(`AfterTest: ${this.currentTest?.title}`);
			fs.removeSync(persistDir);
		});

		it("Should add a valid courses dataset", function () {
			const id: string = "courses";
			const content: string = datasetContents.get("courses") ?? "";
			return insightFacade.addDataset(id, content, InsightDatasetKind.Courses)
				.then((datasetIdList) => {
					expect(datasetIdList).to.be.instanceOf(Array);
					expect(datasetIdList).to.include(id);
					expect(datasetIdList).to.have.length(1);
				})
				.catch((error) => {
					expect.fail(error.message);
				});
		});

		it("Should add a valid rooms dataset", function () {
			const id: string = "rooms";
			const content: string = datasetContents.get("rooms") ?? "";
			return insightFacade.addDataset(id, content, InsightDatasetKind.Rooms)
				.then((datasetIdList) => {
					expect(datasetIdList).to.be.instanceOf(Array);
					expect(datasetIdList).to.include(id);
					expect(datasetIdList).to.have.length(1);
				})
				.catch((error) => {
					expect.fail(error.message);
				});
		});

		it("Should add two valid courses datasets", function () {
			const id: string = "validCourses";
			const content: string = datasetContents.get("validCourses") ?? "";
			const id2: string = "validCourses2";
			const content2: string = datasetContents.get("validCourses2") ?? "";
			return insightFacade.addDataset(id, content, InsightDatasetKind.Courses)
				.then(() => {
					return insightFacade
						.addDataset(id2, content2, InsightDatasetKind.Courses);
				})
				.then((datasetIdList) => {
					expect(datasetIdList).to.be.instanceOf(Array);
					expect(datasetIdList).to.include(id);
					expect(datasetIdList).to.include(id2);
					expect(datasetIdList).to.have.length(2);
				})
				.catch((error) => {
					expect.fail(error.message);
				});
		});

		it("Should add two rooms datasets", function () {
			const id: string = "validRooms1";
			const content: string = datasetContents.get("validRooms1") ?? "";
			const id2: string = "validRooms2";
			const content2: string = datasetContents.get("validRooms2") ?? "";
			return insightFacade.addDataset(id, content, InsightDatasetKind.Rooms)
				.then(() => {
					return insightFacade
						.addDataset(id2, content2, InsightDatasetKind.Rooms);
				})
				.then((datasetIdList) => {
					expect(datasetIdList).to.be.instanceOf(Array);
					expect(datasetIdList).to.include(id);
					expect(datasetIdList).to.include(id2);
					expect(datasetIdList).to.have.length(2);
				})
				.catch((error) => {
					expect.fail(error.message);
				});
		});

		it("Should add one rooms and one courses datasets", function () {
			const id: string = "validRooms1";
			const content: string = datasetContents.get("validRooms1") ?? "";
			const id2: string = "validCourses2";
			const content2: string = datasetContents.get("validCourses2") ?? "";
			return insightFacade.addDataset(id, content, InsightDatasetKind.Rooms)
				.then(() => {
					return insightFacade
						.addDataset(id2, content2, InsightDatasetKind.Courses);
				})
				.then((datasetIdList) => {
					expect(datasetIdList).to.be.instanceOf(Array);
					expect(datasetIdList).to.include(id);
					expect(datasetIdList).to.include(id2);
					expect(datasetIdList).to.have.length(2);
				})
				.catch((error) => {
					expect.fail(error.message);
				});
		});

		it("should throw InsightError (adding a courses dataset ID formatting issue - containing underscore)",
			function () {
				const id: string = "_invalidUnderscore";
				const content: string = datasetContents.get("_invalidUnderscore") ?? "";
				return insightFacade
					.addDataset(id, content, InsightDatasetKind.Courses)
					.then((result) => {
						expect.fail(`Error should be thrown. Resolved with ${result}`);
					})
					.catch((error) => {
						expect(error).to.be.instanceOf(InsightError);
					});
			});

		it("should throw InsightError (adding a rooms dataset ID formatting issue - containing underscore)",
			function () {
				const id: string = "_invalidUnderscoreRooms";
				const content: string = datasetContents.get("_invalidUnderscoreRooms") ?? "";
				return insightFacade
					.addDataset(id, content, InsightDatasetKind.Rooms)
					.then((result) => {
						expect.fail(`Error should be thrown. Resolved with ${result}`);
					})
					.catch((error) => {
						expect(error).to.be.instanceOf(InsightError);
					});
			});

		it("should throw InsightError (adding a courses dataset with ID formatting issue - only whitespace)",
			function () {
				const id: string = " ";
				const content: string = datasetContents.get(" ") ?? "";
				return insightFacade.addDataset(id, content, InsightDatasetKind.Courses)
					.then((result) => {
						expect.fail(`Error should be thrown. Resolved with ${result}`);
					})
					.catch((error) => {
						expect(error).to.be.instanceOf(InsightError);
					});
			});

		it("should throw InsightError (adding a duplicate/existing courses dataset)", function () {
			const id: string = "validCourses";
			const content: string = datasetContents.get("validCourses") ?? "";
			return insightFacade
				.addDataset(id, content, InsightDatasetKind.Courses)
				.then(() => {
					return insightFacade
						.addDataset(id, content, InsightDatasetKind.Courses);
				})
				.then((result) => {
					expect.fail(`Error should be thrown. Resolved with ${result}`);
				})
				.catch((error) => {
					expect(error).to.be.instanceOf(InsightError);
				});
		});

		it("should throw InsightError (adding a duplicate/existing rooms dataset)", function () {
			const id: string = "validRooms1";
			const content: string = datasetContents.get("validRooms1") ?? "";
			return insightFacade
				.addDataset(id, content, InsightDatasetKind.Rooms)
				.then(() => {
					return insightFacade
						.addDataset(id, content, InsightDatasetKind.Rooms);
				})
				.then((result) => {
					expect.fail(`Error should be thrown. Resolved with ${result}`);
				})
				.catch((error) => {
					expect(error).to.be.instanceOf(InsightError);
				});
		});

		it("should throw InsightError (adding a course dataset that is not a zip)", function () {
			const id: string = "invalidNotZip";
			const content: string = datasetContents.get("invalidNotZip") ?? "";
			return insightFacade.addDataset(id, content, InsightDatasetKind.Courses)
				.then((result) => {
					expect.fail(`Error should be thrown. Resolved with ${result}`);
				})
				.catch((error) => {
					expect(error).to.be.instanceOf(InsightError);
				});
		});

		it("should throw InsightError (adding a rooms dataset that is not a zip)", function () {
			const id: string = "invalidNotZipRoom";
			const content: string = datasetContents.get("invalidNotZipRoom") ?? "";
			return insightFacade.addDataset(id, content, InsightDatasetKind.Rooms)
				.then((result) => {
					expect.fail(`Error should be thrown. Resolved with ${result}`);
				})
				.catch((error) => {
					expect(error).to.be.instanceOf(InsightError);
				});
		});

		it("should throw InsightError (adding a course dataset that does not contain a course folder)", function () {
			const id: string = "invalidNoCourseFolder";
			const content: string = datasetContents.get("invalidNoCourseFolder") ?? "";
			return insightFacade
				.addDataset(id, content, InsightDatasetKind.Courses)
				.then((result) => {
					expect.fail(`Error should be thrown. Resolved with ${result}`);
				})
				.catch((error) => {
					expect(error).to.be.instanceOf(InsightError);
				});
		});

		it("should throw InsightError (adding a room dataset that does not contain a rooms folder)", function () {
			const id: string = "invalidNoRoomsFolder";
			const content: string = datasetContents.get("invalidNoRoomsFolder") ?? "";
			return insightFacade
				.addDataset(id, content, InsightDatasetKind.Rooms)
				.then((result) => {
					expect.fail(`Error should be thrown. Resolved with ${result}`);
				})
				.catch((error) => {
					expect(error).to.be.instanceOf(InsightError);
				});
		});

		it("should throw InsightError (adding a course dataset that does not contain any valid data)", function () {
			const id: string = "invalidNoValidCourses";
			const content: string = datasetContents.get("invalidNoValidCourses") ?? "";
			return insightFacade
				.addDataset(id, content, InsightDatasetKind.Courses)
				.then((result) => {
					expect.fail(`Error should be thrown. Resolved with ${result}`);
				})
				.catch((error) => {
					expect(error).to.be.instanceOf(InsightError);
				});
		});

		it("should throw InsightError (adding a room dataset that does not contain any valid data)", function () {
			const id: string = "invalidNoValidRooms";
			const content: string = datasetContents.get("invalidNoValidRooms") ?? "";
			return insightFacade
				.addDataset(id, content, InsightDatasetKind.Rooms)
				.then((result) => {
					expect.fail(`Error should be thrown. Resolved with ${result}`);
				})
				.catch((error) => {
					expect(error).to.be.instanceOf(InsightError);
				});
		});

		it("should throw InsightError (empty courses dataset)", function () {
			const id: string = "invalidEmpty";
			const content: string = datasetContents.get("invalidEmpty") ?? "";
			return insightFacade
				.addDataset(id, content, InsightDatasetKind.Courses)
				.then((result) => {
					expect.fail(`Error should be thrown. Resolved with ${result}`);
				})
				.catch((error) => {
					expect(error).to.be.instanceOf(InsightError);
				});
		});

		it("should throw InsightError (empty rooms dataset)", function () {
			const id: string = "invalidEmptyRooms";
			const content: string = datasetContents.get("invalidEmptyRooms") ?? "";
			return insightFacade
				.addDataset(id, content, InsightDatasetKind.Rooms)
				.then((result) => {
					expect.fail(`Error should be thrown. Resolved with ${result}`);
				})
				.catch((error) => {
					expect(error).to.be.instanceOf(InsightError);
				});
		});

		it("should remove a courses dataset", function () {
			const id: string = "courses";
			const content: string = datasetContents.get("courses") ?? "";
			return insightFacade
				.addDataset(id, content, InsightDatasetKind.Courses)
				.then(() => {
					return insightFacade.removeDataset(id);
				})
				.then((removedDatasetId) => {
					expect(removedDatasetId).to.deep.equal(id);
				})
				.catch((error) => {
					expect.fail(error.message);
				});
		});

		it("should remove a rooms dataset", function () {
			const id: string = "rooms";
			const content: string = datasetContents.get("rooms") ?? "";
			return insightFacade
				.addDataset(id, content, InsightDatasetKind.Rooms)
				.then(() => {
					return insightFacade.removeDataset(id);
				})
				.then((removedDatasetId) => {
					expect(removedDatasetId).to.deep.equal(id);
				})
				.catch((error) => {
					expect.fail(error.message);
				});
		});

		it("should throw InsightError (ID formatting issue - containing underscore, for courses)", function () {
			const id: string = "_invalidUnderscore";
			return insightFacade.removeDataset(id)
				.then((result) => {
					expect.fail(`Error should be thrown. Resolved with ${result}`);
				})
				.catch((error) => {
					expect(error).to.be.instanceOf(InsightError);
				});
		});

		it("should throw InsightError (ID formatting issue - containing underscore, for rooms)", function () {
			const id: string = "_invalidUnderscoreRooms";
			return insightFacade.removeDataset(id)
				.then((result) => {
					expect.fail(`Error should be thrown. Resolved with ${result}`);
				})
				.catch((error) => {
					expect(error).to.be.instanceOf(InsightError);
				});
		});

		it("should throw InsightError (ID formatting issue - only whitespace)", function () {
			const id: string = " ";
			return insightFacade.removeDataset(id)
				.then((result) => {
					expect.fail(`Error should be thrown. Resolved with ${result}`);
				})
				.catch((error) => {
					expect(error).to.be.instanceOf(InsightError);
				});
		});

		it("should throw NotFoundError (removing a courses dataset that does not exist)", function () {
			const id: string = "courses";
			return insightFacade.removeDataset(id)
				.then((result) => {
					expect.fail(`Error should be thrown. Resolved with ${result}`);
				})
				.catch((error) => {
					expect(error).to.be.instanceOf(NotFoundError);
				});
		});

		it("should throw NotFoundError (removing a rooms dataset that does not exist)", function () {
			const id: string = "rooms";
			return insightFacade.removeDataset(id)
				.then((result) => {
					expect.fail(`Error should be thrown. Resolved with ${result}`);
				})
				.catch((error) => {
					expect(error).to.be.instanceOf(NotFoundError);
				});
		});

		it("should return an empty array of InsightDatasets", function () {
			return insightFacade.listDatasets()
				.then((result) => {
					expect(result).to.be.instanceOf(Array);
					expect(result).to.have.length(0);
				})
				.catch((error) => {
					expect.fail(error.message);
				});
		});

		it("should return an array containing a single courses InsightDataset", function () {
			const id: string = "validCourses";
			const content: string = datasetContents.get("validCourses") ?? "";
			const expected: InsightDataset[] = [{
				id: "validCourses",
				kind: InsightDatasetKind.Courses,
				numRows: 64612
			}];
			return insightFacade.addDataset(id, content, InsightDatasetKind.Courses)
				.then(() => {
					return insightFacade.listDatasets();
				})
				.then((result) => {
					const courses = result.find((dataset) => dataset.id === id);
					expect(result).to.be.instanceOf(Array);
					expect(courses).to.exist;
					expect(courses).to.deep.equal(expected[0]);
					expect(result).to.have.length(1);
				})
				.catch((error) => {
					expect.fail(error.message);
				});
		});

		it("should return an array containing a single rooms InsightDataset", function () {
			const id: string = "validRooms1";
			const content: string = datasetContents.get("validRooms1") ?? "";
			const expected: InsightDataset[] = [{
				id: "validRooms1",
				kind: InsightDatasetKind.Rooms,
				numRows: 62
			}];
			return insightFacade.addDataset(id, content, InsightDatasetKind.Rooms)
				.then(() => {
					return insightFacade.listDatasets();
				})
				.then((result) => {
					const rooms = result.find((dataset) => dataset.id === id);
					expect(result).to.be.instanceOf(Array);
					expect(rooms).to.exist;
					expect(rooms).to.deep.equal(expected[0]);
					expect(result).to.have.length(1);
				})
				.catch((error) => {
					expect.fail(error.message);
				});
		});

		it("should return an array containing two course InsightDatasets", function () {
			const id: string = "validCourses";
			const content: string = datasetContents.get("validCourses") ?? "";
			const id2: string = "validCourses2";
			const content2: string = datasetContents.get("validCourses2") ?? "";
			const expected: InsightDataset[] = [
				{
					id: "validCourses",
					kind: InsightDatasetKind.Courses,
					numRows: 64612
				},
				{
					id: "validCourses2",
					kind: InsightDatasetKind.Courses,
					numRows: 64612
				}
			];
			return insightFacade
				.addDataset(id, content, InsightDatasetKind.Courses)
				.then(() => {
					return insightFacade
						.addDataset(id2, content2, InsightDatasetKind.Courses);
				})
				.then(() => {
					return insightFacade.listDatasets();
				})
				.then((result) => {
					const courses = result.find((dataset) => dataset.id === id);
					const courses2 = result.find((dataset) => dataset.id === id2);
					expect(result).to.be.instanceOf(Array);
					expect(courses).to.exist;
					expect(courses2).to.exist;
					expect(courses).to.deep.equal(expected[0]);
					expect(courses2).to.deep.equal(expected[1]);
					expect(result).to.have.length(2);
				})
				.catch((error) => {
					expect.fail(error.message);
				});
		});

		it("should return an array containing one courses and one rooms InsightDatasets", function () {
			const id: string = "validCourses";
			const content: string = datasetContents.get("validCourses") ?? "";
			const id2: string = "validRooms1";
			const content2: string = datasetContents.get("validRooms1") ?? "";
			const expected: InsightDataset[] = [
				{
					id: "validCourses",
					kind: InsightDatasetKind.Courses,
					numRows: 64612
				},
				{
					id: "validRooms1",
					kind: InsightDatasetKind.Rooms,
					numRows: 62
				}
			];
			return insightFacade
				.addDataset(id, content, InsightDatasetKind.Courses)
				.then(() => {
					return insightFacade
						.addDataset(id2, content2, InsightDatasetKind.Rooms);
				})
				.then(() => {
					return insightFacade.listDatasets();
				})
				.then((result: InsightDataset[]) => {
					const courses = result.find((dataset: InsightDataset) => dataset.id === id);
					const courses2 = result.find((dataset: InsightDataset) => dataset.id === id2);
					expect(result).to.be.instanceOf(Array);
					expect(courses).to.exist;
					expect(courses2).to.exist;
					expect(courses).to.deep.equal(expected[0]);
					expect(courses2).to.deep.equal(expected[1]);
					expect(result).to.have.length(2);
				})
				.catch((error) => {
					expect.fail(error.message);
				});
		});
	});

	/*
	 * This test suite dynamically generates tests from the JSON files in test/queries.
	 * You should not need to modify it; instead, add additional files to the queries directory.
	 * You can still make tests the normal way, this is just a convenient tool for a majority of queries.
	 */
	describe("PerformQuery", () => {
		before(function () {
			console.info(`Before: ${this.test?.parent?.title}`);

			insightFacade = new InsightFacade();

			// Load the datasets specified in datasetsToQuery and add them to InsightFacade.
			// Will *fail* if there is a problem reading ANY dataset.
			const loadDatasetPromises = [
				insightFacade.addDataset("courses", datasetContents.get("courses") ?? "", InsightDatasetKind.Courses),
				insightFacade.addDataset("rooms", datasetContents.get("rooms") ?? "", InsightDatasetKind.Rooms)
			];

			return Promise.all(loadDatasetPromises);
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
			fs.removeSync(persistDir);
		});

		type PQErrorKind = "ResultTooLargeError" | "InsightError";

		folderTest<unknown, Promise<InsightResult[]>, PQErrorKind>(
			"Dynamic InsightFacade PerformQuery tests",
			(input) => insightFacade.performQuery(input),
			"./test/resources/queries",
			{
				errorValidator: (error): error is PQErrorKind =>
					error === "ResultTooLargeError" || error === "InsightError",
				assertOnError(actual, expected) {
					if (expected === "ResultTooLargeError") {
						expect(actual).to.be.instanceof(ResultTooLargeError);
					} else {
						expect(actual).to.be.instanceof(InsightError);
					}
				},
				assertOnResult(actual: unknown, expected: InsightResult[]) {
					expect(actual).to.have.deep.members(expected);
					expect(actual).to.have.same.length(expected.length);
				}
			}
		);
	});
});
