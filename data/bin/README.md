= Scripts for loading / working with datasets

# loader.sh

An example call to the loader.sh script, which calls the python load script contained in 
https://github.com/biocodellc/biocode-fims-python-tools.  Download that script and adjust variables
in the shell script to run.

```
./loader.sh -u {username} -p {password} -P 27 -f filesToLoad.txt 
```

The filestoLoad.txt contains tab delimited rows of data indicating expedition codes and files to load, like:
```
test_npn7 	/Users/jdeck/IdeaProjects/ppo_data/data/npn/datasheet_1485012823554/status_intensity_observation_data.csv
test_npn8	/Users/jdeck/IdeaProjects/ppo_data/data/npn/datasheet_1485013283920/status_intensity_observation_data.csv
```

# pepProcessorTar.sh
A simple script for processing PEP archived TAR files
