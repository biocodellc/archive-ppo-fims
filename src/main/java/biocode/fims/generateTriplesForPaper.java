package biocode.fims;

import biocode.fims.application.config.PPOAppConfig;
import biocode.fims.digester.Mapping;
import biocode.fims.digester.Validation;
import biocode.fims.fimsExceptions.FimsRuntimeException;
import biocode.fims.fuseki.triplify.Triplifier;
import biocode.fims.reader.JsonTabularDataConverter;
import biocode.fims.reader.ReaderManager;
import biocode.fims.reader.plugins.TabularDataReader;
import biocode.fims.renderers.RowMessage;
import biocode.fims.run.ProcessController;
import biocode.fims.settings.FimsPrinter;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.google.common.collect.Lists;
import org.apache.commons.cli.*;
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
    String outputDirectory = "/Users/jdeck/IdeaProjects/ppo_data/pheno_paper/npn/output_n3/";
    static ArrayList<String> outputFiles = new ArrayList<String>();


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
        // CLI Interface
        // ******************
        // Some classes to help us
        /*
        CommandLineParser clp = new GnuParser();
        HelpFormatter helpf = new HelpFormatter();
        CommandLine cl;

        String configFile = null;
        String inputFile = null;
        // Define our commandline options
        Options options = new Options();
        options.addOption("h", "help", false, "print this help and exit");

        options.addOption("c", "config", false, "Configuration file");
        options.addOption("i", "input", true, "input data file");

        // Create the commands parser and parse the command line arguments.
        try {
            cl = clp.parse(options, args);
        } catch (UnrecognizedOptionException e) {
            FimsPrinter.out.println("Error: " + e.getMessage());
            return;
        } catch (ParseException e) {
            FimsPrinter.out.println("Error: " + e.getMessage());
            return;
        }

        if (cl.hasOption("c")) {
            configFile = cl.getOptionValue("r");
        } else {
            FimsPrinter.out.println("Error: must specify config. file");
            return;
        }
        if (cl.hasOption("i")) {
            inputFile = cl.getOptionValue("r");
        } else {
            FimsPrinter.out.println("Error: must specify input file");
            return;
        }

        generateTriplesForPaper pep = new generateTriplesForPaper(configFile);
        try {
            outputFiles.add(pep.triplify(inputFile));
        } catch (Exception e) {
            e.printStackTrace();
        }

        */
        // ******************
        // NPN files
        // ******************

        generateTriplesForPaper npn = new generateTriplesForPaper(
                "/Users/jdeck/IdeaProjects/ppo-fims/data/npn/npn.xml"
        );

        try {
            //outputFiles.add(npn.triplify("/Users/jdeck/IdeaProjects/ppo_data/pheno_paper/npn/output_csv/1485012823554.csv"));
            outputFiles.add(
                    npn.triplify(
                            "/Users/jdeck/IdeaProjects/ppo_data/pheno_paper/npn/output_csv/1485013283920.csv"
            ));
        } catch (Exception e) {
            e.printStackTrace();
        }


        // ******************
        // PEP files
        // ******************
       /* generateTriplesForPaper pep = new generateTriplesForPaper(
                "/Users/jdeck/IdeaProjects/ppo-fims/data/npn/npn.xml"
        );
        try {
            //outputFiles.add(pep.triplify("/Users/jdeck/IdeaProjects/ppo_data/pheno_paper/pep725/output/Betula.csv"));
            //outputFiles.add(pep.triplify("/Users/jdeck/IdeaProjects/ppo_data/pheno_paper/pep725/output/Helianthus.csv"));
        } catch (Exception e) {
            e.printStackTrace();
        }
         */
        // ******************
        // Generated Triples
        // ******************
        Iterator it = outputFiles.iterator();
        System.out.println("##########\n# Results\n###########");
        while (it.hasNext()) {
            String message = (String) it.next();
            System.out.println(message);
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
        File inputFileFile = new File (inputFile);
        String filename = inputFileFile.getName();
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
        TabularDataReader tdr = rm.openFile(inputFile, mapping.getDefaultSheetName(), outputDirectory);

        if (tdr == null) {
            System.out.println("Unable to open file " + inputFile + " with sheetname = " + mapping.getDefaultSheetName());
            return null;
        }

        // Attempt to get the sheetname
        String sheetname = "default";
        try {
            sheetname = tdr.getSheet().getSheetName();
        } catch (NullPointerException npe) {
            if (!tdr.getFormatString().equalsIgnoreCase("csv") && !tdr.getFormatString().equalsIgnoreCase("txt")) {
                System.out.println("this is an excel workbook and couldn't figure out the sheetname");
                return null;
            }
        }

        // Run the validation
        ArrayNode fimsMetadata = null;
        boolean isValid = true;
        try {
            JsonTabularDataConverter tdc = new JsonTabularDataConverter(tdr);
            fimsMetadata = tdc.convert(mapping.getDefaultSheetAttributes(), sheetname);

            // Run the validation
            isValid = validation.run(tdr, "test", "output", mapping, fimsMetadata);
        } catch (FimsRuntimeException e) {
            if (e.getErrorCode() != null) {
                processController.addMessage(sheetname, new RowMessage(e.getUsrMessage(), "Initial Spreadsheet check", RowMessage.ERROR));
                isValid = false;
            } else {
                throw e;
            }
        } finally {
            tdr.closeFile();
        }


        // add messages to process controller and print
        processController.addMessages(validation.getMessages());

        // Triplify results if we're all good

        if (isValid) {
            Triplifier t = new Triplifier(filename, outputDirectory, processController);
            t.run(validation.getSqliteFile(), Lists.newArrayList(fimsMetadata.get(0).fieldNames()));

            return "Processing " + inputFile + " ...\n" + t.getTripleOutputFile();

        } else {
            return "Processing " + inputFile + " ...\n" + processController.printMessages();
        }

    }
}
