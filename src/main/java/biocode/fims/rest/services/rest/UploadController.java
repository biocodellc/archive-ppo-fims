package biocode.fims.rest.services.rest;

import biocode.fims.config.ConfigurationFileFetcher;
import biocode.fims.digester.Attribute;
import biocode.fims.digester.Mapping;
import biocode.fims.elasticSearch.ElasticSearchIndexer;
import biocode.fims.entities.Expedition;
import biocode.fims.entities.Project;
import biocode.fims.fimsExceptions.*;
import biocode.fims.fimsExceptions.BadRequestException;
import biocode.fims.triples.PPOFimsModel;
import biocode.fims.triples.TriplesToJsonConverter;
import biocode.fims.rest.ConformationResponse;
import biocode.fims.rest.FimsService;
import biocode.fims.rest.filters.Admin;
import biocode.fims.service.ExpeditionService;
import biocode.fims.service.ProjectService;
import biocode.fims.settings.SettingsManager;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.elasticsearch.client.Client;
import org.glassfish.jersey.media.multipart.FormDataBodyPart;
import org.glassfish.jersey.media.multipart.FormDataParam;
import org.springframework.stereotype.Controller;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.io.File;
import java.io.InputStream;
import java.util.Iterator;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
@Path("upload")
public class UploadController extends FimsService {

    private final ExpeditionService expeditionService;
    private final ProjectService projectService;
    private final Client esClient;

    public UploadController(ExpeditionService expeditionService, ProjectService projectService,
                            Client esClient, SettingsManager settingsManager) {
        super(settingsManager);
        this.expeditionService = expeditionService;
        this.esClient = esClient;
        this.projectService = projectService;
    }

    /**
     * Service to upload a dataset to an expedition. This does not do any data validation, and expects a triples file
     *
     * @param projectId        required
     * @param expeditionCode   required
     * @param createExpedition create the expedition if it doesn't exist. defaults to false
     * @param isPublic         if creating an expedition, this will determine if the expedition is public. defaults to false
     * @param triplesFile      the triples file to upload
     * @return ConformationResponse
     */
    @Admin
    @POST
    @Produces(MediaType.APPLICATION_JSON + ";charset=utf-8")
    public ConformationResponse upload(@FormDataParam("projectId") Integer projectId,
                                       @FormDataParam("expeditionCode") String expeditionCode,
                                       @FormDataParam("create") @DefaultValue("false") boolean createExpedition,
                                       @FormDataParam("public") @DefaultValue("false") boolean isPublic,
                                       @FormDataParam("triplesFile") FormDataBodyPart triplesFile) {
        if (projectId == null || expeditionCode == null || triplesFile == null) {
            throw new BadRequestException("projectId, expeditionCode, and triplesFile are required");
        }

        if (!projectService.isProjectAdmin(userContext.getUser(), projectId)) {
            throw new ForbiddenRequestException("You must be this project's admin in order to upload data");
        }

        Project project = projectService.getProject(projectId, settingsManager.retrieveValue("appRoot"));

        if (project == null) {
            throw new BadRequestException("Invalid projectId.");
        }

        File configFile = new ConfigurationFileFetcher(projectId, defaultOutputDirectory(), true).getOutputFile();

        Mapping mapping = new Mapping();
        mapping.addMappingRules(configFile);

        // check that the expedition exists, otherwise create it
        Expedition expedition;
        if (createExpedition) {
            expedition = new Expedition.ExpeditionBuilder(expeditionCode)
                    .expeditionTitle(expeditionCode + " dataset")
                    .isPublic(isPublic)
                    .build();

            expeditionService.create(expedition, userContext.getUser().getUserId(), projectId, null, mapping);

        } else {
            expedition = expeditionService.getExpedition(expeditionCode, projectId);
        }

        if (expedition == null) {
            throw new biocode.fims.fimsExceptions.BadRequestException("Could not find the specified expedition \"" +
                    expeditionCode + "\". If you would like to create the expedition, retry the request with the form param \"create=true\"");
        }


        // convert inputFile to dataset
        TriplesToJsonConverter converter = new TriplesToJsonConverter(triplesFile.getEntityAs(InputStream.class), mapping);
        ArrayNode dataset = converter.convert();

        dataset.forEach(e -> ((ObjectNode) e).put("expedition.expeditionCode", expeditionCode));

        ElasticSearchIndexer indexer = new ElasticSearchIndexer(esClient);
        indexer.indexDataset(
                projectId,
                expeditionCode,
                dataset);

        return new ConformationResponse(true);
    }
}


