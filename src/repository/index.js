class GenericRepository {
	constructor(model) {
		this.model = model;
	}

	async create(newDoc) {
		return this.model.create(newDoc);
	}

	async findAll(query) {
		return this.model.find(query);
	}

	async findById(id) {
		return this.model.findById(id);
	}

	async findByField(field) {
		return this.model.findOne(field);
	}

	async updateById(id, newDoc) {
		return this.model.findByIdAndUpdate(id, newDoc, { new: true });
	}

	async deleteById(id) {
		return this.model.findByIdAndDelete(id);
	}

	async findSubdocument(parentId, subdocPath) {
		return this.model.findById(parentId).select(subdocPath);
	}

	async findSubdocumentById(parentId, subdocPath, subdocId) {
		const parent = await this.model.findById(parentId);

		if (!parent) return null;

		return parent[subdocPath].id(subdocId);
	}

	async createSubdocument(parentId, subdocPath, newSubdoc) {
		const document = await this.findById(parentId);
		document[subdocPath].push(newSubdoc);
		await document.save();
		return document[subdocPath];
	}

	async updateSubdocument(parentId, subdocPath, subdocId, updatedSubdoc) {
		const parent = await this.findById(parentId);
		const subdoc = parent[subdocPath].id(subdocId);

		if (!subdoc) return null;

		subdoc.set(updatedSubdoc);
		await parent.save();
		return subdoc;
	}

	async deleteSubdocument(parentId, subdocPath, subdocId) {
		const parent = await this.findById(parentId);

		if (!parent) return null;

		parent[subdocPath].remove({ _id: subdocId });
		await parent.save();
		return parent[subdocPath];
	}
}

module.exports = GenericRepository;
