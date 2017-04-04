# Instructions for setting up and running blazegraph on our server
February 17, 2017
JBD
For some reason i can't get blazegraph and jetty to run reliably as a service

As an FYI, The following works to get it running temporarily under Jetty
```
cd /opt/jetty_web/mybase/
java -jar /opt/jetty-distribution-9.4.1.v20170120/start.jar
```
# running blazegraph as a service
Start blazegraph by running it as a service along with apache. 

```
/etc/init.d/blazegraph start
/etc/init.d/apache2 start
```

Apache is forwarding port 80 redirects to port 9999, which is the port where the server is running

# Syncing data
Data is generated using jdeck88/pheno_paper repository.  However, the data itself is not in the repository but should be stored in an ignored "data" directory off of the repository root.  

# The namespaces
for the paper, i'm using "pheno_paper_{method}" namespace.  Where {method} is the way in which data was generated (e.g. direct, short, mini)


# Unzipping Files
Using the directory unzipped_data

# loading data from the command line...
record of loaded data stored in the unzipped_data directory, but proceeds, something like:
```
curl -X POST -H 'Content-Type:text/rdf+n3' --data-binary '@npn_1485013283920.n3' http://localhost/blazegraph/namespace/pheno_paper/sparql
```
