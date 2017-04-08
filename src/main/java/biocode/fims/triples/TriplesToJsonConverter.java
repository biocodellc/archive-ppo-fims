package biocode.fims.triples;

import biocode.fims.digester.Attribute;
import biocode.fims.digester.Mapping;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import org.springframework.util.Assert;

import java.io.*;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @author rjewing
 */
public class TriplesToJsonConverter {
    private InputStream in;
    private Mapping mapping;

    public TriplesToJsonConverter(InputStream in, Mapping mapping) {
        Assert.notNull(in);
        Assert.notNull(mapping);
        this.in = in;
        this.mapping = mapping;
    }

    public ArrayNode convert() {
        Model model = ModelFactory.createDefaultModel();

        model.read(in, null, null);

        List<String> attributeURIs = mapping.getDefaultSheetAttributes()
                .stream()
                .map(Attribute::getUri)
                .collect(Collectors.toList());

        PPOFimsModel fimsModel = new PPOFimsModel(
                model,
                attributeURIs,
                mapping.getRootEntity().getConceptURI(),
                false);

        return fimsModel.toDataset();
    }
}
