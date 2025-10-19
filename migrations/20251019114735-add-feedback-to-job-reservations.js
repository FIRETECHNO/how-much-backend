/**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
export const up = async (db, client) => {
    console.log("Applying migration: add feedback fields to job-reservations.up");

    const reservationsCollection = db.collection('job-reservations');

    // Ищем документы, где хотя бы одно из полей обратной связи отсутствует,
    // чтобы сделать миграцию безопасной для повторного запуска (идемпотентной).
    const filter = {
        $or: [
            { employerFeedback: { $exists: false } },
            { employeeFeedback: { $exists: false } },
        ]
    };

    // Устанавливаем новые поля с их дефолтной структурой.
    const update = {
        $set: {
            employerFeedback: {
                textContent: null,
                sentDate: null
            },
            employeeFeedback: {
                textContent: null,
                sentDate: null
            }
        }
    };

    const result = await reservationsCollection.updateMany(filter, update);

    console.log(`Updated ${result.modifiedCount} documents in 'job-reservations' collection.`);
};

/**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
export const down = async (db, client) => {
    console.log("Reverting migration: add feedback fields to job-reservations.down");

    const reservationsCollection = db.collection('job-reservations');

    // Для отката просто удаляем добавленные поля из всех документов.
    const update = {
        $unset: {
            employerFeedback: "",
            employeeFeedback: "",
        }
    };

    const result = await reservationsCollection.updateMany({}, update);

    console.log(`Reverted ${result.modifiedCount} documents in 'job-reservations' collection.`);
};