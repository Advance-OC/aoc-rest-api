const {
	getWorkbook,
	getSheet,
	getRows,
	getContentKey,
} = require("../../utils");
const baselayerData = require("../data/baseLayerData");
const { requiredSheets } = require("./constants");
const { Baselayer } = require("./model");
const baselayerRepo = require("./repository");
const {
	findMissingSheets,
	removeCensusTractField,
	formatStringToArray,
	compareYears,
	compareRank,
} = require("./useCases");

const getBaselayers = async (req, res) => {
	try {
		const baselayers = await baselayerRepo.findAll(req.query);
		res.json(baselayers);
	} catch (err) {
		res.status(500).json(err.message);
	}
};

const getBaselayersByYear = async (req, res) => {
	try {
		const { yearNumber } = req.params;

		const baselayers = await baselayerRepo.findByField({
			year: yearNumber,
		});
		if (!baselayers) {
			return res.status(404).json("Baselayers not found for given year.");
		}

		res.json(baselayers);
	} catch (err) {
		res.status(500).json(err.message);
	}
};

const getBaselayersByLayer = async (req, res) => {
	try {
		const { yearNumber, layerType } = req.params;

		const validLayers = ["spi", "cdc", "demographics"];
		if (!validLayers.includes(layerType)) {
			return res.status(400).json("Invalid layerType.");
		}

		const baselayers = await baselayerRepo.findByField({
			year: yearNumber,
		});
		if (!baselayers) {
			return res.status(404).json("Baselayers not found for given year.");
		}

		const data = baselayers.censusTracts.map((tract) => ({
			id: tract._id,
			geoId: tract.geoId,
			geoIdType: "CENSUS_TRACT",
			layerType,
			content: tract[layerType],
		}));
		res.json(data);
	} catch (err) {
		res.status(500).json(err.message);
	}
};

const getBaselayersByKey = async (req, res) => {
	try {
		const { yearNumber, layerType, contentKey } = req.params;

		const validLayers = ["spi", "cdc", "demographics"];
		if (!validLayers.includes(layerType)) {
			return res.status(400).json("Invalid layerType.");
		}

		const baselayers = await baselayerRepo.findByField({
			year: yearNumber,
		});
		if (!baselayers) {
			return res.status(404).json("Baselayers not found for given year.");
		}

		if (layerType === "spi") {
			const data = baselayers.censusTracts.map((tract) => ({
				id: tract._id,
				geoId: tract.geoId,
				geoIdType: "CENSUS_TRACT",
				layerType,
				content: {
					value: tract[layerType][contentKey]["value"],
				},
			}));
			return res.json(data);
		}

		const data = baselayers.censusTracts.map((tract) => ({
			id: tract._id,
			geoId: tract.geoId,
			geoIdType: "CENSUS_TRACT",
			layerType,
			content: {
				value: tract[layerType][contentKey],
			},
		}));

		res.json(data);
	} catch (err) {
		res.status(500).json(err.message);
	}
};

const getScorecardData = async (req, res) => {
	try {
		const { yearNumber, geoId } = req.params;

		// get the year and prev year
		const year = parseInt(yearNumber);
		const prevYear = year - 1;

		// check if baselayer data exists for both years
		const currentBaselayerData = await baselayerRepo.findByField({
			year: year,
		});
		const previousBaselayerData = await baselayerRepo.findByField({
			year: prevYear,
		});
		if (!currentBaselayerData) {
			return res.status(400).json(`No data exists for ${year}`);
		}
		if (!previousBaselayerData) {
			return res.status(400).json(`No data exists for ${prevYear}`);
		}

		const currentCensusTract = currentBaselayerData.censusTracts.find(
			(tract) => tract.geoId == geoId
		);
		const previousCensusTract = previousBaselayerData.censusTracts.find(
			(tract) => tract.geoId == geoId
		);

		// create scorecard template
		const scorecard = {
			name: geoId,
			fullName: geoId,
			spi: compareYears(currentCensusTract, previousCensusTract, "spi"),
			bhn: {
				valueRank: compareYears(
					currentCensusTract,
					previousCensusTract,
					"bhn"
				),
				ps: {
					valueRank: compareYears(
						currentCensusTract,
						previousCensusTract,
						"ps"
					),
					ps_violent: compareYears(
						currentCensusTract,
						previousCensusTract,
						"ps_violent"
					),
					ps_property: compareYears(
						currentCensusTract,
						previousCensusTract,
						"ps_property"
					),
					ps_accidents: compareYears(
						currentCensusTract,
						previousCensusTract,
						"ps_accidents"
					),
					compared_to_last_year: compareRank(
						currentCensusTract,
						previousCensusTract,
						"ps"
					),
				},
				ws: {
					valueRank: compareYears(
						currentCensusTract,
						previousCensusTract,
						"ws"
					),
					ws_groundwater: compareYears(
						currentCensusTract,
						previousCensusTract,
						"ws_groundwater"
					),
					ws_inspections: compareYears(
						currentCensusTract,
						previousCensusTract,
						"ws_inspections"
					),
					ws_drinkingwater: compareYears(
						currentCensusTract,
						previousCensusTract,
						"ws_drinkingwater"
					),
					ws_hazardouswaste: compareYears(
						currentCensusTract,
						previousCensusTract,
						"ws_hazardouswaste"
					),
					compared_to_last_year: compareRank(
						currentCensusTract,
						previousCensusTract,
						"ws"
					),
				},
				nbm: {
					valueRank: compareYears(
						currentCensusTract,
						previousCensusTract,
						"nbm"
					),
					nbm_vax: compareYears(
						currentCensusTract,
						previousCensusTract,
						"nbm_vax"
					),
					nbm_dental: compareYears(
						currentCensusTract,
						previousCensusTract,
						"nbm_dental"
					),
					nbm_foodstamps: compareYears(
						currentCensusTract,
						previousCensusTract,
						"nbm_foodstamps"
					),
					nbm_preventative: compareYears(
						currentCensusTract,
						previousCensusTract,
						"nbm_preventative"
					),
					nbm_supermarketaccess: compareYears(
						currentCensusTract,
						previousCensusTract,
						"nbm_supermarketaccess"
					),
					compared_to_last_year: compareRank(
						currentCensusTract,
						previousCensusTract,
						"nbm"
					),
				},
				housing: {
					valueRank: compareYears(
						currentCensusTract,
						previousCensusTract,
						"housing"
					),
					s_rapi: compareYears(
						currentCensusTract,
						previousCensusTract,
						"s_rapi"
					),
					s_eviction: compareYears(
						currentCensusTract,
						previousCensusTract,
						"s_eviction"
					),
					s_overcrowded: compareYears(
						currentCensusTract,
						previousCensusTract,
						"s_overcrowded"
					),
					s_hburdenowner: compareYears(
						currentCensusTract,
						previousCensusTract,
						"s_hburdenowner"
					),
					s_hburdenrenter: compareYears(
						currentCensusTract,
						previousCensusTract,
						"s_hburdenrenter"
					),
					compared_to_last_year: compareRank(
						currentCensusTract,
						previousCensusTract,
						"housing"
					),
				},
				compared_to_last_year: compareRank(
					currentCensusTract,
					previousCensusTract,
					"bhn"
				),
			},
			wf: {
				valueRank: compareYears(
					currentCensusTract,
					previousCensusTract,
					"wf"
				),
				eq: {
					valueRank: compareYears(
						currentCensusTract,
						previousCensusTract,
						"eq"
					),
					eq_no2: compareYears(
						currentCensusTract,
						previousCensusTract,
						"eq_no2"
					),
					eq_pm25: compareYears(
						currentCensusTract,
						previousCensusTract,
						"eq_pm25"
					),
					eq_ozone: compareYears(
						currentCensusTract,
						previousCensusTract,
						"eq_ozone"
					),
					eq_wildfirehp: compareYears(
						currentCensusTract,
						previousCensusTract,
						"eq_wildfirehp"
					),
					eq_carbonfootprint: compareYears(
						currentCensusTract,
						previousCensusTract,
						"eq_carbonfootprint"
					),
					compared_to_last_year: compareRank(
						currentCensusTract,
						previousCensusTract,
						"eq"
					),
				},
				hw: {
					valueRank: compareYears(
						currentCensusTract,
						previousCensusTract,
						"hw"
					),
					hw_cancer: compareYears(
						currentCensusTract,
						previousCensusTract,
						"hw_cancer"
					),
					hw_obesity: compareYears(
						currentCensusTract,
						previousCensusTract,
						"hw_obesity"
					),
					hw_diabetes: compareYears(
						currentCensusTract,
						previousCensusTract,
						"hw_diabetes"
					),
					hw_mentalhealth: compareYears(
						currentCensusTract,
						previousCensusTract,
						"hw_mentalhealth"
					),
					hw_under5_physicalhealth: compareYears(
						currentCensusTract,
						previousCensusTract,
						"hw_under5_physicalhealth"
					),
					compared_to_last_year: compareRank(
						currentCensusTract,
						previousCensusTract,
						"hw"
					),
				},
				abk: {
					valueRank: compareYears(
						currentCensusTract,
						previousCensusTract,
						"abk"
					),
					abk_g8math: compareYears(
						currentCensusTract,
						previousCensusTract,
						"abk_g8math"
					),
					abk_g3reading: compareYears(
						currentCensusTract,
						previousCensusTract,
						"abk_g3reading"
					),
					abk_hsincomplete: compareYears(
						currentCensusTract,
						previousCensusTract,
						"abk_hsincomplete"
					),
					abk_preschoolenroll: compareYears(
						currentCensusTract,
						previousCensusTract,
						"abk_preschoolenroll"
					),
					abk_under5_comskills: compareYears(
						currentCensusTract,
						previousCensusTract,
						"abk_under5_comskills"
					),
					abk_under5_socioemotional: compareYears(
						currentCensusTract,
						previousCensusTract,
						"abk_under5_socioemotional"
					),
					compared_to_last_year: compareRank(
						currentCensusTract,
						previousCensusTract,
						"abk"
					),
				},
				aic: {
					valueRank: compareYears(
						currentCensusTract,
						previousCensusTract,
						"aic"
					),
					aic_celldata: compareYears(
						currentCensusTract,
						previousCensusTract,
						"aic_celldata"
					),
					aic_broadband: compareYears(
						currentCensusTract,
						previousCensusTract,
						"aic_broadband"
					),
					aic_nointernet: compareYears(
						currentCensusTract,
						previousCensusTract,
						"aic_nointernet"
					),
					aic_hascomputer: compareYears(
						currentCensusTract,
						previousCensusTract,
						"aic_hascomputer"
					),
					aic_broadbandspeed: compareYears(
						currentCensusTract,
						previousCensusTract,
						"aic_broadbandspeed"
					),
					compared_to_last_year: compareRank(
						currentCensusTract,
						previousCensusTract,
						"aic"
					),
				},
				compared_to_last_year: compareRank(
					currentCensusTract,
					previousCensusTract,
					"wf"
				),
			},
			opportunity: {
				valueRank: compareYears(
					currentCensusTract,
					previousCensusTract,
					"opportunity"
				),
				pr: {
					valueRank: compareYears(
						currentCensusTract,
						previousCensusTract,
						"pr"
					),
					pr_turnout: compareYears(
						currentCensusTract,
						previousCensusTract,
						"pr_turnout"
					),
					pr_registration: compareYears(
						currentCensusTract,
						previousCensusTract,
						"pr_registration"
					),
					pr_homeownership: compareYears(
						currentCensusTract,
						previousCensusTract,
						"pr_homeownership"
					),
					compared_to_last_year: compareRank(
						currentCensusTract,
						previousCensusTract,
						"pr"
					),
				},
				aae: {
					valueRank: compareYears(
						currentCensusTract,
						previousCensusTract,
						"aae"
					),
					aae_graduate: compareYears(
						currentCensusTract,
						previousCensusTract,
						"aae_graduate"
					),
					aae_bachelors: compareYears(
						currentCensusTract,
						previousCensusTract,
						"aae_bachelors"
					),
					aae_associates: compareYears(
						currentCensusTract,
						previousCensusTract,
						"aae_associates"
					),
					compared_to_last_year: compareRank(
						currentCensusTract,
						previousCensusTract,
						"aae"
					),
				},
				pfc: {
					valueRank: compareYears(
						currentCensusTract,
						previousCensusTract,
						"pfc"
					),
					pfc_walkindex: compareYears(
						currentCensusTract,
						previousCensusTract,
						"pfc_walkindex"
					),
					pfc_cleancommute: compareYears(
						currentCensusTract,
						previousCensusTract,
						"pfc_cleancommute"
					),
					pfc_disconnected: compareYears(
						currentCensusTract,
						previousCensusTract,
						"pfc_disconnected"
					),
					pfc_childcaredeserts: compareYears(
						currentCensusTract,
						previousCensusTract,
						"pfc_childcaredeserts"
					),
					compared_to_last_year: compareRank(
						currentCensusTract,
						previousCensusTract,
						"pfc"
					),
				},
				inclusiveness: {
					valueRank: compareYears(
						currentCensusTract,
						previousCensusTract,
						"inclusiveness"
					),
					i_isolation: compareYears(
						currentCensusTract,
						previousCensusTract,
						"i_isolation"
					),
					i_linguistic: compareYears(
						currentCensusTract,
						previousCensusTract,
						"i_linguistic"
					),
					i_genderpaygap: compareYears(
						currentCensusTract,
						previousCensusTract,
						"i_genderpaygap"
					),
					i_dissimilarity: compareYears(
						currentCensusTract,
						previousCensusTract,
						"i_dissimilarity"
					),
					compared_to_last_year: compareRank(
						currentCensusTract,
						previousCensusTract,
						"inclusiveness"
					),
				},
				compared_to_last_year: compareRank(
					currentCensusTract,
					previousCensusTract,
					"opportunity"
				),
			},
			mhi: {
				rank: null,
				value: currentCensusTract["demographics"]["medianhhinc"],
				performance: null,
				compared_to_last_year: null,
			},
			similarLabels: [currentCensusTract["spi"]["peerGroups"]],
			url: "",
		};

		res.json(scorecard);
	} catch (err) {
		res.status(500).json(err.message);
	}
};

const getBaselayersDictionary = async (_req, res) => {
	try {
		res.json(baselayerData);
	} catch (err) {
		res.status(500).json(err.message);
	}
};

const createBaselayersData = async (req, res) => {
	try {
		const file = req?.file?.buffer;
		const { yearNumber } = req.params;
		const censusTracts = {};

		if (!file) {
			return res.status(404).json("File not found.");
		}

		const baselayerExists = await Baselayer.find({ year: yearNumber });
		if (baselayerExists && baselayerExists?.length > 0) {
			return res
				.status(400)
				.json(`Base layer already exists for ${yearNumber}.`);
		}

		// get workbook
		const workbook = getWorkbook(file);

		// get all sheets
		const missingSheets = findMissingSheets(workbook, requiredSheets);
		if (missingSheets) {
			return res
				.status(400)
				.json(
					`The following sheets are missing: ${missingSheets.join(
						", "
					)}`
				);
		}
		const files = {
			spi: {
				values: getSheet(workbook, "spi-values"),
				rankings: getSheet(workbook, "spi-rankings"),
				scorecards: getSheet(workbook, "spi-scorecards"),
				peerGroups: getSheet(workbook, "spi-peer-groups"),
			},
			cdc: getSheet(workbook, "cdc"),
			demographics: getSheet(workbook, "demographics"),
		};

		// add demographics data
		getRows(files.demographics).forEach((row) => {
			const obj = {};
			for (const key in row) {
				const layer = getContentKey("demographics", key);
				if (layer) {
					obj[layer.contentKey] = parseFloat(row[key] || 0);
				} else if (key === "Census Tract") {
					obj["censusTract"] = row[key].toString();
				} else {
					throw new Error(
						`Unknown field in demographics file: "${key}"`
					);
				}
			}
			const geoId = obj.censusTract;
			censusTracts[geoId] = {
				spi: {},
				cdc: {},
				demographics: removeCensusTractField(obj),
			};
		});

		// add cdc data
		getRows(files.cdc).forEach((row) => {
			const obj = {};
			for (const key in row) {
				const layer = getContentKey("cdc", key);
				if (layer) {
					obj[layer.contentKey] = parseFloat(row[key] || 0);
				} else if (key === "Census Tract") {
					obj["censusTract"] = row[key];
				} else {
					throw new Error(`Unknown field in cdc file: "${key}"`);
				}
			}
			const geoId = obj.censusTract;
			censusTracts[geoId]["cdc"] = removeCensusTractField(obj);
		});

		// add spi data
		getRows(files.spi.values).forEach((row) => {
			const obj = {};
			for (const key in row) {
				const layer = getContentKey("spi", key);
				if (layer) {
					obj[layer.contentKey] = {
						value: parseFloat(row[key] || 0),
					};
				} else if (key === "Census Tract") {
					obj["censusTract"] = row[key];
				} else {
					throw new Error(`Unknown field in spi-values: "${key}"`);
				}
			}

			const geoId = obj.censusTract;
			censusTracts[geoId]["spi"] = removeCensusTractField(obj);
		});
		getRows(files.spi.rankings).forEach((row) => {
			const obj = {};
			for (const key in row) {
				const layer = getContentKey("spi", key);
				if (layer) {
					obj[layer.contentKey] = parseInt(row[key] || 0);
				} else if (key === "Census Tract") {
					obj["censusTract"] = row[key];
				} else {
					throw new Error(`Unknown field in spi-rankings: "${key}"`);
				}
			}

			const geoId = obj.censusTract;
			for (const key in removeCensusTractField(obj)) {
				censusTracts[geoId]["spi"][key]["ranking"] = obj[key];
			}
		});
		getRows(files.spi.scorecards).forEach((row) => {
			const obj = {};
			for (const key in row) {
				const layer = getContentKey("spi", key);
				if (layer) {
					obj[layer.contentKey] = row[key] || "Expected";
				} else if (key === "Census Tract") {
					obj["censusTract"] = row[key];
				} else {
					throw new Error(
						`Unknown field in spi-scorecards: "${key}"`
					);
				}
			}

			const geoId = obj.censusTract;
			for (const key in removeCensusTractField(obj)) {
				censusTracts[geoId]["spi"][key]["scorecard"] = obj[key];
			}
		});
		getRows(files.spi.peerGroups).forEach((row) => {
			const obj = {};
			for (const key in row) {
				if (key === "Census Tract") {
					obj["censusTract"] = row[key];
				} else if (key === "Census Tract Peer Group") {
					obj["peerGroup"] = formatStringToArray(row[key]);
				} else {
					throw new Error(
						`Unkown field in spi-peer-groups: "${key}"`
					);
				}
			}

			const geoId = obj.censusTract;
			censusTracts[geoId]["spi"]["peerGroups"] = obj.peerGroup;
		});

		// create new baselayer
		const baselayer = new Baselayer({
			year: parseInt(yearNumber),
			censusTracts: [],
		});
		for (const key in censusTracts) {
			baselayer.censusTracts.push({
				geoId: key,
				spi: { ...censusTracts[key]["spi"] },
				cdc: { ...censusTracts[key]["cdc"] },
				demographics: { ...censusTracts[key]["demographics"] },
			});
		}
		const newBaselayer = await baselayer.save();

		res.json(newBaselayer);
	} catch (err) {
		res.status(500).json(err.message);
	}
};

const deleteBaselayersByYear = async (req, res) => {
	try {
		const { yearNumber } = req.params;

		const baselayers = await baselayerRepo.findByField({
			year: yearNumber,
		});
		if (!baselayers) {
			return res.status(404).json("Baselayers not found for given year.");
		}

		await baselayerRepo.deleteById(baselayers._id);
		res.json(`${yearNumber} has been deleted.`);
	} catch (err) {
		res.status(500).json(err.message);
	}
};

module.exports = {
	getBaselayers,
	getBaselayersByYear,
	getBaselayersByLayer,
	getBaselayersByKey,
	getScorecardData,
	getBaselayersDictionary,
	createBaselayersData,
	deleteBaselayersByYear,
};
