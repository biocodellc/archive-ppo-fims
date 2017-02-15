The ppo-fims repository belongs to the Biocode FIMS suite of software, building on the biocode-fims-commons stack. The ppo-fims software and content, hosted in this repository, is deployed at http://www.plantphenology.org/.

# Ontology Development Components  
The following repositories contain the code and data which together are used for building the core [purl.obolibrary.org/obo/ppo.owl](PPO ontology):  
https://github.com/stuckyb/ontobuilder 
  * code for building ontologies

https://github.com/plantPhenoOntology/PPO
  * place to build and store the official plant phenology ontology

# Data components
Following are a collection of some of the raw data sources that are referenced by the plantphenology website:  
https://github.com/plantPhenoOntology/pheno_data 
  * stores the "workshop" data sources

https://github.com/jdeck88/ppo_data
  * stores the "pheno_paper" data sources

# Biocode-fims-configurator
The Biocode FIMS Configurator is used to build a proper FIMS configuration file and currently in building the FIMS application ontology.  
https://github.com/biocodellc/biocode-fims-configurator 
  * code for building application ontologies
  * code for configuring biocode fims that use ontologies as references

# The PPO-FIMS codebase 
This references all of the information to build the plantphenology.org website.  
https://github.com/biocodellc/ppo-fims
  * plant phenology website
  * plantPhenology specific configuration scripts from configurator
    * stores ppo_ingest.owl file
    * stores the npn.xml and pep.xml configuration files
  * Python Scripts for loading loading data sources (data stored under other relevant respoitories, see Data components above)
