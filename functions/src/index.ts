import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import MessagingPayload = admin.messaging.MessagingPayload;

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

exports.sendNotification = functions.https.onRequest((req, res) => {
  const payload: MessagingPayload = {
    data: {
      title: 'Mojko',
      subtitle: 'Hopko',
    },
  };

  admin.database().ref().child("firebaseId")
    .once('value')
    .then(snapshot => {
      admin.messaging().sendToDevice(snapshot.val(), payload)
        .then(() => res.send("OK"))
        .catch(err => res.status(500).send("Error occurred while sending notification"));
    })
    .catch(err => res.status(500).send("App has not been installed yet (firebaseId not available)"));
});
