The ppo-fims consists of a collection of tools and resources for building the plant phenology ontology (PPO) and annotating instance data from large-scale phenological repositories.  The ppo-fims has a running website at http://www.plantphenology.org/.  The following 

# Ontology Development 
The following repositories contain the code and data which together are used for building the core [purl.obolibrary.org/obo/ppo.owl](PPO ontology):  

  * [ontobuilder](https://github.com/stuckyb/ontobuilder): code for building ontologies

  * [plant phenology ontology](https://github.com/plantPhenoOntology/PPO): code for building the [plant phenology ontology OWL File](http://purl.obolibrary.org/obo/ppo.owl).

  * [PPO application ontology] (https://github.com/PlantPhenoOntology/ppo_ingest_app) WILL be stored at this location

# Data Collection
Following are a collection of some of the raw data sources that are referenced by the plantphenology website:  

  * [Jan, 2016 plant phenology "workshop" data] (https://github.com/plantPhenoOntology/pheno_data)

  * [plant phenology paper data sources](https://github.com/jdeck88/ppo_data)

# Instance Data Annotation
The Biocode FIMS Configurator is used to validate incoming data sources and map concepts in the incoming data to classes referenced in the PPO application ontology.

[The Biocode FIMS Configurator] (https://github.com/biocodellc/biocode-fims-configurator) fulfills the following purposes:
  * current code for building application ontologies but soon to be DEPRECATED in favor of the following repo: [PPO application ontology] (https://github.com/PlantPhenoOntology/ppo_ingest_app)
  * code for configuring biocode fims that use ontologies as references

# The PPO-FIMS codebase 
This references all of the information which goes into building the plantphenology.org website.  

[The PPO-FIMS website](https://github.com/biocodellc/ppo-fims)
  * plant phenology website
  * plantPhenology specific configuration scripts from configurator
    * stores ppo_ingest.owl file
    * stores the npn.xml and pep.xml configuration files
  * Python Scripts for loading loading data sources (data stored under other relevant respoitories, see Data components above)
