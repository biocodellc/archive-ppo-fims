package biocode.fims;

import biocode.fims.digester.Mapping;
import biocode.fims.digester.Validation;
import biocode.fims.fuseki.triplify.Triplifier;
import biocode.fims.reader.JsonTabularDataConverter;
import biocode.fims.reader.ReaderManager;
import biocode.fims.reader.plugins.TabularDataReader;
import biocode.fims.run.ProcessController;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

import java.io.File;
import java.util.ArrayList;
import java.util.Iterator;

/**
 * Convenience class for generating triples to be used for PPO paper, working on in
 * January, 2017 with guralnick, stucky, walls, et al.
 *
 * Configuration file is generated using https://github.com/biocodellc/biocode-fims-configurator
 * Data is stored at https://github.com/jdeck88/ppo_data
 */
public class generateTriplesForPaper {
    String configFile = null;
    String outputDirectory = "output/";
    static ArrayList<String> outputFiles = new ArrayList<String>();


    /**
     * Constructure sets common configuration file and output directory.
     * Need new instance of class for different configuration files.
     * @param configFile
     */
    public generateTriplesForPaper(String configFile) {
        this.configFile = configFile;
        outputFiles = new ArrayList<String>();

    }


    public static void main(String[] args) throws Exception {
        // ******************
        // NPN files
        // ******************
        generateTriplesForPaper gTFP = new generateTriplesForPaper(
                "/Users/jdeck/IdeaProjects/biocode-fims-configurator/projects/plantPhenology/npn/npn.xml"
        );
        //outputFiles.add(gTFP.triplify("/Users/jdeck/IdeaProjects/biocode-fims-configurator/projects/plantPhenology/npn/input/NPN_raw_data_leaf_example_1row.xlsx"));
        outputFiles.add(gTFP.triplify("/Users/jdeck/IdeaProjects/ppo_data/data/npn/datasheet_1485012823554/status_intensity_observation_data.csv"));
        outputFiles.add(gTFP.triplify("/Users/jdeck/IdeaProjects/ppo_data/data/npn/datasheet_1485013283920/status_intensity_observation_data.csv"));

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
            System.out.println("\t" + outputFile);
        }
    }

    /**
     * Run triplification
     * @param inputFile
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
        TabularDataReader tdr = rm.openFile(inputFile, mapping.getDefaultSheetName(), outputDirectory);

        JSONArray fimsMetadata = new JsonTabularDataConverter(tdr).convert(
                mapping.getDefaultSheetAttributes(),
                mapping.getDefaultSheetName()
        );

        boolean isValid = validation.run(tdr, "test", outputDirectory, mapping, fimsMetadata);

        // add messages to process controller and print
        processController.addMessages(validation.getMessages());

        if (isValid) {
            Triplifier t = new Triplifier("ppo_paper", outputDirectory, processController);
            JSONObject resource = (JSONObject) fimsMetadata.get(0);
            t.run(validation.getSqliteFile(), new ArrayList<String>(resource.keySet()));

            return t.getTripleOutputFile();

        } else {
            throw new Exception(processController.getMessages().toString());
        }

    }
}
