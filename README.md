# Plant Phenology Website
The ppo-fims repository stores the codebase for the plantphenology.org website running at http://www.plantphenology.org/.  This repository is similar to other FIMS instances (e.g. geomedb, arms, biscicol) but instead of relying on user-uploaded spreadsheets, the processing and loading of data files is done outside of this instance, using, for now the code and instructions running under the https://github.com/jdeck88/pheno_paper repository.  

# Triplifying Jar
The gradlew sripts supplied with this repository can build a self-contained jar file for triplifying data, which is part of the data processing process.   This is run like:

```
./gradlew shadowJar
```

The output of this task will create a dist/ppo-fims-triples.jar file which can be executed with help, like:

```
java -jar ppo-fims-triples.jar -h
```



