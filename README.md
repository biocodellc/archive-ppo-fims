The ppo-fims repository belongs to the Biocode FIMS suite of software, building on the biocode-fims-commons stack. The ppo-fims software and content, hosted in this repository, is deployed at http://www.plantphenology.org/.

# Ontology Development Components  
https://github.com/stuckyb/ontobuilder 
  * code for building ontologies

https://github.com/plantPhenoOntology/PPO
  * place to build and store the official plant phenology ontology

# Data components -- raw data sources that are referenced by the plantphenology website
https://github.com/plantPhenoOntology/pheno_data 
  * stores the "workshop" data sources

https://github.com/jdeck88/ppo_data
  * stores the "pheno_paper" data sources

# FIMS configuration tool (this is used to build a proper FIMS configuration file AND in building an application ontology)
https://github.com/biocodellc/biocode-fims-configurator 
  * code for building application ontologies
  * code for configuring biocode fims that use ontologies as references

# The PPO-FIMS codebase (this repository)
https://github.com/biocodellc/ppo-fims
  * plant phenology website
  * plantPhenology specific configuration scripts from configurator
    * stores ppo_ingest.owl file
    * stores the npn.xml and pep.xml configuration files
  * Python Scripts for loading loading data sources (data stored under other relevant respoitories, see Data components above)
