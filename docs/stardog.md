# Stardog implementation
We're running stardog on the server under its default port and redirecting using Apache from incoming port 80 to the 
default port.  Installation is at: /opt/stardog/stardog-4.2.

# stop and start server
  * stardog-admin server start
  * stardog-admin server stop


# Notes on Reasoners

First, i tested the following query in Protege under the DL Query tab (loading the two files mentioned below) and turning on the Fact++ reasoner (supporting DL reasoning).
```
'whole plant' that 'participates in' some 'vascular leaf phenological stage'
```
which gave me the expected result that plant1 and plant2 particpate in the 'vascular leaf phenological stage'

My next task is to replicate the above results using stardog.

Stardog supports OWL EL, RL, SL, QL, and DL.  The following are my results in experiment with each of these.

To test stardog, i first downloaded the following two files (one is the ontology, with all imports made "local" and converted to n3 format):
  * https://raw.githubusercontent.com/biocodellc/ppo-fims/master/data/ontology/ppo_ingest.n3
  * https://raw.githubusercontent.com/biocodellc/ppo-fims/master/data/ontology/data_pheno_paper_test.n3

Then, i loaded them into their own namespace, using a different reasoner  each time i load the data.
```
stardog-admin db create -n pheno_paper_test -o reasoning.type=QL -- ppo_ingest.n3
stardog data add pheno_paper_test data_pheno_paper_test.n3
```

Next step was to try a query on one of my test instance plants:
```
refix dwc:     <http://rs.tdwg.org/dwc/terms/>
prefix rdf:     <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
prefix owl:     <http://www.w3.org/2002/07/owl#>
prefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#>
prefix ark:     <http://biscicol.org/id/ark:>
prefix obo:     <http://purl.obolibrary.org/obo/>

select ?p ?o ?objectlabel {
   <http://biscicol.org/test/?plant1> ?p ?o .
   optional {?o rdfs:label ?objectlabel}
}
``` 
Results for this query with reasoning off:
```
ppo:~/unzipped_data$ stardog query pheno_paper_test  stardog_query.sparql  
+-------------------------------------------+-------------------------------------------+---------------------------------------+
|                     p                     |                     o                     |              objectlabel              |
+-------------------------------------------+-------------------------------------------+---------------------------------------+
| rdf:type                                  | http://purl.obolibrary.org/obo/PO_0000003 | "whole plant"                         |
| http://purl.obolibrary.org/obo/RO_0000086 | urn:traitInstanceClass=1                  | "instance of leaves present (trait1)" |
| rdfs:label                                | "plant1"                                  |                                       |
+-------------------------------------------+-------------------------------------------+---------------------------------------+

Query returned 3 results in 00:00:00.206
```

Results for this query by reasoner:
   * EL and SL do not work
   * DL times out
   * RL is super slow (returns the same results as QL)
   * QL is fast but does not return what we expect.
   -  returns superclasses but does not infer plant stages as happened when we were working with Fact++ in protege.
```
ppo:~/unzipped_data$ stardog query pheno_paper_test  -r stardog_query.sparql  
+-------------------------------------------+-------------------------------------------+---------------------------------------+
|                     p                     |                     o                     |              objectlabel              |
+-------------------------------------------+-------------------------------------------+---------------------------------------+
| rdf:type                                  | owl:Thing                                 |                                       |
| rdf:type                                  | http://purl.obolibrary.org/obo/PO_0000003 | "whole plant"                         |
| rdf:type                                  | http://purl.obolibrary.org/obo/PO_0009011 | "plant structure"                     |
| http://purl.obolibrary.org/obo/RO_0000086 | urn:traitInstanceClass=1                  | "instance of leaves present (trait1)" |
| http://purl.obolibrary.org/obo/RO_0000053 | urn:traitInstanceClass=1                  | "instance of leaves present (trait1)" |
| rdfs:label                                | "plant1"                                  |                                       |
+-------------------------------------------+-------------------------------------------+---------------------------------------+

Query returned 6 results in 00:00:01.028
```

So, a few questions following all of this:
  * Why does DL time out... This, i'm not too surprised i guess.. full DL support not really meant for triples, but there are only 14 distinct triples i'm testing with.
  * Next question, is why aren't any of the other reasoner options working... When i tested with QL, here is what the logs say:
  https://github.com/biocodellc/ppo-fims/blob/master/data/ontology/stardog.log  ... The errors in the log are perhaps clues as to what may be going on...
  

