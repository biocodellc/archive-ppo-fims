#plantPhenology project data

Contained in this directory are scripts and tools for importing plant phenology data sources.

Step 1:

The first step is creating the application ontology file which is built especially 
for annotating incoming data sources with relevant PPO terms.   Occassionally other terms for other 
ontologies will be added to the PPO core set of terms which are useful for annotating incoming instance data.
This step should be performed infrequently, and will affect all incoming data sources.  The process for building the 
ingest file  draws from the [ontobuilder] (https://github.com/stuckyb/ontobuilder) application.

```
  %mkdir build
  %cd build # and remove files if doing a fresh build
  %make -f ../Makefile imports # build the imports
  %make -f ../Makefile  #build the ontology and writes to ontology/ppo_ingest.owl)
		
Step 2: 

The second step involves building Bicode FIMS configuration file for each project. E.g. for npn

first time only:
```
  %mkdir npn
  %mkdir npn/config
  # see documentation about creating appropriate configuration files
```

build syntax for configurator
```
  %cd build
  %make -f ../Makefile configurator project_name="{project_name}"
```
 
Step 3: 

Loading FIMS data.  See README.md in the bin directory
```
  %cd bin
  %loader.sh -h
```
