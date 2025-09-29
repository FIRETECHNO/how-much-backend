/**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
export const up = async (db, client) => {
    console.log("Applying migration: add-contacts-to-job-forms.up");
    const jobFormsCollection = db.collection('job-forms');

    const filter = {
        $or: [
            { phone: { $exists: false } },
            { telegram: { $exists: false } },
        ]
    };

    const update = {
        $set: {
            phone: 'не указан',
            telegram: 'не указан',
        }
    };

    const result = await jobFormsCollection.updateMany(filter, update);

    console.log(`Updated ${result.modifiedCount} documents in 'job-forms' collection.`);
};

/**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
export const down = async (db, client) => {
    console.log("Reverting migration: add-contacts-to-job-forms.down");

    const jobFormsCollection = db.collection('job-forms');

    const filter = {};

    const update = {
        $unset: {
            phone: "",
            telegram: "",
        }
    };

    const result = await jobFormsCollection.updateMany(filter, update);

    console.log(`Reverted ${result.modifiedCount} documents in 'job-forms' collection.`);
};
