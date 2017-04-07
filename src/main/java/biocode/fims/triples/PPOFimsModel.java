package biocode.fims.triples;

import biocode.fims.fimsExceptions.FimsRuntimeException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.hp.hpl.jena.rdf.model.*;
import com.hp.hpl.jena.rdf.model.Resource;

import java.util.*;

/**
 * this will flatten a triples file into the startingResource.
 * NOTE: This will only traverse relations to a depth of 1. Meaning we will add all literals and types from
 * any direct relations to the startingResource, but not from related resources to any directly related resources
 */
public class PPOFimsModel {
    private static String TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
    public static String TYPE_ARRAY = "types";


    private List<String> configurationFileAttributeURIs;
    private Model model;
    private boolean getOnlySpecifiedProperties;
    private String startingResource;

    private ArrayNode dataset = null;
    private int depth = 0;

    public PPOFimsModel(Model model, List<String> attributeURIs, String startingResource, boolean getOnlySpecifiedProperties) {
        this.model = model;
        this.getOnlySpecifiedProperties = getOnlySpecifiedProperties;
        this.configurationFileAttributeURIs = attributeURIs;
        this.startingResource = startingResource;
    }

    public ArrayNode toDataset() {
        if (dataset == null) {
            populateDataset();
        }

        return dataset;
    }

    private void populateDataset() {
        dataset = new ObjectMapper().createArrayNode();

        // Get a list of statements for the root Resource
        StmtIterator i = getResourceStatements(model.expandPrefix(startingResource));

        while (i.hasNext()) {
            Statement s = i.next();

            createEntryFromResource(s.getSubject());

            // reset depth for next entry
            depth = 0;
        }

        i.close();
        model.close();
    }

    private void createEntryFromResource(Resource subject) {
        int index = dataset.size();
        ObjectNode entry = dataset.addObject();

        addLiteralsToEntry(subject, entry);
        addTypesToEntry(subject, entry);

        loopObjects(entry, getRelations(subject));

        // if no values found, remove the resource
        if (entry.size() == 0) {
            dataset.remove(index);
        } else {
            entry.put("bcid", subject.toString());
        }
    }

    private void addTypesToEntry(Resource subject, ObjectNode entry) {
        StmtIterator it = model.listStatements(subject, getProperty(TYPE), (RDFNode) null);

        while (it.hasNext()) {
            Statement s = it.next();
            addToTypeArray(entry, s.getObject().toString());
        }
    }

    private void addLiteralsToEntry(Resource resource, ObjectNode entry) {
        SimpleSelector literalSelector = new SimpleSelector(resource, null, (RDFNode) null) {
            @Override
            public boolean selects(Statement s) {
                return s.getObject().isLiteral();
            }
        };

        StmtIterator it = model.listStatements(literalSelector);

        while (it.hasNext()) {
            Statement s = it.next();
            Property predicate = s.getPredicate();

            if (predicate.getLocalName() != null && !predicate.getLocalName().equals("null")) {

                if (!getOnlySpecifiedProperties || configurationFileAttributeURIs.contains(predicate.toString())) {
                    entry.put(predicate.toString(), getObject(s));
                }
            }

        }

        it.close();
    }

    private String getObject(Statement s) {
        // object will sometimes contain the xsd:type after the value. This is delimited by ^^. We are only interested
        // in the value
        return s.getObject().toString().split("\\^\\^")[0];
    }

    private void addToTypeArray(ObjectNode entry, String val) {
        JsonNode typesNode = entry.get(TYPE_ARRAY);

        if (typesNode == null || typesNode.isNull()) {
            typesNode = entry.putArray(TYPE_ARRAY);
        } else if (!typesNode.isArray()) {
            throw new FimsRuntimeException("server error", "entry." + TYPE_ARRAY + " is not an array", 500);
        }

        ArrayNode types = (ArrayNode) typesNode;

        // don't add duplicates
        for (JsonNode t : types) {
            if (t.asText().equals(val)) {
                return;
            }
        }

        types.add(val);
    }

    private void loopObjects(ObjectNode entry, StmtIterator stmtIterator) {
        depth++;
        while (stmtIterator.hasNext()) {
            Statement statement = stmtIterator.nextStatement();
            addLiteralsToEntry(statement.getSubject(), entry);
            addTypesToEntry(statement.getSubject(), entry);
            if (depth <= 1) {
                loopObjects(entry, getRelations(statement.getSubject()));
            }
        }
    }


    /**
     * get a property named by a particular string (in URI format)
     *
     * @param propertyAsString
     * @return
     */
    private Property getProperty(String propertyAsString) {
        return model.getProperty(propertyAsString);
    }

    /**
     * Get all relations for a particular subject resource
     *
     * @param subject
     * @return
     */
    private StmtIterator getRelations(Resource subject) {
        return getResourceStatements(subject.asNode().toString());

    }

    private StmtIterator getResourceStatements(String resource) {
        RDFNode node = model.createResource(model.expandPrefix(resource));
        SimpleSelector selector = new SimpleSelector(null, null, node);

        return model.listStatements(selector);
    }
}

