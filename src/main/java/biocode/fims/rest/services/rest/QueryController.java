package biocode.fims.rest.services.rest;

import biocode.fims.authorizers.QueryAuthorizer;
import biocode.fims.config.ConfigurationFileFetcher;
import biocode.fims.digester.Mapping;
import biocode.fims.elasticSearch.ElasticSearchIndexer;
import biocode.fims.elasticSearch.FieldColumnTransformer;
import biocode.fims.elasticSearch.query.ElasticSearchFilterField;
import biocode.fims.elasticSearch.query.ElasticSearchQuerier;
import biocode.fims.elasticSearch.query.ElasticSearchQuery;
import biocode.fims.fimsExceptions.FimsRuntimeException;
import biocode.fims.fimsExceptions.errorCodes.QueryCode;
import biocode.fims.ppo.query.PPOQueryUtils;
import biocode.fims.query.dsl.Query;
import biocode.fims.query.dsl.QueryParser;
import biocode.fims.query.writers.*;
import biocode.fims.rest.Compress;
import biocode.fims.rest.FimsService;
import biocode.fims.service.ExpeditionService;
import biocode.fims.settings.SettingsManager;
import biocode.fims.tools.CachedFile;
import biocode.fims.tools.FileCache;
import biocode.fims.utils.StringGenerator;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.elasticsearch.client.Client;
import org.elasticsearch.index.query.QueryBuilders;
import org.parboiled.Parboiled;
import org.parboiled.errors.ParserRuntimeException;
import org.parboiled.parserunners.ReportingParseRunner;
import org.parboiled.support.ParsingResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Controller;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.File;
import java.net.URI;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Query interface for Biocode-fims expedition
 */
@Controller
@Path("/projects/query")
public class QueryController extends FimsService {
    private static final Logger logger = LoggerFactory.getLogger(QueryController.class);

    private static List<Integer> projectIds = Arrays.asList(27);
    private static String[] indicies = projectIds.stream().map(String::valueOf).toArray(String[]::new);
    private List<Mapping> mappings;

    private final Client esClient;
    private final FileCache fileCache;

    @Autowired
    QueryController(SettingsManager settingsManager, Client esClient, FileCache fileCache) {
        super(settingsManager);
        this.esClient = esClient;
        this.fileCache = fileCache;
    }

    /**
     * accepts an elastic json query request. note that aggregations are not supported, and the json query object needs
     * to exclude the initial {"query": } that you would send via the elasticsearch rest api
     *
     * @param page
     * @param limit
     * @param esQueryString
     * @return
     */
    @POST
    @Path("/es")
    @Produces(MediaType.APPLICATION_JSON)
    public Response queryElasticSearch(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("limit") @DefaultValue("100") int limit,
            ObjectNode esQueryString) {

        ElasticSearchQuery query = new ElasticSearchQuery(
                QueryBuilders.wrapperQuery(esQueryString.toString()),
                indicies,
                new String[]{ElasticSearchIndexer.TYPE}
        );

        return getJsonResults(page, limit, query);
    }

    private Response getJsonResults(int page, int limit, ElasticSearchQuery query) {
        Pageable pageable = new PageRequest(page, limit);

        query.pageable(pageable);

        ElasticSearchQuerier elasticSearchQuerier = new ElasticSearchQuerier(esClient, query);

        Page<ObjectNode> results = elasticSearchQuerier.getPageableResults();

        List<JsonFieldTransform> writerColumns = PPOQueryUtils.getJsonFieldTransforms(getMappings());

        List<JsonFieldTransform> filteredWriterColumns;
        if (query.getSource().isEmpty()) {
            filteredWriterColumns = writerColumns;
        } else {
            filteredWriterColumns = writerColumns.stream()
                    .filter(t -> query.getSource().contains(t.getUri()))
                    .collect(Collectors.toList());
        }

        Page<ObjectNode> transformedResults = results.map(r -> JsonTransformer.transform(r, filteredWriterColumns));

        return Response.ok(transformedResults).build();
    }

    /**
     * Return JSON for a graph query as POST
     * <p/>
     * @return
     */
    @Compress
    @GET
    @Path("/json/")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response queryJson(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("limit") @DefaultValue("100") int limit,
            @QueryParam("q") String q,
            @QueryParam("source") String s) {
        List<String> source = s != null ? Arrays.asList(s.split(",")) : Collections.emptyList();

        // Build the query, etc..
        try {
            ElasticSearchQuery esQuery = getEsQuery(q);

            if (source.size() > 0) {
                esQuery.source(source);
            }

            return getJsonResults(page, limit, esQuery);
        } catch (FimsRuntimeException e) {
            if (e.getErrorCode() == QueryCode.NO_RESOURCES) {
                return Response.ok(
                        new PageImpl<String>(null, new PageRequest(page, limit), 0)
                ).build();
            }

            throw e;
        }
    }

    /**
     * Return CSV for a graph query as POST
     *
     * @return
     */
    @GET
    @Path("/csv/")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response queryCSV(@QueryParam("q") String q) {

        try {
            // Build the query, etc..
            ElasticSearchQuerier elasticSearchQuerier = new ElasticSearchQuerier(esClient, getEsQuery(q));

            ArrayNode results = elasticSearchQuerier.getAllResults();

            JsonWriter jsonWriter = new DelimitedTextJsonWriter(results, PPOQueryUtils.getJsonFieldTransforms(getMappings()), defaultOutputDirectory(), ",");

            return returnFileResults(jsonWriter.write(), "geome-fims-output.csv");
        } catch (FimsRuntimeException e) {
            if (e.getErrorCode() == QueryCode.NO_RESOURCES) {
                return Response.noContent().build();
            }

            throw e;
        }
    }

    /**
     * Return KML for a graph query using POST
     *
     * @return
     */
    @GET
    @Path("/kml/")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response queryKml(@QueryParam("q") String q) {

        try {
            // Build the query, etc..
            ElasticSearchQuerier elasticSearchQuerier = new ElasticSearchQuerier(esClient, getEsQuery(q));

            ArrayNode results = elasticSearchQuerier.getAllResults();

            JsonWriter jsonWriter = new KmlJsonWriter.KmlJsonWriterBuilder(results, defaultOutputDirectory(), PPOQueryUtils.getJsonFieldTransforms(getMappings()))
                    .latPath(PPOQueryUtils.getLatitudePointer())
                    .longPath(PPOQueryUtils.getLongitudePointer())
                    .namePath(PPOQueryUtils.getUniqueKeyPointer())
                    .build();

            return returnFileResults(jsonWriter.write(), "geome-fims-output.kml");
        } catch (FimsRuntimeException e) {
            if (e.getErrorCode() == QueryCode.NO_RESOURCES) {
                return Response.noContent().build();
            }

            throw e;
        }
    }

    private Response returnFileResults(File file, String name) {
        int userId = userContext.getUser() != null ? userContext.getUser().getUserId() : 0;
        String fileId = StringGenerator.generateString(20);
        CachedFile cf = new CachedFile(fileId, file.getAbsolutePath(), userId, name);
        fileCache.addFile(cf);

        URI fileURI = uriInfo.getBaseUriBuilder().path(UtilsController.class).path("file").queryParam("id", fileId).build();

        return Response.ok("{\"url\": \"" + fileURI + "\"}").build();
    }

    private ElasticSearchQuery getEsQuery(String q) {
        Query query = parseQueryString(q);
        return getEsQuery(query);
    }

    private ElasticSearchQuery getEsQuery(Query query) {
        return new ElasticSearchQuery(
                query.getQueryBuilder(),
                indicies,
                new String[]{ElasticSearchIndexer.TYPE}
        );
    }

    private Query parseQueryString(String q) {
        List<ElasticSearchFilterField> filterFields = PPOQueryUtils.getAvailableFilters(getMappings());
        filterFields.add(PPOQueryUtils.get_AllFilter());
        filterFields.add(PPOQueryUtils.getBcidFilter());

        FieldColumnTransformer transformer = new FieldColumnTransformer(filterFields);

        QueryParser parser = Parboiled.createParser(QueryParser.class, transformer);
        try {
            ParsingResult<Query> result = new ReportingParseRunner<Query>(parser.Parse()).run(q);

            if (result.hasErrors() || result.resultValue == null) {
                throw new FimsRuntimeException(QueryCode.INVALID_QUERY, 400, result.parseErrors.toString());
            }

            return result.resultValue;
        } catch (ParserRuntimeException e) {
            String parsedMsg = e.getMessage().replaceFirst(" action '(.*)'", "");
            throw new FimsRuntimeException(QueryCode.INVALID_QUERY, 400, parsedMsg.substring(0, (parsedMsg.indexOf("^"))));
        }

    }

    private List<Mapping> getMappings() {
        if (mappings != null) {
            return mappings;
        }

        mappings = new ArrayList<>();

        for (Integer projectId: projectIds) {
            File configFile = new ConfigurationFileFetcher(projectId, defaultOutputDirectory(), true).getOutputFile();

            Mapping mapping = new Mapping();
            mapping.addMappingRules(configFile);

            mappings.add(mapping);
        }

        return mappings;
    }
}

