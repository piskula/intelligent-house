import yaml
import os

with open("./config.yml", 'r') as ymlfile:
  cfg = yaml.load(ymlfile)

temperatureSensorDelay = cfg['delays']['temperature']

for temperatureSensor in cfg['sensors']['temperature']:
  pathToFile = cfg['sensors']['temperature'][temperatureSensor]['path']
  os.system(f'nohup python3 -u temperature.py {pathToFile} {temperatureSensorDelay} {temperatureSensor} &')
