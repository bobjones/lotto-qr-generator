# lotto
TX Lotto Number Generator


## Setup EC2 Instance


### Setup httpd

```sh
# Install
sudo yum install httpd
# Start
sudo service httpd start
# Start httpd when server restarts
sudo chkconfig httpd on
# Set permissions
cd /var/www/html/
sudo chgrp ec2-user .
sudo chmod 775 .
```

### Install libraries

```sh
sudo yum install qrencode
sudo yum install lynx
```


### Setup script

```sh
chmod 755 lotto.sh
crontab -e
```

then add cron job

```sh
# Generate QR code every night. 11:15 UTC = 5/6:15 AM Central
15 11 * * * /home/ec2-user/lotto.sh
```

