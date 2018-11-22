import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import MessagingPayload = admin.messaging.MessagingPayload;
import DataSnapshot = admin.database.DataSnapshot;
import * as moment from 'moment';

admin.initializeApp();

const ERROR_DB = 'activeErrorNotification';
const DATA_TABLE = 'data';
const DATA_TEMPORARY_TABLE = 'data_temp';

const getLastDayForEachSensor = function (): Promise<DataSnapshot[]> {
  return admin.database().ref().child('data')
    .once('value')
    .then(data => {
      const lastDays: Promise<DataSnapshot>[] = [];

      data.forEach(sensor => {
        const sensorId = sensor.key;
        const promiseLastDay: Promise<DataSnapshot> = admin.database().ref().child('/data/' + sensorId)
          .orderByKey()
          .limitToLast(1)
          .once('value');

        lastDays.push(promiseLastDay);
        return false;
      });

      return Promise.all(lastDays);
    });
};

interface CustomResponse {
  promises: Promise<DataSnapshot[]>;
  sensors: string[];
}

const getLastTimestampAndValueForEachSensor = function (lastDaysMap: Map<string, string>): CustomResponse {
  const lastDays: Promise<DataSnapshot>[] = [];
  const sensorList: string[] = [];
  lastDaysMap.forEach((value, key) => {
    const promiseLastDay: Promise<DataSnapshot> = admin.database().ref().child('/data/' + key + '/' + value)
      .orderByKey()
      .limitToLast(1)
      .once('value');

    lastDays.push(promiseLastDay);
    sensorList.push(key);
  });
  return {promises: Promise.all(lastDays), sensors: sensorList} as CustomResponse;
};

const getDeathThreshold = function (): Promise<number> {
  return admin.database().ref().child("deathThreshold")
    .once('value')
    .then(deathThresholdInMinutes => {
      return new Date().getTime() - deathThresholdInMinutes.val() * 60 * 1000;
    });
};

const filterDeadSensors = function (possibleErrors: DataSnapshot[], sensors: string[]): Promise<Object> {
  return getDeathThreshold().then(threshold => {
    const myErrorMap = {};
    possibleErrors.forEach((possibleError, i) => {
      const value = possibleError.val(); // { "1542724863667": 22.687 }
      const timestampToCheck: number = parseInt(Object.keys(value)[0]);

      if (timestampToCheck < threshold) {
        myErrorMap[sensors[i]] = timestampToCheck;  // {.., "temp_room_1": "1542724863667", ..}
      }
    });
    return myErrorMap;
  });
};

const getActualErrorSensors = function (data: DataSnapshot[]): Promise<Object> {
  // this map gives you last day for each sensor
  const lastDaysMap: Map<string, string> = new Map();

  // first we have to realize, which day is the last for given sensor
  data.forEach(lastDay => {
    const sensorId = lastDay.key;
    lastDay.forEach(_value => {
      const sensorLastDayId = _value.key; // like 2018-11-20
      lastDaysMap.set(sensorId, sensorLastDayId); // "like temp_room_1" -> "2018-11-20"
      return true;
    });
  });

  // then we get last value for each
  const response: CustomResponse = getLastTimestampAndValueForEachSensor(lastDaysMap);
  return response.promises
  // and then we take only sensors, whose last timestamp is before our threshold and return them as Promise
    .then(possibleErrors => filterDeadSensors(possibleErrors, response.sensors));
};

/*
 * This trigger add timestamp to every value (on Raspberry Pi we cannot guarantee correct time sync)
 */
exports.fillTimestamp = functions.database.ref(`/${DATA_TEMPORARY_TABLE}/{sensorId}/{pushId}`)
  .onCreate((snapshot, context) => {
    admin.database().ref(ERROR_DB)
      .child(context.params.sensorId)
      .remove()
      .catch(err => console.error(new Error(err)));

    const dayKey: string = moment().format("YYYY-MM-DD");

    admin.database().ref(DATA_TABLE)
      .child(context.params.sensorId)
      .child(dayKey)
      .child(`/${new Date().getTime()}`)
      .set(snapshot.val())
      .catch(err => console.error(new Error(err)));

    return snapshot.ref.remove()
      .catch(err => console.error(new Error(err)));
  });

exports.refreshStatus = functions.https.onRequest((request, response) => {

  getLastDayForEachSensor().then((lastDays: DataSnapshot[]) => {

    getActualErrorSensors(lastDays).then(deadSensorList => {

      // update active error DB, from which notifications are sent
      admin.database().ref(ERROR_DB).update(deadSensorList).then(() => {

        // and then update last check timestamp
        admin.database().ref('lastDeathThresholdCheck')
          .set(new Date().getTime())
          .catch(err => console.error(err));
        response.send(deadSensorList);

      }).catch(err => console.error(err));
    }).catch(err => console.error(err));
  }).catch(err => console.error(err));
});

/*
 * This trigger notify device with each change in ERROR_DB database (when some sensor die or come alive)
 */
exports.sendErrorNotification = functions.database.ref(ERROR_DB).onWrite(ev => {
  return admin.database().ref().child(ERROR_DB)
    .once('value')
    .then(errors => {
      const errorSensorIds: String[] = [];

      errors.forEach(err => {
        errorSensorIds.push(err.key);
        return false;
      });

      console.log(errorSensorIds);

      const payload: MessagingPayload = {
        data: {
          title: 'Mojko',
          subtitle: JSON.stringify(errorSensorIds),
        },
      };

      return admin.database().ref().child("firebaseId")
        .once('value')
        .then(firebaseId => {
          admin.messaging().sendToDevice(firebaseId.val(), payload)
            .catch(err => console.error(new Error(err)));
        })
        .catch(err => console.error(new Error(err)));
    });
});
