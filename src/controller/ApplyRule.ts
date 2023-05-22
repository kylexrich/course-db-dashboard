import {InsightResult} from "./IInsightFacade";
import Decimal from "decimal.js";

export default class ApplyRule {

	public newColumn: string;
	public targetColumn: string;
	public targetKey: string;
	public ruleType: RuleType;
	public sum: Decimal = new Decimal(0);
	private numElements: number = 0;
	private min: number = Number.MAX_SAFE_INTEGER;
	private max: number = Number.MIN_SAFE_INTEGER;
	private uniqueValueCount: number = 0;
	private uniqueValueSet: Set<string> = new Set<string>();

	constructor(rule: any) {
		let columnName = Object.keys(rule)[0];
		let ruleType = Object.keys(rule[columnName])[0];
		let targetColumn = rule[columnName][ruleType];

		this.newColumn = columnName;
		this.targetColumn = targetColumn;
		this.targetKey = targetColumn.split("_")[1];
		if(ruleType === "AVG") {
			this.ruleType = RuleType.AVG;
		} else if(ruleType === "MIN") {
			this.ruleType = RuleType.MIN;
		} else if(ruleType === "MAX") {
			this.ruleType = RuleType.MAX;
		} else if(ruleType === "SUM") {
			this.ruleType = RuleType.SUM;
		} else {
			this.ruleType = RuleType.COUNT;
		}
	}

	public update(datum: InsightResult): void {
		switch (this.ruleType) {
			case RuleType.MAX:
				this.max = Math.max(this.max, datum[this.targetKey] as number);
				break;
			case RuleType.MIN:
				this.min = Math.min(this.min, datum[this.targetKey] as number);
				break;
			case RuleType.AVG:
				this.sum = this.sum.add(new Decimal(datum[this.targetKey] as number));
				this.numElements++;
				break;
			case RuleType.SUM:
				this.sum = this.sum.add(new Decimal(datum[this.targetKey] as number));
				break;
			case RuleType.COUNT:
				if(!this.uniqueValueSet.has(datum[this.targetKey] as string)) {
					this.uniqueValueCount++;
					this.uniqueValueSet.add(datum[this.targetKey] as string);
				}
				break;
		}
	}

	public getResult(): number {
		switch (this.ruleType) {
			case RuleType.MAX:
				return this.max;
			case RuleType.MIN:
				return this.min;
			case RuleType.AVG:
				return Number((this.sum.toNumber() / this.numElements).toFixed(2));
			case RuleType.SUM:
				return Number(this.sum.toNumber().toFixed(2));
			case RuleType.COUNT:
				return this.uniqueValueCount;
		}
	}

	public resetValues() {
		this.sum = new Decimal(0);
		this.numElements = 0;
		this.min = Number.MAX_SAFE_INTEGER;
		this.max = Number.MIN_SAFE_INTEGER;
		this.uniqueValueCount = 0;
		this.uniqueValueSet = new Set<string>();
	}
}

export enum RuleType {
	MAX,
	MIN,
	AVG,
	SUM,
	COUNT,
}
