#!/usr/bin/env bash
set -ex

sudo apt-get update
sudo apt-get install -y unzip xvfb libxi6 libgconf-2-4

wget https://chromedriver.storage.googleapis.com/86.0.4240.22/chromedriver_linux64.zip
unzip chromedriver_linux64.zip
sudo mv chromedriver /usr/bin/chromedriver
sudo chown root:root /usr/bin/chromedriver
sudo chmod +x /usr/bin/chromedriver

# just for diagnostics
echo $(google-chrome --version)

