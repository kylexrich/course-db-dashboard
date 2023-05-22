import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError
} from "./IInsightFacade";
import DatabaseManager from "./DatabaseManager";
import QueryEngine from "./QueryEngine";
import {CourseSection} from "./CourseSection";
import {Room} from "./Room";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */


export default class InsightFacade implements IInsightFacade {

	private databaseManager: DatabaseManager;
	private queryEngine: QueryEngine;

	constructor() {
		this.databaseManager = new DatabaseManager();
		this.queryEngine = new QueryEngine(this.databaseManager);
		this.addDataFolder();
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		return this.databaseManager.addDataset(id, content, kind);
	}

	public removeDataset(id: string): Promise<string> {
		return this.databaseManager.removeDataset(id);
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return this.databaseManager.listDatasets();
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		return this.queryEngine.performQuery(query);
	}

	public containsDataset(id: string): boolean {
		return this.databaseManager.containsId(id);
	}

	public addDataFolder() {
		this.databaseManager.addDataFolder();
	}
}
