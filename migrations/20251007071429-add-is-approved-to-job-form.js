/**
 * @param {import('mongodb').Db} db
 * @param {import('mongodb').MongoClient} client
 */
export async function up(db, client) {
    console.log("Applying migration: add-isApproved-to-job-forms.up");

    // 1. Выбираем коллекцию. Mongoose по умолчанию создает имена в нижнем регистре
    // и множественном числе (JobFormClass -> jobforms).
    // Проверьте точное имя в вашей базе данных.
    const jobFormsCollection = db.collection('job-forms');

    // 2. Определяем фильтр: ищем все документы, у которых поле `isApproved` НЕ СУЩЕСТВУЕТ.
    // Это предотвратит повторное обновление уже обработанных документов.
    const filter = { isApproved: { $exists: false } };

    // 3. Определяем обновление: добавляем поле `isApproved` со значением `false`.
    const update = { $set: { isApproved: false } };

    // 4. Выполняем операцию `updateMany`, чтобы обновить все найденные документы.
    const result = await jobFormsCollection.updateMany(filter, update);

    console.log(`Updated ${result.modifiedCount} documents in 'jobforms' collection.`);
}

/**
 * @param {import('mongodb').Db} db
 * @param {import('mongodb').MongoClient} client
 */
export async function down(db, client) {
    console.log("Reverting migration: add-isApproved-to-job-forms.down");

    const jobFormsCollection = db.collection('job-forms');

    // 1. Фильтр для отката: мы будем удалять поле у всех документов.
    const filter = {};

    // 2. Определяем обновление: УДАЛЯЕМ поле `isApproved` из документов.
    const update = { $unset: { isApproved: "" } };

    // 3. Выполняем операцию.
    const result = await jobFormsCollection.updateMany(filter, update);

    console.log(`Reverted ${result.modifiedCount} documents in 'jobforms' collection.`);
}