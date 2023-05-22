
export function isDefined(toCheck: any): boolean {
	return typeof toCheck !== "undefined" && toCheck !== null;
}
export function isObject(object: any): boolean {
	return isDefined(object) && typeof object === "object" && !Array.isArray(object);
}
