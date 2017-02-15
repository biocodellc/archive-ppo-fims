#!/usr/bin/python

import ast
import json
import csv
import requests
import sys
import os
import getopt
from pprint import pprint

username = ''
password = ''
outputfile = ''
reload(sys)
sys.setdefaultencoding('utf8')


def main(argv):
   global username 
   global password
   global outputfile
   usage = 'loader.py -u <username> -p <password> -i <inputfile>'
   try:
      opts, args = getopt.getopt(argv,"u:p:i:h",["username=","password=","inputfile="])
   except getopt.GetoptError:
      print usage 
      sys.exit(2)
   for opt, arg in opts:
      if opt == '-h':
      	 print usage 
         sys.exit()
      elif opt in ("-u", "--username"):
         username = arg
      elif opt in ("-p", "--password"):
         password = arg
      elif opt in ("-i", "--inputfile"):
         outputfile= arg
   if username == '' or password == '' or  outputfile == '':
   	print usage
	sys.exit(2)

if __name__ == "__main__":
   main(sys.argv[1:])

print outputfile;

# Authenticate
url = 'http://www.plantphenology.org/rest/v1/authenticationService/login'
payload = {'username': username, 'password': password}
auth = requests.post(url, data=payload )

# Return Graphs
url = 'http://www.plantphenology.org/rest/v1.1/projects/27/graphs'
r = requests.get(url, cookies=auth.cookies)

# Loop expeditions
#for expedition in r.json():
#    # Get Expedition Code
#    if not ("TEST") in expedition["expeditionCode"]:
#    	print "processing " + expedition["expeditionCode"]
##    	writeOutput(expedition["expeditionCode"], csvWriter, 0, auth)
