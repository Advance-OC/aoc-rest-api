const validate = (schema) => {
	return (body) => {
		const { error } = schema.validate(body);
		return {
			error: error?.details[0]?.message,
		};
	};
};

module.exports = validate;
