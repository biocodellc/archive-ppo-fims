package biocode.fims.ppo.query;

import biocode.fims.digester.Attribute;
import biocode.fims.digester.DataType;
import biocode.fims.digester.Mapping;
import biocode.fims.elasticSearch.query.ElasticSearchFilterField;
import biocode.fims.query.writers.JsonFieldTransform;
import com.fasterxml.jackson.core.JsonPointer;
import org.apache.commons.lang.StringUtils;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Helper class for obtaining PPO specific Query information
 *
 * @author RJ Ewing
 */
public class PPOQueryUtils {


    /**
     * get the list of filterable fields to query against
     *
     * @return
     */
    public static List<ElasticSearchFilterField> getAvailableFilters(Mapping mapping) {
        List<ElasticSearchFilterField> filters = new ArrayList<>();

        Set<Attribute> attributes = new HashSet<>();
        attributes.addAll(mapping.getDefaultSheetAttributes());

        for (Attribute attribute : attributes) {
            String group = !StringUtils.isBlank(attribute.getGroup()) ? attribute.getGroup() : "Default Columns";
            filters.add(new ElasticSearchFilterField(attribute.getUri(), attribute.getColumn(), attribute.getDatatype(), group));
        }

        return filters;
    }

    /**
     * ElasticSearchFilterField that will search all fields.
     *
     * @return
     */
    public static ElasticSearchFilterField get_AllFilter() {
        return new ElasticSearchFilterField("_all", null, DataType.STRING, "hidden");
    }

    public static ElasticSearchFilterField getBcidFilter() {
        return new ElasticSearchFilterField("bcid", "bcid", DataType.STRING, "hidden");
    }

    public static ElasticSearchFilterField getTypesFilter() {
        return new ElasticSearchFilterField("types", "types", DataType.STRING, "hidden");
    }

    /**
     * get a list of attributes as JsonFieldTransform objects to be used in transforming
     * the json resource fields into human readable fields.
     *
     * @return
     */
    public static List<JsonFieldTransform> getJsonFieldTransforms(Mapping mapping) {
        List<JsonFieldTransform> fieldTransforms = new ArrayList<>();

        Set<Attribute> attributes = new HashSet<>();
        attributes.addAll(mapping.getDefaultSheetAttributes());

        for (Attribute a : attributes) {
            fieldTransforms.add(
                    new JsonFieldTransform(
                            a.getColumn(),
                            a.getUri(),
                            a.getDatatype(),
                            false
                    )
            );
        }

        fieldTransforms.add(
                new JsonFieldTransform(
                        "bcid",
                        "bcid",
                        DataType.STRING,
                        false
                )
        );

        return fieldTransforms;
    }

    public static JsonPointer getLongitudePointer() {
        return JsonPointer.compile("/http://rs.tdwg.org/dwc/terms/decimalLongitude");
    }

    public static JsonPointer getLatitudePointer() {
        return JsonPointer.compile("/http://rs.tdwg.org/dwc/terms/decimalLatitude");
    }

    public static JsonPointer getUniqueKeyPointer() {
        return JsonPointer.compile("/bcid");
    }
}
