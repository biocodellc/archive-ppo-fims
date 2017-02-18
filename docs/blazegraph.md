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
I've since resorted to running blazegraph as an executable jar... this puts the blazegraph.jnl DATA file in the directory with a single jar.
pretty simple this way.
i've run blazegraph using the instructions in blazegraph_executable_jar and kept it running using "nohup".
Not sure how robust this is, but ok for now.

Also, apache is forwarding port 80 redirects to port 9999, which is the port where the server is running

# Syncing data
The directory is under code/ppo_data

# The namespace
for the paper, i'm using "pheno_paper" namespace.
Other namespaces to follow

# Unzipping Files
Using the directory unzipped_data

# loading data from the command line...
record of loaded data stored in the unzipped_data directory, but proceeds, something like:
```
curl -X POST -H 'Content-Type:text/rdf+n3' --data-binary '@npn_1485013283920.n3' http://localhost/blazegraph/namespace/pheno_paper/sparql
```
