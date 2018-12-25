### What do you need:

- RaspberryPi with Python

### How to run
- in configuration/interfaces: enable SSH connection on RaspberryPi, if you want to be able to remotely connect to device
- in configuration/interfaces: enable 1-wire
- `pip3 install firebase_admin`
- `pip3 install pyyaml`
- clone this repository to `/home/pi` and change directory to this file
  - `git clone https://github.com/piskula/intelligent-house`
  - `cd intelligent-house/raspberry_scripts`
  - add firebase `service-key.json` file to `/home/pi/intelligent-house`
- add `dtoverlay=w1-gpio` to `/boot/config.txt` (but maybe it is already present at the end of the file) and reboot
- then locate one-wire sensors in `/sys/bus/w1/devices/{sensor_id}/w1_slave`

in case of problems you may try
- `sudo modprobe w1-gpio`
- `sudo modprobe w1-therm`
