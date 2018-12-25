import Adafruit_DHT as dht
import yaml
import sys
from time import gmtime, strftime, sleep
import firebase_admin
from firebase_admin import credentials, db

# List of args
# 0: script file name
# 1: GPIO pin
# 2: delay in minutes
# 3: name of sensor

gpioPin = sys.argv[1]
sensorName = sys.argv[3]

def log(msg):
  current_time = strftime("%Y-%m-%d %H:%M:%S.%m", gmtime())
  # print(f'{current_time} {sys.argv[0]} {gpioPin} -> {msg}')
  print(current_time + ' ' + sys.argv[0] + ' ' + gpioPin + ' -> ' + msg)

with open("/home/pi/intelligent-house/raspberry_scripts/config.yml", 'r') as ymlfile:
  cfg = yaml.load(ymlfile)

firebase_admin.initialize_app(
  credentials.Certificate(cfg['serviceKeyFile']),
  {'databaseURL': cfg['firebaseUrl']}
)

root = db.reference()
# log(f'Script started for GPIO: {gpioPin}')
log('Script started for GPIO ' + gpioPin)

while True:
  sleep(int(sys.argv[2]) * 60)

  humi, temp = dht.read_retry(dht.DHT22, gpioPin)
  log('Value humidity: ' + str(humi))
  log('Value temperature: ' + str(temp))
  
  root.child(cfg['dataTable']).child(sensorName + '_temp').push(temp)
  root.child(cfg['dataTable']).child(sensorName + '_humi').push(humi)
