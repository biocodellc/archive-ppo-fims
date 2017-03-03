# Stardog implementation
We're running stardog on the server under its default port and redirecting using Apache from incoming port 80 to the 
default port.  Installation is at: /opt/stardog/stardog-4.2.

# stop and start server
  * stardog-admin server start
  * stardog-admin server stop


# Notes on Reasoners
Stardog supports OWL EL, RL, SL, QL, and DL
For the following query:
```
select ?s ?p ?o ?objectlabel ?propertylabel {
   <http://biscicol.org/test/?plant1> ?p ?o .
   optional {?o rdfs:label ?objectlabel}
}
``` 
The following reasoners were used.
   * EL and SL do not work
   * RL is super slow -  returns superclasses but does not infer plant stages
```
+-------+----------------+--------------------------+---------------------------------------+
|   s   |       p        |            o             |              objectlabel              |
+-------+----------------+--------------------------+---------------------------------------+
|       | obo:RO_0000086 | urn:traitInstanceClass=1 | "instance of leaves present (trait1)" |
|       | rdf:type       | owl:Thing                |                                       |
|       | rdf:type       | obo:PO_0000003           |                                       |
|       | rdf:type       | obo:PO_0009011           |                                       |
|       | rdfs:label     | "plant1"                 |                                       |
|       | obo:RO_0000053 | urn:traitInstanceClass=1 | "instance of leaves present (trait1)" |
+-------+----------------+--------------------------+---------------------------------------+
```
   * QL is MUCH faster than RL - returns the same as RL above


