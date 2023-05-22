export interface CourseSection {
	readonly uuid: string;
	readonly id: string;
	readonly dept: string;
	readonly title: string;
	readonly section: string;
	readonly instructor: string;
	readonly avg: number;
	readonly pass: number;
	readonly fail: number;
	readonly audit: number;
	readonly year: number;
	[key: string]: string | number;
}

export interface CourseSectionSComparator {
	readonly uuid: string;
	readonly id: string;
	readonly dept: string;
	readonly title: string;
	readonly section: string;
	readonly instructor: string;
}

export interface CourseSectionMComparator {
	readonly avg: number;
	readonly pass: number;
	readonly fail: number;
	readonly audit: number;
	readonly year: number;
}
