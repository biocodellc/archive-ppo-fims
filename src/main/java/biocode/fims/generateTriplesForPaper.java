package biocode.fims;

import biocode.fims.application.config.PPOAppConfig;
import biocode.fims.digester.Mapping;
import biocode.fims.digester.Validation;
import biocode.fims.fimsExceptions.FimsRuntimeException;
import biocode.fims.fuseki.triplify.Triplifier;
import biocode.fims.reader.JsonTabularDataConverter;
import biocode.fims.reader.ReaderManager;
import biocode.fims.reader.plugins.TabularDataReader;
import biocode.fims.run.ProcessController;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.google.common.collect.Lists;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

import java.io.File;
import java.util.ArrayList;
import java.util.Iterator;

/**
 * Convenience class for generating triples to be used for PPO paper, working on in
 * January, 2017 with guralnick, stucky, walls, et al.
 * <p>
 * Configuration file is generated using https://github.com/biocodellc/biocode-fims-configurator
 * Data is stored at https://github.com/jdeck88/ppo_data
 */
public class generateTriplesForPaper {
    String configFile = null;
    String outputDirectory = "output/";
    static ArrayList<String> outputFiles = new ArrayList<String>();
    JSONArray fimsMetadata;


    /**
     * Constructure sets common configuration file and output directory.
     * Need new instance of class for different configuration files.
     *
     * @param configFile
     */
    public generateTriplesForPaper(String configFile) {
        this.configFile = configFile;
        outputFiles = new ArrayList<String>();

    }


    public static void main(String[] args) throws Exception {
        ApplicationContext applicationContext = new AnnotationConfigApplicationContext(PPOAppConfig.class);

        // ******************
        // NPN files
        // ******************
        generateTriplesForPaper gTFP = new generateTriplesForPaper(
                "/Users/jdeck/IdeaProjects/biocode-fims-configurator/projects/plantPhenology/npn/npn.xml"
        );
        // This one works
        //outputFiles.add(gTFP.triplify("/Users/jdeck/IdeaProjects/biocode-fims-configurator/projects/plantPhenology/npn/input/NPN_raw_data_leaf_example_1row.xlsx"));
        // These throwing an exception for now.
       //outputFiles.add(gTFP.triplify("/Users/jdeck/IdeaProjects/ppo_data/data/npn/datasheet_1485012823554/status_intensity_observation_data.csv"));
        //outputFiles.add(gTFP.triplify("/Users/jdeck/IdeaProjects/ppo_data/data/npn/datasheet_1485013283920/status_intensity_observation_data.csv"));
        try {
            outputFiles.add(gTFP.triplify("/Users/jdeck/Downloads/test.csv"));
        } catch (Exception e) {
            e.printStackTrace();
        }


        // ******************
        // PEP files
        // ******************

        // ******************
        // Generated Triples
        // ******************
        Iterator it = outputFiles.iterator();
        System.out.println("##########\n# Output Files\n###########");
        while (it.hasNext()) {
            String outputFile = (String) it.next();
            if (outputFile != null)
                System.out.println("\t" + outputFile);
        }
    }

    /**
     * Run triplification
     *
     * @param inputFile
     *
     * @return
     */
    private String triplify(String inputFile) throws Exception {
        File config = new File(configFile);

        ProcessController processController = new ProcessController(0, null);

        Mapping mapping = new Mapping();
        mapping.addMappingRules(config);

        Validation validation = new Validation();
        validation.addValidationRules(config, mapping);

        processController.setMapping(mapping);
        processController.setValidation(validation);

        ReaderManager rm = new ReaderManager();
        rm.loadReaders();

        // Attempt to load file
        TabularDataReader tdr = rm.openFile(inputFile, mapping.getDefaultSheetName(),outputDirectory);

        if (tdr == null) {
            System.out.println("Unable to open file " + inputFile + " with sheetname = " + mapping.getDefaultSheetName());
            return null;
        }

        String sheetname = "default";
        try {
            sheetname = tdr.getSheet().getSheetName();
        } catch (NullPointerException npe) {
            if (!tdr.getFormatString().equalsIgnoreCase("csv") && !tdr.getFormatString().equalsIgnoreCase("txt")) {
                System.out.println("this is an excel workbook and couldn't figure out the sheetname");
                return null;
            }
        }


        JsonTabularDataConverter jtdr = new JsonTabularDataConverter(tdr);
        //fimsMetadata = jtdr.convert(
        ArrayNode fimsMetadata = new JsonTabularDataConverter(tdr).convert(
                mapping.getDefaultSheetAttributes(),
                sheetname
        );

        boolean isValid = validation.run(tdr, "test", outputDirectory, mapping, fimsMetadata);

        // add messages to process controller and print
        processController.addMessages(validation.getMessages());

        if (isValid) {
            Triplifier t = new Triplifier("ppo_paper", outputDirectory, processController);
            t.run(validation.getSqliteFile(), Lists.newArrayList(fimsMetadata.get(0).fieldNames()));

            return t.getTripleOutputFile();

        } else {
            throw new Exception(processController.getMessages().toString());
        }

    }
}
