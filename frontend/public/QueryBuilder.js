document.getElementById("performQuery-Button").addEventListener("click", handlePerformQuery);
let queryTable = document.getElementById("query-table");
let queryErr = document.getElementById("query-err");

function buildQuery() {
	let operator = getOp();
	let filters = getFilters(operator);
	let columns = getColumns();
	let where = buildWhere(operator, filters);
	let options = buildOptions(columns);
	return {
		WHERE: where,
		OPTIONS: options
	}
}

function getOp() {
	return document.getElementById("operatorDropDown").value;
}

function getFilters(operator) {
	let allRows = document.getElementsByClassName("filterRow");
	let filterObjects = [allRows.length];
	let filterCount = operator === "oneFilter" ? 1 : allRows.length;
	for (let i = 0; i < filterCount; i++) {
		let notBool = allRows[i].querySelector(".notSelection").checked;
		let selectedField = allRows[i].querySelector(".fieldSelection").value;
		let op = parseOp(selectedField, allRows[i].querySelector(".operatorSelection").value);
		let val = parseVal(selectedField, allRows[i].querySelector(".valueInput").value);
		filterObjects[i] = {
			not: notBool,
			field: selectedField,
			operator: op,
			value: val,
		}
	}
	return filterObjects;
}

function getColumns() {
	let allCols = document.getElementsByClassName("checkboxForFields");
	let selectedCols = [];
	let ind = 0;
	for (let i = 0; i < allCols.length; i++) {
		if (allCols[i].checked) {
			selectedCols[ind] = allCols[i].value;
			ind++;
		}
	}
	return selectedCols;
}

function buildWhere(operator, filters) {
	let where = {};
	if(operator === "noFilter") {
		return where;
	}
	if(operator === "oneFilter") {
		where["AND"] = [];
	} else {
		where[operator] = [];
	}
	for (let i = 0; i < filters.length; i++) {
		let filter = {}
		if (filters[i].not) {
			filter["NOT"] = {};
			filter["NOT"][filters[i].operator] = {[filters[i].field]: filters[i].value}
		} else {
			filter[filters[i].operator] = {[filters[i].field]: filters[i].value};
		}

		if(operator === "oneFilter") {
			where["AND"][i] = filter;
		} else {
			where[operator][i] = filter;
		}
	}
	return where;
}

function buildOptions(columns) {
	let options = {};
	options["COLUMNS"] = [];
	for (let i = 0; i < columns.length; i++) {
		options["COLUMNS"][i] = columns[i];
	}
	return options;
}

function parseVal(selectedField, value) {
	let fakeObject = {
		rooms_fullname: "string",
		rooms_shortname: "string",
		rooms_number: "string",
		rooms_name: "string",
		rooms_address: "string",
		rooms_lat: 1,
		rooms_lon: 1,
		rooms_seats: 1,
		rooms_type: "string",
		rooms_furniture: "string",
		rooms_href: "string",
		courses_uuid: "string",
		courses_id: "string",
		courses_dept: "string",
		courses_title: "string",
		courses_section: "string",
		courses_instructor: "string",
		courses_avg: 1,
		courses_pass: 1,
		courses_fail: 1,
		courses_audit: 1,
		courses_year: 1
	};
	try {
		if (fakeObject[selectedField] === 1) {
			if(selectedField === "courses_year") { //todo these do  not throw errors
				return parseInt(value, 10);
			} else {
				return parseFloat(value);
			}
		} else {
			return value;
		}
	} catch(e) {
		return value;
	}
}

function parseOp(selectedField, op) {
	let fakeObject = {
		rooms_fullname: "string",
		rooms_shortname: "string",
		rooms_number: "string",
		rooms_name: "string",
		rooms_address: "string",
		rooms_lat: 1,
		rooms_lon: 1,
		rooms_seats: 1,
		rooms_type: "string",
		rooms_furniture: "string",
		rooms_href: "string",
		courses_uuid: "string",
		courses_id: "string",
		courses_dept: "string",
		courses_title: "string",
		courses_section: "string",
		courses_instructor: "string",
		courses_avg: 1,
		courses_pass: 1,
		courses_fail: 1,
		courses_audit: 1,
		courses_year: 1
	};
	if (fakeObject[selectedField] === "string" && op === "EQ") {
		return "IS";
	} else {
		return op;
	}
}

function handlePerformQuery() {
	let xhr = new XMLHttpRequest();
	let url = "/query";
	xhr.open("POST", url, true);
	xhr.setRequestHeader('Content-type', 'application/json');
	xhr.onload = (e) => {
		if (xhr.status === 200) {
			let data = JSON.parse(xhr.response).result;
			return renderTable(data);
		} else {
			let err = JSON.parse(xhr.response).error;
			return renderError(err);
		}
	};
	try {
		xhr.send(JSON.stringify(buildQuery()));
	} catch(e) {
		renderError(e.message);
	}

}

function renderTable(data) {
	while (queryErr.lastChild != null) {
		queryErr.removeChild(queryErr.lastChild);
	}
	if(typeof data[0] === "undefined" || data[0] === null) {
		renderError("No Results Found");
		return;
	}
	let newElement = document.createElement("div");
	let tableHTML = "<table class=\"table sortable table-dark table-striped table-hover\" id=\"query-table\"><thead><tr>";
	for (let key of Object.keys(data[0])) {
		tableHTML += "<th>" + key.split("_")[1].toUpperCase() + "</th>"
	}
	tableHTML += "</tr></thead><tbody>";
	for (let datum of data) {
		tableHTML += "<tr>";
		for (let value of Object.values(datum)) {
			tableHTML += "<td>" + value + "</td>"
		}
		tableHTML += "</tr>";
	}
	tableHTML += "</tbody></table>";
	newElement.innerHTML += tableHTML;
	while (queryTable.lastChild != null) {
		queryTable.removeChild(queryTable.lastChild);
	}
	queryTable.appendChild(newElement);
}


function renderError(status) {
	let msg = "";
	if (status.slice(0, 1) === "\"") {
		msg = status.slice(8, -1);
	} else {
		msg = status;
	}
	let newElement = document.createElement("div");
	while (queryTable.lastChild != null) {
		queryTable.removeChild(queryTable.lastChild);
	}
	while (queryErr.lastChild != null) {
		queryErr.removeChild(queryErr.lastChild);
	}

	newElement.innerHTML += "<div class=\"alert alert-danger d-flex align-items-center\" role=\"alert\">\n" +
		"  <svg class=\"bi flex-shrink-0 me-2\" width=\"24\" height=\"24\" role=\"img\" aria-label=\"Danger:\"><use xlink:href=\"#exclamation-triangle-fill\"/></svg>\n" +
		"  <div>\n" +
		msg +
		"  </div>\n" +
		"</div>"
	queryErr.appendChild(newElement);
}

