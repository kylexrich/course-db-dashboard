addButton = document.getElementById("addButton");
removeButton = document.getElementById("removeButton");
selectWhere = document.getElementById("operatorDropDown");
notText = document.getElementById("notText");
fieldsText = document.getElementById("fieldsText");
valueText = document.getElementById("valueText");
newItemRow = document.getElementById("newItemRow");
coursesColumns = document.getElementById("queryColsCourses");
roomsColumns = document.getElementById("queryColsRooms");
coursesColumns2 = document.getElementById("queryColsCourses2");
roomsColumns2 = document.getElementById("queryColsRooms2");
coursesLink = document.getElementById("coursesLink");
roomsLink = document.getElementById("roomsLink");
queryButton = document.getElementById("performQuery-Button");
roomsLink.addEventListener("click", changeToRooms);
coursesLink.addEventListener("click", changeToCourses);
addButton.addEventListener("click", addNewItemRow);
removeButton.addEventListener("click", removeItemRow);
selectWhere.addEventListener("change", unlockOrLockFields);
courseFields = document.getElementsByClassName("courseFields");
roomFields = document.getElementsByClassName("roomFields");
queryTable = document.getElementById("query-table");
queryErr = document.getElementById("query-err");
addNewItemRow();

for (let checkbox of courseFields) {
	checkbox.addEventListener("click", inputValidation);
}
for (let checkbox of roomFields) {
	checkbox.addEventListener("click", inputValidation);
}

function checkboxClicked() {
	// uncomment to dissalow users from clicking "preform query" if there is no columns selected

	// if (!queryButton.disabled) {
	// 	let count = 0;
	// 	if (roomsLink.classList.contains('active')) {
	// 		for (let i = 0; i < roomFields.length; i++) {
	// 			if (roomFields[i].checked) {
	// 				count++;
	// 			}
	// 		}
	// 	} else {
	// 		for (let i = 0; i < courseFields.length; i++) {
	// 			if (courseFields[i].checked) {
	// 				count++;
	// 			}
	// 		}
	// 	}
	// 	queryButton.disabled = count === 0;
	// }
}

function addNewItemRow() {
	let newElement = document.createElement("div");
	let fields = roomsLink.classList.contains('active') ? getRoomFields() : getCourseFields();
	switch (selectWhere.value) {
		case "noFilter":
			newElement.innerHTML += "<div class=\"row filterRow\">\n" +
				"\t\t\t\t\t<div class=\"col-1\">\n" +
				"\t\t\t\t\t\t<div class=\"form-check-not\">\n" +
				"\t\t\t\t\t\t\t<input class=\" ps-4 pt-4 form-check-input notSelection\" type=\"checkbox\" value=\"not\" id=\"notSelection\" disabled\n" +
				"\t\t\t\t\t\t\t\t   aria-label=\"...\">\n" +
				"\t\t\t\t\t\t</div>\n" +
				"\t\t\t\t\t</div>\n" +
				"\t\t\t\t\t<div class=\"col-3\">\n" +
				"\t\t\t\t\t\t<div class=\"selectFields\">\n" +
				"\t\t\t\t\t\t\t<select class=\"form-select fieldSelection\" aria-label=\"Default select example\"  id=\"fieldSelection\" disabled\n" +
				"\t\t\t\t\t\t\t\t\t>\n" +
				"\t\t\t\t\t\t\t\t<option value=\"select\" selected=\"\">Select</option>\n" + fields +
				"\t\t\t\t\t\t\t</select>\n" +
				"\t\t\t\t\t\t</div>\n" +
				"\t\t\t\t\t</div>\n" +
				"\t\t\t\t\t<div class=\"col-3\">\n" +
				"\t\t\t\t\t\t<div class=\"selectOperators\">\n" +
				"\t\t\t\t\t\t\t<select class=\"form-select operatorSelection\" aria-label=\"Default select example\" id=\"operatorSelection\" disabled\n" +
				"\t\t\t\t\t\t\t\t\t>\n" +
				"\t\t\t\t\t\t\t\t<option value=\"select\" selected=\"\">Select</option>\n" +
				"\t\t\t\t\t\t\t\t<option value=\"EQ\">=</option>\n" +
				"\t\t\t\t\t\t\t\t<option value=\"GT\">&gt;</option>\n" +
				"\t\t\t\t\t\t\t\t<option value=\"LT\">&lt;</option>\n" +
				"\t\t\t\t\t\t\t</select>\n" +
				"\t\t\t\t\t\t</div>\n" +
				"\t\t\t\t\t</div>\n" +
				"\t\t\t\t\t<div class=\"col-4\">\n" +
				"\t\t\t\t\t\t<label>\n" +
				"\t\t\t\t\t\t\t<input class=\"form-control textForValue valueInput\" type=\"text\" id=\"valueInput\" disabled>\n" +
				"\t\t\t\t\t\t</label>\n" +
				"\t\t\t\t\t</div>\n" +
				"\t\t\t\t</div>";
			break;
		default:
			newElement.innerHTML += "<div class=\"row filterRow\">\n" +
				"\t\t\t\t\t<div class=\"col-1\">\n" +
				"\t\t\t\t\t\t<div class=\"form-check-not\">\n" +
				"\t\t\t\t\t\t\t<input class=\" ps-4 pt-4 form-check-input notSelection\" type=\"checkbox\" value=\"not\" id=\"notSelection\"\n" +
				"\t\t\t\t\t\t\t\taria-label=\"...\">\n" +
				"\t\t\t\t\t\t</div>\n" +
				"\t\t\t\t\t</div>\n" +
				"\t\t\t\t\t<div class=\"col-3\">\n" +
				"\t\t\t\t\t\t<div class=\"selectFields\">\n" +
				"\t\t\t\t\t\t\t<select class=\"form-select fieldSelection\" aria-label=\"Default select example\"  id=\"fieldSelection\"\n" +
				"\t\t\t\t\t\t\t\t\t>\n" +
				"\t\t\t\t\t\t\t\t<option value=\"select\" selected=\"\">Select</option>\n" + fields +
				"\t\t\t\t\t\t\t</select>\n" +
				"\t\t\t\t\t\t</div>\n" +
				"\t\t\t\t\t</div>\n" +
				"\t\t\t\t\t<div class=\"col-3\">\n" +
				"\t\t\t\t\t\t<div class=\"selectOperators\">\n" +
				"\t\t\t\t\t\t\t<select class=\"form-select disabled operatorSelection\" aria-label=\"Default select example\" id=\"operatorSelection\"\n" +
				"\t\t\t\t\t\t\t\t\t>\n" +
				"\t\t\t\t\t\t\t\t<option value=\"select\" selected=\"\">Select</option>\n" +
				"\t\t\t\t\t\t\t\t<option value=\"GT\">&gt;</option>\n" +
				"\t\t\t\t\t\t\t\t<option value=\"EQ\">=</option>\n" +
				"\t\t\t\t\t\t\t\t<option value=\"LT\">&lt;</option>\n" +
				"\t\t\t\t\t\t\t</select>\n" +
				"\t\t\t\t\t\t</div>\n" +
				"\t\t\t\t\t</div>\n" +
				"\t\t\t\t\t<div class=\"col-4\">\n" +
				"\t\t\t\t\t\t<label>\n" +
				"\t\t\t\t\t\t\t<input class=\"form-control textForValue valueInput\" type=\"text\" id=\"valueInput\">\n" +
				"\t\t\t\t\t\t</label>\n" +
				"\t\t\t\t\t</div>\n" +
				"\t\t\t\t</div>";
			break;
	}
	newElement.addEventListener("change", inputValidation);
	newItemRow.appendChild(newElement);
	inputValidation();
}

function inputValidation() {

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
	}

	queryButton.disabled = false;
	let allRows = document.getElementsByClassName("filterRow");
	for (let i = 0; i < allRows.length; i++) {
		let fieldVal = allRows[i].querySelector(".fieldSelection").value;
		let dropDown = allRows[i].querySelector(".operatorSelection");
		for (let j = 0; j < dropDown.length; j++) {
			let dropDownOptions = dropDown.options;
			let dropdownVal = dropDownOptions[j].value;
			if ((selectWhere.value === "AND" || selectWhere.value === "OR") && (fieldVal === "select" || (dropdownVal === "select" && dropDownOptions[j].selected))) {
				queryButton.disabled = true;
			} else if (selectWhere.value === "oneFilter" && (fieldVal === "select" || (fieldVal === "select" || (dropdownVal === "select" && dropDownOptions[j].selected))) && i === 0) {
				queryButton.disabled = true;
			}
			if (fakeObject[fieldVal] === "string") {
				if (dropdownVal === "GT" || dropdownVal === "LT") {
					dropDownOptions[j].disabled = true;
					if (dropDownOptions[j].selected) {
						dropDownOptions[0].selected = true;
					}
				}
				allRows[i].querySelector(".valueInput").type = "text";
			} else {
				allRows[i].querySelector(".valueInput").type = fakeObject[fieldVal] === 1 ? "number" : "text";
				dropDownOptions[j].disabled = false;
			}
			if(fakeObject[fieldVal] === 1 && isNaN(allRows[i].querySelector(".valueInput").valueAsNumber)) {
				queryButton.disabled = true;
			}
		}
	}
	while (queryErr.lastChild != null) {
		queryErr.removeChild(queryErr.lastChild);
	}
	checkboxClicked()
}

let lastOperator = "noFilter";

function unlockOrLockFields() {
	switch (selectWhere.value) {
		case "noFilter":
			disableItemRowsForNoFilter();
			break;
		case "AND":
		case "OR":
			enableItemRowsForANDorOR();
			break;
		case "oneFilter":
			disableItemRowsForOneFilter();
			break;
	}
	inputValidation()
	lastOperator = selectWhere.value;
}

function enableItemRowsForANDorOR() {
	if (lastOperator === "AND" || lastOperator === "OR") return;
	let allRows = document.getElementsByClassName("filterRow");
	for (let i = 0; i < allRows.length; i++) {
		allRows[i].querySelector(".notSelection").disabled = false;
		allRows[i].querySelector(".fieldSelection").disabled = false;
		allRows[i].querySelector(".operatorSelection").disabled = false;
		allRows[i].querySelector(".valueInput").disabled = false;
	}
	changeRowTextsToBlack();
	addButton.style.display = "block";
	removeButton.style.display = "block";
}

function changeRowTextsToBlack() {
	valueText.style.color = "black";
	notText.style.color = "black";
	fieldsText.style.color = "black";
}

function disableItemRowsForOneFilter() {
	let allRows = document.getElementsByClassName("filterRow");
	for (let i = 0; i < allRows.length; i++) {
		allRows[i].querySelector(".notSelection").disabled = i !== 0;
		allRows[i].querySelector(".fieldSelection").disabled = i !== 0;
		allRows[i].querySelector(".operatorSelection").disabled = i !== 0;
		allRows[i].querySelector(".valueInput").disabled = i !== 0;
	}
	changeRowTextsToBlack();
	addButton.style.display = "none";
	removeButton.style.display = "none";
}

function disableItemRowsForNoFilter() {
	let allRows = document.getElementsByClassName("filterRow");
	for (let i = 0; i < allRows.length; i++) {
		allRows[i].querySelector(".notSelection").disabled = true;
		allRows[i].querySelector(".fieldSelection").disabled = true;
		allRows[i].querySelector(".operatorSelection").disabled = true;
		allRows[i].querySelector(".valueInput").disabled = true;
	}
	valueText.style.color = "grey";
	notText.style.color = "grey";
	fieldsText.style.color = "grey";
	addButton.style.display = "none";
	removeButton.style.display = "none";
}

function getCourseFields() {
	return "\t\t\t\t\t<option value=\"courses_dept\">department</option>\n" +
		"\t\t\t\t\t<option value=\"courses_id\">id</option>\n" +
		"\t\t\t\t\t<option value=\"courses_avg\">average</option>\n" +
		"\t\t\t\t\t<option value=\"courses_instructor\">instructor</option>\n" +
		"\t\t\t\t\t<option value=\"courses_title\">title</option>\n" +
		"\t\t\t\t\t<option value=\"courses_pass\">pass</option>\n" +
		"\t\t\t\t\t<option value=\"courses_fail\">fail</option>\n" +
		"\t\t\t\t\t<option value=\"courses_audit\">audit</option>\n" +
		"\t\t\t\t\t<option value=\"courses_uuid\">uuid</option>\n" +
		"\t\t\t\t\t<option value=\"courses_year\">year</option>\n"
}

function getRoomFields() {
	return "\t\t\t\t\t<option value=\"rooms_fullname\">fullname</option>\n" +
		"\t\t\t\t\t<option value=\"rooms_shortname\">shortname</option>\n" +
		"\t\t\t\t\t<option value=\"rooms_number\">number</option>\n" +
		"\t\t\t\t\t<option value=\"rooms_name\">name</option>\n" +
		"\t\t\t\t\t<option value=\"rooms_address\">address</option>\n" +
		"\t\t\t\t\t<option value=\"rooms_lat\">lat</option>\n" +
		"\t\t\t\t\t<option value=\"rooms_lon\">lon</option>\n" +
		"\t\t\t\t\t<option value=\"rooms_seats\">seats</option>\n" +
		"\t\t\t\t\t<option value=\"rooms_type\">type</option>\n" +
		"\t\t\t\t\t<option value=\"rooms_furniture\">furniture</option>\n" +
		"\t\t\t\t\t<option value=\"rooms_href\">href</option>\n"
}

function removeItemRow() {
	if (newItemRow.childElementCount > 1) {
		newItemRow.removeChild(newItemRow.lastChild);
	}
	inputValidation();
}

function resetCommonHtml() {
	while (newItemRow.lastChild !== null) {
		newItemRow.removeChild(newItemRow.lastChild);
	}
	let allCols = document.getElementsByClassName("checkboxForFields");
	for (let i = 0; i < allCols.length; i++) {
		allCols[i].checked = false
	}
	addNewItemRow();
	while (queryTable.lastChild != null) {
		queryTable.removeChild(queryTable.lastChild);
	}
	while (queryErr.lastChild != null) {
		queryErr.removeChild(queryErr.lastChild);
	}
}

function changeToCourses() {
	roomsLink.className = ''
	roomsColumns.classList.add('hide');
	roomsColumns.classList.remove('queryCols');
	roomsColumns2.classList.add('hide');
	roomsColumns2.classList.remove('queryCols');
	coursesLink.className = 'active';
	coursesColumns.classList.remove('hide');
	coursesColumns.classList.add('queryCols');
	coursesColumns2.classList.remove('hide');
	coursesColumns2.classList.add('queryCols');
	resetCommonHtml()
}


function changeToRooms() {
	coursesLink.className = ''
	coursesColumns.classList.add('hide');
	coursesColumns.classList.remove('queryCols');
	coursesColumns2.classList.add('hide');
	coursesColumns2.classList.remove('queryCols');
	roomsLink.className = 'active';
	roomsColumns.classList.remove('hide');
	roomsColumns.classList.add('queryCols');
	roomsColumns2.classList.remove('hide');
	roomsColumns2.classList.add('queryCols');
	resetCommonHtml();
}


