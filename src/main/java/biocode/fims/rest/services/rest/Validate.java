package biocode.fims.rest.services.rest;

import biocode.fims.config.ConfigurationFileFetcher;
import biocode.fims.fileManagers.AuxilaryFileManager;
import biocode.fims.fileManagers.fimsMetadata.FimsMetadataFileManager;
import biocode.fims.fimsExceptions.*;
import biocode.fims.fimsExceptions.errorCodes.UploadCode;
import biocode.fims.rest.FimsService;
import biocode.fims.run.Process;
import biocode.fims.run.ProcessController;
import biocode.fims.service.ExpeditionService;
import biocode.fims.service.OAuthProviderService;
import biocode.fims.settings.SettingsManager;
import biocode.fims.utils.FileUtils;
import org.apache.commons.lang.StringUtils;
import org.glassfish.jersey.media.multipart.FormDataBodyPart;
import org.glassfish.jersey.media.multipart.FormDataParam;
import org.json.simple.JSONObject;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.File;
import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Path("validate")
public class Validate extends FimsService {

    private final ExpeditionService expeditionService;
    private final List<AuxilaryFileManager> fileManagers;
    private final FimsMetadataFileManager fimsMetadataFileManager;

    public Validate(ExpeditionService expeditionService,
                    FimsMetadataFileManager fimsMetadataFileManager, List<AuxilaryFileManager> fileManagers,
                    OAuthProviderService providerService, SettingsManager settingsManager) {
        super(providerService, settingsManager);
        this.expeditionService = expeditionService;
        this.fimsMetadataFileManager = fimsMetadataFileManager;
        this.fileManagers = fileManagers;
    }

    /**
     * service to validate a dataset against a project's rules
     *
     * @param projectId
     * @param expeditionCode
     * @param upload
     * @param fimsMetadata
     * @return
     */
    @POST
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON + ";charset=utf-8")
    public Response validate(@FormDataParam("projectId") Integer projectId,
                           @FormDataParam("expeditionCode") String expeditionCode,
                           @FormDataParam("upload") String upload,
                           @FormDataParam("public_status") String publicStatus,
                           @FormDataParam("dataset") FormDataBodyPart fimsMetadata) {
        Map<String, Map<String, Object>> fmProps = new HashMap<>();
        JSONObject returnValue = new JSONObject();
        boolean closeProcess = true;
        boolean removeController = true;

        // create a new processController
        ProcessController processController = new ProcessController(projectId, expeditionCode);
        processController.setOutputFolder(uploadPath());

        // place the processController in the session here so that we can track the status of the validation process
        // by calling biocode.fims.rest/validate/status
        session.setAttribute("processController", processController);


        try {
            // update the status
            processController.appendStatus("Initializing...<br>");

            // save the datasets
            if (fimsMetadata != null && fimsMetadata.getContentDisposition().getFileName() != null) {
                String fimeMetadataFilename = fimsMetadata.getContentDisposition().getFileName();
                processController.appendStatus("\nFims Metadata Dataset filename = " + fimeMetadataFilename);

                InputStream is = fimsMetadata.getEntityAs(InputStream.class);
                String tempFilename = saveFile(is, fimeMetadataFilename, "xls");

                Map<String, Object> props = new HashMap<>();
                props.put("filename", tempFilename);

                fmProps.put(FimsMetadataFileManager.NAME, props);
            }

            File configFile = new ConfigurationFileFetcher(projectId, uploadPath(), false).getOutputFile();

            // Create the process object --- this is done each time to orient the application
            Process process = new Process.ProcessBuilder(fimsMetadataFileManager, processController)
                    .addFileManagers(fileManagers)
                    .addFmProperties(fmProps)
                    .configFile(configFile)
                    .build();

            processController.setProcess(process);

            if (process.validate() && StringUtils.equalsIgnoreCase(upload, "on")) {
                if (user == null) {
                    throw new UnauthorizedRequestException("You must be logged in to upload.");
                }

                processController.setUserId(user.getUserId());

                // set public status to true in processController if user wants it on
                if (StringUtils.equalsIgnoreCase(publicStatus, "on")) {
                    processController.setPublicStatus(true);
                }

                // if there were validation warnings and user would like to upload, we need to ask the user to continue
                if (processController.getHasWarnings()) {
                    returnValue.put("continue", processController.getMessages());

                    // there were no validation warnings and the user would like to upload, so continue
                } else {
                    JSONObject msg = new JSONObject();
                    msg.put("message", "continue");
                    returnValue.put("continue", msg);
                }

                // don't remove the controller or inputFiles as we will need it later for uploading this file
                closeProcess = false;
                removeController = false;

            } else {
                returnValue.put("done", processController.getMessages());
            }


            return Response.ok(returnValue).build();

        } finally {
            if (closeProcess && processController.getProcess() != null) {
                processController.getProcess().close();
            }
            if (removeController) {
                session.removeAttribute("processController");
            }

        }
    }

    /**
     * Service to upload a dataset to an expedition. The validate service must be called before this service.
     *
     * @param createExpedition
     * @return
     */
    @GET
    @Path("/continue")
    @Produces(MediaType.APPLICATION_JSON + ";charset=utf-8")
    public Response upload(@QueryParam("createExpedition") @DefaultValue("false") Boolean createExpedition) {
        ProcessController processController = (ProcessController) session.getAttribute("processController");
        JSONObject returnValue = new JSONObject();
        boolean removeProcessController = true;

        // if no processController is found, we can't do anything
        if (processController == null) {
            //TODO throw exception with ErrorCode
            returnValue.put("error", "No process was detected");
            return Response.ok(returnValue).build();
        }

        try {

            // check if user is logged in
            if (processController.getUserId() == 0) {
                returnValue.put("error", "You must be logged in to upload");
                return Response.ok(returnValue).build();
            }


            Process p = processController.getProcess();

            if (createExpedition) {
                processController.setExpeditionTitle(processController.getExpeditionCode() + " spreadsheet");
            }

            try {
                p.upload(createExpedition, Boolean.parseBoolean(settingsManager.retrieveValue("ignoreUser")), expeditionService);
            } catch (FimsRuntimeException e) {
                if (e.getErrorCode() == UploadCode.EXPEDITION_CREATE) {
                    JSONObject message = new JSONObject();
                    message.put("message",
                            "The expedition code \"" + processController.getExpeditionCode() +
                                    "\" does not exist.  " +
                                    "Do you wish to create it now?<br><br>" +
                                    "If you choose to continue, your data will be associated with this new expedition code."
                    );
                    returnValue.put("continue", message);
                    removeProcessController = false;
                    return Response.ok(returnValue).build();
                } else {
                    throw e;
                }
            }

            returnValue.put("done", processController.getSuccessMessage());
            return Response.ok(returnValue).build();
        } finally {
            // remove the processController from the session
            if (removeProcessController) {
                session.removeAttribute("processController");
                processController.getProcess().close();
            }
        }
    }

    /**
     * Service used for getting the current status of the dataset validation/upload.
     *
     * @return
     */
    @GET
    @Path("/status")
    @Produces(MediaType.APPLICATION_JSON + ";charset=utf-8")
    public String status() {
        ProcessController processController = (ProcessController) session.getAttribute("processController");
        if (processController == null) {
            return "{\"error\": \"Waiting for validation to process...\"}";
        }

        return "{\"status\": \"" + processController.getStatusSB().toString() + "\"}";
    }

    private String saveFile(InputStream is, String filename, String defaultExt) {
        String ext = FileUtils.getExtension(filename, defaultExt);
        String tempFilename = FileUtils.saveTempFile(is, ext);
        if (tempFilename == null) {
            throw new FimsRuntimeException("Server error saving file: " + filename, 500);
        }

        return tempFilename;
    }
}


