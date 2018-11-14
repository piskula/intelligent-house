import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

exports.fillTimestamp = functions.database.ref('/data/{room_id}/{pushId}').onCreate((snapshot, context) => {
  return snapshot.ref
    .child('timestamp')
    .set(admin.database.ServerValue.TIMESTAMP);
});

exports.refreshStatus = functions.https.onRequest((req, res) => {
  admin.database().ref().child("/data/temp_room_2")
      .orderByChild("timestamp")
      .limitToLast(1)
      .once('value')
      .then(snapshot => res.send(snapshot.val()))
      .catch(err => res.send("Err: " + err));
});
