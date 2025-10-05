/**
 * @param {import('mongodb').Db} db
 * @param {import('mongodb').MongoClient} client
 */
export async function up(db, client) {
    console.log("Applying migration: add-email-and-employeeid-to-jobforms.up");

    // 1. Выбираем коллекцию 'jobforms'
    const jobFormsCollection = db.collection('job-forms');

    // 2. Определяем фильтр: ищем документы, у которых отсутствует
    // хотя бы одно из полей: `email` ИЛИ `employeeId`.
    const filter = {
        $or: [
            { email: { $exists: false } },
            { employeeId: { $exists: false } },
        ]
    };

    // 3. Определяем обновление: добавляем новые поля со значениями по умолчанию.
    // Для `email` установим плейсхолдер, а для `employeeId` - `null`.
    const update = {
        $set: {
            email: '', // Заглушка для email
            employeeId: null,                  // null для ObjectId
        }
    };

    // 4. Выполняем операцию `updateMany`
    const result = await jobFormsCollection.updateMany(filter, update);

    console.log(`Updated ${result.modifiedCount} documents in 'jobforms' collection.`);
}

/**
 * @param {import('mongodb').Db} db
 * @param {import('mongodb').MongoClient} client
 */
export async function down(db, client) {
    console.log("Reverting migration: add-email-and-employeeid-to-jobforms.down");

    const jobFormsCollection = db.collection('job-forms');

    // 1. Фильтр для отката (опционально, можно оставить пустым `{}`)
    const filter = {};

    // 2. Определяем обновление: УДАЛЯЕМ добавленные поля
    const update = {
        $unset: {
            email: "",
            employeeId: "",
        }
    };

    // 3. Выполняем операцию
    const result = await jobFormsCollection.updateMany(filter, update);

    console.log(`Reverted ${result.modifiedCount} documents in 'jobforms' collection.`);
}