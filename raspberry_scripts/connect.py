import yaml
import os
from time import sleep

print('starting cron')
with open("/home/pi/intelligent-house/raspberry_scripts/config.yml", 'r') as ymlfile:
  cfg = yaml.load(ymlfile)

temperatureSensorDelay = cfg['delays']['temperature']

for temperatureSensor in cfg['sensors']['temperature']:
  pathToFile = cfg['sensors']['temperature'][temperatureSensor]['path']
  # os.system(f'nohup python3 -u temperature.py {pathToFile} {temperatureSensorDelay} {temperatureSensor} &')
  os.system('nohup python3 -u /home/pi/intelligent-house/raspberry_scripts/temperature.py ' + pathToFile + ' ' + str(temperatureSensorDelay) + ' ' + temperatureSensor + ' > /home/pi/out_' + temperatureSensor + '.txt &')
  sleep(10)
