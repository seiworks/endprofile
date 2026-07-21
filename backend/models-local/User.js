// Mock Mongoose Model for User using NeDB
const db = require('../local-db');
const bcrypt = require('bcrypt');

class UserModel {
    static async findOne(query) {
        const user = await db.users.findOne(query);
        if (!user) return null;
        return new UserModel(user);
    }

    static async create(data) {
        const user = await db.users.insert(data);
        return new UserModel(user);
    }
    
    // ... add other needed static methods like find, findById, etc.

    constructor(data) {
        Object.assign(this, data);
        // Map _id to id if needed, or ensure id is available
        this.id = this._id;
    }

    async comparePassword(password) {
        return bcrypt.compare(password, this.passwordHash);
    }
}

module.exports = UserModel;
