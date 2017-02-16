#/bin/bash
# Variables to Edit
echo "*********************************************"
echo "General Purpose script for loading FIMS data."
echo "*********************************************"
echo ""

# Global variables
# location of python_tools script
python_tools_loader=/Users/jdeck/IdeaProjects/biocode-fims-python-tools/loader.py
# base uri for fims
fims_uri=http://www.plantphenology.org/rest/v2 
# help text
helptext="Usage: $0 [-u <username>] [-p <password>] [-P <project_id>] [-f <file_parser>] \n
	\t-f <file_parser> is a tab delimited text file containing expedition codes and file names to load \n
	\t-P <project_id> obtain project_id from FIMS services" 

usage() { echo -e $helptext 1>&2; exit 1; }

# assign variables
while getopts ":u:p:P:f:" o; do
	case "${o}" in
		u)
	            username=${OPTARG}
	            ;;
	       	p)
	            password=${OPTARG}
	            ;;
	       	P)
	            project_id=${OPTARG}
	            ;;
	       	f)
		    file_parser=${OPTARG}
	            ;;
		*)
	            usage
	            ;;
	esac
done
shift $((OPTIND-1))

# check for content
if [ -z "${username}" ] || [ -z "${password}" ] || [ -z "${project_id}" ] || [ -z "${file_parser}" ]; then
     usage
fi

# the following command populated the npnList array variable with the filenames listed 
# in the filesToLoad.txt filename
IFS=$'\r\n' GLOBIGNORE='*' command eval  'file_parser_list=($(cat '$file_parser'))'

# Process Files
echo "Processing files ... "
# Loop values
for row in "${file_parser_list[@]}"
do
    IFS=$'\t' read -r -a array <<< "$row"
    expedition=${array[0]}
    file_name=${array[1]}
    # check for content
    if [ -z "${expedition}" ] || [ -z "${file_name}" ] ; then
    	echo "Missing content from row: " $row
    # Here we call the fims-runner script if all lines are good
    else 
    	echo $python_tools_loader -u --public expedition_code=$expedition username=$username password=$password $fims_uri $project_id $file_name
    fi
done

#echo $python_tools/loader '-u --public' expedition_code=test_npn8 username=biocode password=biocode2013 project_id=27 $fims_uri file_name=/Users/jdeck/IdeaProjects/biocode-fims-configurator/examples/plantPhenology/npn/input/NPN_raw_data_leaf_example_1row_short.xlsx
