#/bin/bash
# Variables to Edit
echo "*********************************************"
echo "General Purpose script for loading FIMS data."
echo "Put data you want to load in the filesToLoad.txt file"
echo "*********************************************"
echo ""
echo "Processing the following files:"

# the following command populated the npnList array variable with the filenames listed 
# in the filesToLoad.txt filename
IFS=$'\r\n' GLOBIGNORE='*' command eval  'npnList=($(cat filesToLoad.txt))'


########################
# Code
########################
# Loop values
for i in "${npnList[@]}"
do
    # Here we call the fims-runner script
    echo $i
done
