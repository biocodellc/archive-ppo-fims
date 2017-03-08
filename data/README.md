#plantPhenology project data

Contained in this directory are scripts and tools for importing plant phenology data sources.

* Step 1:

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
```		
* Step 2: 

The second step involves building Bicode FIMS configuration file for each project. 

You will need to read the documentation for creating Configurator configuration files at https://github.com/biocodellc/biocode-fims-configurator  and create the appropriate directories locally.

E.g. for npn first time only create the following directories and populate with the correct configuration files.
```
  %mkdir npn
  %mkdir npn/config
```

Now you you will need to run the configurator, pointing the Makefile to the appropriate directory where the biocode-fims-configurator lives:
```
  %cd build
  %make -f ../Makefile configurator project_name="{project_name}"
```

Once the configurator does its work and we have succesfully built a configuration you should push 
the completed config file to github (or wherever it should be accessed on the web)
 
* Step 3: 

Loading FIMS data.  

See README.md in the bin directory (https://github.com/biocodellc/ppo-fims/tree/master/data/bin)

