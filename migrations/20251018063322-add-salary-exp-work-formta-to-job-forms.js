/**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
export const up = async (db, client) => {
    console.log("Applying migration: add salary, experience, and workFormat to job-forms.up");

    const jobFormsCollection = db.collection('job-forms');

    // Ищем только те документы, где хотя бы одно из новых полей отсутствует.
    // Это делает миграцию идемпотентной (безопасной для повторного запуска).
    const filter = {
        $or: [
            { salaryFrom: { $exists: false } },
            { salaryTo: { $exists: false } },
            { experience: { $exists: false } },
            { workFormat: { $exists: false } },
        ]
    };

    // Устанавливаем новые поля.
    // Для обязательных полей (experience, workFormat) необходимо задать значение по умолчанию,
    // чтобы существующие документы не стали невалидными.
    const update = {
        $set: {
            salaryFrom: null,
            salaryTo: null,
            experience: 'не указан', // Значение по умолчанию для обязательного поля
            workFormat: 'не указан', // Значение по умолчанию для обязательного поля
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
    console.log("Reverting migration: add salary, experience, and workFormat to job-forms.down");

    const jobFormsCollection = db.collection('job-forms');

    // Для отката мы просто удаляем добавленные поля из всех документов.
    const update = {
        $unset: {
            salaryFrom: "",
            salaryTo: "",
            experience: "",
            workFormat: "",
        }
    };

    // Применяем ко всем документам. Оператор $unset не вызовет ошибки,
    // если поля в каком-то документе уже отсутствуют.
    const result = await jobFormsCollection.updateMany({}, update);

    console.log(`Reverted ${result.modifiedCount} documents in 'job-forms' collection.`);
};