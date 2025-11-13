/**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
export const up = async (db, client) => {
    console.log("Applying migration: add tgId to users.up");

    const usersCollection = db.collection('users');

    // Ищем только те документы, где поле tgId еще не существует.
    // Это делает миграцию безопасной для повторного запуска (идемпотентной).
    const filter = { tgId: { $exists: false } };

    // Устанавливаем новое поле tgId со значением null.
    const update = { $set: { tgId: null } };

    const result = await usersCollection.updateMany(filter, update);

    console.log(`Updated ${result.modifiedCount} documents.`);
};

/**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
export const down = async (db, client) => {
    console.log("Reverting migration: add tgId to users.down");

    const usersCollection = db.collection('users');

    // Для отката мы просто удаляем поле tgId из всех документов.
    const update = { $unset: { tgId: "" } };

    // Применяем ко всем документам. Оператор $unset не вызовет ошибки,
    // если поля в каком-то документе уже отсутствуют.
    const result = await usersCollection.updateMany({}, update);

    console.log(`Reverted ${result.modifiedCount} documents.`);
};