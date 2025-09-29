/**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
export const up = async (db, client) => {
    console.log("Applying migration (ESM): add-isModerated-to-users.up");
    const usersCollection = db.collection('users');
    const filter = { isModerated: { $exists: false } };
    const update = { $set: { isModerated: false } };
    const result = await usersCollection.updateMany(filter, update);
    console.log(`Updated ${result.modifiedCount} documents.`);
};

/**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
export const down = async (db, client) => {
    console.log("Reverting migration (ESM): add-isModerated-to-users.down");
    const usersCollection = db.collection('users');
    const filter = { isModerated: false };
    const update = { $unset: { isModerated: "" } };
    const result = await usersCollection.updateMany(filter, update);
    console.log(`Reverted ${result.modifiedCount} documents.`);
};
