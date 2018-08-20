const cloudSQLconnection = require('./cloudsqlconnection');

/**
 * Prototype for Decisioning for messages published to PubSub to be added/updated in Cloud SQL using a Cloud Function with a PubSub trigger.
 * @param {any} data data from the pubsub message
 * @param {any} context 
 */
exports.PubSubToCloudSQLPrototype = (data, context) => {
    const pubsubMsg = data;

    // When testing the Cloud function data contains the JSON object but for PubSub data contains an object of data which is base64 encoded.
    // The following line standardises the dataToLoad to a JSON object regardless if using the cloud function test option or PubSub. 
    const dataToLoad = pubsubMsg.data ? JSON.parse(Buffer.from(pubsubMsg.data, 'base64').toString()) : pubsubMsg;
    console.log(`PubSub Message:, ${JSON.stringify(dataToLoad)}!`);

    // Use a connection pool and an SQL statement which will insert if the tracking ID doesn't exist or update if it does. 
    const pool = cloudSQLconnection.createPool();
    const sql = "INSERT INTO CustomerAttributes SET ? ON DUPLICATE KEY UPDATE ?";

    // To perform an update statement the query needs the JSON object without the TrackingID for the values to update
    const dataToLoadWithoutID = JSON.parse(JSON.stringify(dataToLoad));
    delete dataToLoadWithoutID["TrackingID"];

    // Execute the sql query using for the first ? and dataToLoadWithoutID for the second ? in the SQL statement
    pool.query(sql, [dataToLoad, dataToLoadWithoutID], function (error, results, fields) {
        if (error) throw error;
        // Log the results to the console to show in Stackdriver logging
        console.log(`Result of insert/update: ${JSON.stringify(results)}!`);
    });
};