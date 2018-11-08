import time
import re
import yaml
import firebase_admin
from firebase_admin import credentials, db

with open("./config.yml", 'r') as ymlfile:
  cfg = yaml.load(ymlfile)

cred = credentials.Certificate(cfg['serviceKeyFile'])
firebase_admin.initialize_app(cred, {
  'databaseURL': cfg['firebaseUrl']
})

root = db.reference()

while True:
  time.sleep(4)
  file_temp_room_1 = open('w1_slave', 'r').read(90)
  value = float(re.compile('t=([\d]{3,6})').findall(file_temp_room_1)[0])

  root.child('data').child('temp_room_01').push({
    'value': value
  })
