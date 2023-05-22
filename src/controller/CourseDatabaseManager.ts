import JSZip from "jszip";
import {CourseSection} from "./CourseSection";

export default class CourseDatabaseManager {

	public getAllZipSectionData(id: string, zip: JSZip): Promise<CourseSection[]> {
		return new Promise<CourseSection[]>((resolve, reject) => {
			let courseSections: CourseSection[] = [];
			let promisedData: any[] = [];
			zip.folder("courses")?.forEach((relativePath: string, file: any) => {
				promisedData.push(this.parseAndPushAllSections(file, courseSections));
			});

			Promise.all(promisedData)
				.then(() => {
					resolve(courseSections); // because we know at this point that courseSections is populated
				});
		});

	}

	private parseAndPushAllSections(file: any, courseSections: CourseSection[]): Promise<CourseSection> {
		return file.async("string")
			.then((stringData: string) => {
				let jsonData = JSON.parse(stringData);
				const sectionList: any[] = jsonData["result"];
				if (sectionList !== undefined) {
					for (const rawSection of sectionList) {
						CourseDatabaseManager.parseAndPushSection(rawSection, courseSections);
					}
				}
			}).catch((err: any) => {
				// skip this file
				return;
			});
	}

	private static parseAndPushSection(rawSection: any, courseSections: CourseSection[]) {
		try {
			let newSection: CourseSection = {
				uuid: rawSection.id.toString(),
				id: rawSection.Course.toString(),
				dept: rawSection.Subject.toString(),
				title: rawSection.Title.toString(),
				section: rawSection.Section.toString(),
				instructor: rawSection.Professor.toString(),
				avg: parseFloat(rawSection.Avg),
				pass: parseFloat(rawSection.Pass),
				fail: parseFloat(rawSection.Fail),
				audit: parseFloat(rawSection.Audit),
				year: rawSection.Section === "overall" ? 1900 : parseInt(rawSection.Year, 10)
			};
			let validSection: boolean = true;
			for (let value of Object.values(newSection)) {
				if (value === undefined) {
					validSection = false;
					break;
				}
			}
			if (validSection) {
				courseSections.push(newSection);
			}
		} catch (err) {
			return;
		}
	}
}
