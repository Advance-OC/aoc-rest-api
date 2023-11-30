const sheetExists = (workbook, sheetName) => {
	try {
		return workbook.SheetNames.includes(sheetName);
	} catch (err) {
		return false;
	}
};

const findMissingSheets = (workbook, sheets) => {
	const missing = [];
	sheets.forEach((sheet) => {
		if (!sheetExists(workbook, sheet)) {
			missing.push(sheet);
		}
	});
	return missing.length === 0 ? false : missing;
};

const removeCensusTractField = (obj) => {
	if (obj.hasOwnProperty("censusTract")) {
		delete obj.censusTract;
	}
	return obj;
};

const formatStringToArray = (inputString) => {
	const formattedString = inputString.replace(/,/g, ", ");
	const formattedArray = JSON.parse(`[${formattedString}]`);
	return formattedArray;
};

const getPerformance = (performance) => {
	if (performance == "Very Underperforming") {
		return "U";
	}
	if (performance == "Underperforming") {
		return "I";
	}
	if (performance == "Very Overperforming") {
		return "O";
	}
	if (performance == "Overperforming") {
		return "E";
	}
	return "S"; // "Excpected"
};

const compareRank = (currentTract, previousTract, contentKey) => {
	try {
		const value = currentTract?.["spi"]?.[contentKey]?.["value"];
		const previousValue = previousTract?.spi?.[contentKey]?.["value"];
		return value && previousValue ? value - previousValue : "N/A";
	} catch (err) {
		throw new Error(err.message);
	}
};

const compareYears = (currentTract, previousTract, contentKey) => {
	try {
		const rank = currentTract?.["spi"]?.[contentKey]?.["ranking"] || 0;
		const value = currentTract?.["spi"]?.[contentKey]?.["value"] || 0;
		const performance = getPerformance(
			currentTract?.["spi"]?.[contentKey]?.["scorecard"] || ""
		);
		const compared_to_last_year = compareRank(
			currentTract,
			previousTract,
			contentKey
		);

		return {
			rank,
			value,
			performance,
			compared_to_last_year,
		};
	} catch (err) {
		throw new Error(err.message);
	}
};

module.exports = {
	sheetExists,
	findMissingSheets,
	removeCensusTractField,
	formatStringToArray,
	compareRank,
	compareYears,
};
