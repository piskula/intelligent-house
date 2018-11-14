### before use:

- add `dtoverlay=w1-gpio` to `/boot/config.txt` and reboot
- `pip3 install firebase_admin`
- `pip3 install pyyaml`
- `sudo modprobe w1-gpio`
- `sudo modprobe w1-therm`
- then locate one-wire sensors in `/sys/bus/w1/devices`
