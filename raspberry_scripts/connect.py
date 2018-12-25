import yaml
import os
from time import sleep

print('starting cron')
with open("/home/pi/intelligent-house/raspberry_scripts/config.yml", 'r') as ymlfile:
  cfg = yaml.load(ymlfile)

temperatureSensorDelay = cfg['delays']['temperature']
humiditySensorDelay = cfg['delays']['humidity']

for temperatureSensor in cfg['sensors']['temperature']:
  sleep(60)
  pathToFile = cfg['sensors']['temperature'][temperatureSensor]['path']
  # os.system(f'nohup python3 -u temperature.py {pathToFile} {temperatureSensorDelay} {temperatureSensor} &')
  os.system('nohup python3 -u /home/pi/intelligent-house/raspberry_scripts/temperature.py ' + pathToFile + ' ' + str(temperatureSensorDelay) + ' ' + temperatureSensor + ' > /home/pi/out_' + temperatureSensor + '.txt &')

for humiditySensor in cfg['sensors']['humidity']:
  sleep(60)
  gpioPin = str(cfg['sensors']['humidity'][humiditySensor])
  os.system('nohup python3 -u /home/pi/intelligent-house/raspberry_scripts/humidity.py ' + gpioPin + ' ' + str(humiditySensorDelay) + ' ' + humiditySensor + ' > /home/pi/out_' + humiditySensor + '.txt &')
