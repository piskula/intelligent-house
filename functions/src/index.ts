import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import MessagingPayload = admin.messaging.MessagingPayload;
import DataSnapshot = admin.database.DataSnapshot;

admin.initializeApp();

const ERROR_DB = 'activeErrorNotification';


const getLastValues = function (): Promise<DataSnapshot[]> {
  return admin.database().ref().child('data')
    .once('value')
    .then(data => {
      const lastValues: Promise<DataSnapshot>[] = [];

      data.forEach(sensor => {
        const sensorId = sensor.key;
        const promiseLastValue: Promise<DataSnapshot> = admin.database().ref().child('/data/' + sensorId)
          .orderByChild("timestamp")
          .limitToLast(1)
          .once('value');

        lastValues.push(promiseLastValue);
        return false;
      });

      return Promise.all(lastValues);
    });
};

const getListOfDeadSensors = function (data: DataSnapshot[], threshold: number): Object {
  const myErrorMap = {};
  data.forEach(lastValue => {
    const sensorId = lastValue.key;

    lastValue.forEach(_value => {
      if (_value.val().timestamp < threshold) {
        myErrorMap[sensorId] = '';
      }
      return true;
    });
  });

  return myErrorMap;
};

/*
 * This trigger add timestamp to every value (on Raspberry Pi we cannot guarantee correct time sync)
 */
exports.fillTimestamp = functions.database.ref('/data/{sensorId}/{pushId}').onCreate((snapshot, context) => {
  admin.database().ref(ERROR_DB)
    .child(context.params.sensorId)
    .remove()
    .catch(err => console.log(err));

  return snapshot.ref
    .child('timestamp')
    .set(admin.database.ServerValue.TIMESTAMP);
});

exports.refreshStatus = functions.https.onRequest((request, response) => {
  admin.database().ref().child("deathThreshold")
    .once('value')
    .then(deathThresholdInMinutes => {
      const threshold = new Date().getTime() - deathThresholdInMinutes.val() * 60 * 1000;

      getLastValues()
        .then((lastValues: DataSnapshot[]) => {
          const deadSensorList = getListOfDeadSensors(lastValues, threshold);
          admin.database().ref(ERROR_DB).update(deadSensorList)
            .then(() => {

              admin.database().ref('lastDeathThresholdCheck')
                .set(new Date().getTime())
                .catch(err => console.error(err));
              response.send(deadSensorList);

            })
            .catch(err => console.error(err));
        })
        .catch(err => console.error(err));
    })
    .catch(err => console.error(err));
});

/*
 * This trigger notify device with each change in ERROR_DB database (when some sensor die or come alive)
 */
exports.sendErrorNotification = functions.database.ref(ERROR_DB).onWrite(ev => {
  admin.database().ref().child(ERROR_DB)
    .once('value')
    .then(errors => {
      const errorSensorIds: String[] = [];

      errors.forEach(err => {
        errorSensorIds.push(err.key);
        return false;
      });

      const payload: MessagingPayload = {
        data: {
          title: 'Mojko',
          subtitle: JSON.stringify(errorSensorIds),
        },
      };

      admin.database().ref().child("firebaseId")
        .once('value')
        .then(snapshot => {
          admin.messaging().sendToDevice(snapshot.val(), payload)
            .catch(err => console.error(err));
          return ev;
        })
        .catch(err => console.error(err));
    })
    .catch(err => console.error(err));
});
