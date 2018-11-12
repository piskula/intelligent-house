#  script for testing - push value for sensor to Firebase

# List of args
# 1: sensor_name
# 2: sensor_value

import yaml
import sys
import firebase_admin
from firebase_admin import credentials, db

sensorName = sys.argv[1]
value = float(sys.argv[2])

with open("./config.yml", 'r') as ymlfile:
  cfg = yaml.load(ymlfile)

firebase_admin.initialize_app(
  credentials.Certificate(cfg['serviceKeyFile']),
  {'databaseURL': cfg['firebaseUrl']}
)

root = db.reference()

root.child('data').child(sensorName).push({
  'value': value
})
