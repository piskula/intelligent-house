import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

exports.fillTimestamp = functions.database.ref('/data/{room_id}/{value_id}').onCreate((snapshot, context) => {
  return snapshot.ref
    .child(context.params.pushId)
    .child('timestamp')
    .set(admin.database.ServerValue.TIMESTAMP);
});
