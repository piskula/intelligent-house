import time
from random import randint
import firebase_admin
from firebase_admin import credentials, db

cred = credentials.Certificate('../service-key.json')
firebase_admin.initialize_app(cred, {
  'databaseURL': 'https://intelligent-house-test.firebaseio.com/'
})

root = db.reference()

for i in range(0, 10):
  time.sleep(4)
  value = randint(20000,25000) / float(1000)
  root.child('data').child('temp_room_01').push({
    'value' : value
  })
