const axios = require("axios");

const API_KEY = "AIzaSyA5RZrcYf3X6Q-sXjXD-mllebH8Unyr1lg";

const getPlaceCensusTract = async (req, res) => {
	try {
		const { placeId } = req.params;

		const fields = "geometry/location";
		const googleResponse = await axios.get(
			`https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&fields=${fields}&key=${API_KEY}`
		);
		const { lat: latitude, lng: longitude } =
			googleResponse.data.result.geometry.location;

		const response = await axios.get(
			`https://geocoding.geo.census.gov/geocoder/geographies/coordinates?x=${longitude}&y=${latitude}&benchmark=4&vintage=4&format=JSON`
		);
		const censusTracts =
			response.data?.result?.geographies?.["Census Tracts"];
		if (censusTracts?.length === 0) {
			res.status(400).json("No census tract found.");
		}

		const geoId = censusTracts[0]["GEOID"];

		res.json({
			latitude,
			longitude,
			census_tract: geoId.slice(1),
		});
	} catch (err) {
		res.status(500).json(err.message);
	}
};

module.exports = {
	getPlaceCensusTract,
};
