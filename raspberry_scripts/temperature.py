import re
import yaml
import sys
from time import gmtime, strftime, sleep
import firebase_admin
from firebase_admin import credentials, db

# List of args
# 0: script file name
# 1: sensor input file
# 2: delay
# 3: name of sensor

inputFile = sys.argv[1]
sensorName = sys.argv[3]

def log(msg):
  current_time = strftime("%Y-%m-%d %H:%M:%S.%m", gmtime())
  # print(f'{current_time} {sys.argv[0]} {inputFile} -> {msg}')
  print(current_time + ' ' + sys.argv[0] + ' ' + inputFile + ' -> ' + msg)

with open("/home/pi/intelligent-house/raspberry_scripts/config.yml", 'r') as ymlfile:
  cfg = yaml.load(ymlfile)

firebase_admin.initialize_app(
  credentials.Certificate(cfg['serviceKeyFile']),
  {'databaseURL': cfg['firebaseUrl']}
)

root = db.reference()
# log(f'Script started for: {inputFile}')
log('Script started for ' + inputFile)

while True:
  sleep(int(sys.argv[2]))

  try:
    file_temp_room_1 = open(inputFile, 'r').read(90)
  except FileNotFoundError:
    # log(f'FileNotFound: {inputFile}')
    log('FileNotFound: ' + inputFile)
    continue

  value = float(re.compile('t=([\d]{3,6})').findall(file_temp_room_1)[0])
  log('Value: ' + str(value / 1000))
  root.child('data').child(sensorName).push({
    'value': value / 1000
  })
