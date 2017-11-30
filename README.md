ppo-fims is the front-end/API endpoint for plant phenology ontology work.  The source code here is deployed at  http://www.plantphenology.org/.   The code here and site is still proof-of-concept.  

Processing for data delivered to this site is stored at:

https://github.com/biocodellc/ppo-data-pipeline


# sample queries

FIMS system has some information at http://fims.readthedocs.io/en/latest/fims/query.html?highlight=fims%20queries

Query  genus = Betula and retrieve response as JSON (note JSON responses are faster than CSV responses)
```
https://www.plantphenology.org/rest/v1/projects/query/json/?limit=10000&page=0&source=latitude%2Clongitude%2CstartDayOfYear%2Cyear%2Cgenus%2CspecificEpithet%2Csource&q=genus:Betula
```

Query  genus = Betula  and year = 2012 and download as CSV:
```
https://www.plantphenology.org/rest/v1/projects/query/csv/?source=latitude,longitude,startDayOfYear,year,genus,specificEpithet,source&q=+year:2012 +genus:Betula
```

# deploying ppo-fims

Following are instructions for deploying FIMS using gradle build task from root directory.
```
./gradlew deployFims   
```
answer 'y' to question about force using jar dependencies

Then, on server, touch ppo-fims.xml, OR restart jetty, e.g.:
```
sudo touch /opt/web/mybase/webapps/ppo-fims.xml
```

# Modifying query form components
Currently these are hardcoded so need to update these as needed and when ontology changes:

/Users/jdeck/IdeaProjects/ppo-fims/src/main/web/app/components/query/queryForm.controller.js 

# Plant Phenology Website
The ppo-fims repository stores the codebase for the plantphenology.org website running at http://www.plantphenology.org/.  This repository is similar to other FIMS instances (e.g. geomedb, arms, biscicol) but instead of relying on user-uploaded spreadsheets, the processing and loading of data files is done outside of this instance, using, for now the code and instructions running under the https://github.com/jdeck88/pheno_paper repository.  
