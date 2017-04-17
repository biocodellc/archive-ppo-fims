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
import com.hp.hpl.jena.util.FileUtils;
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
    String outputDirectory = null;
    static String defaultLocalURIPrefix = "http://www.plantphenology.org/id/";
    static ArrayList<String> outputFiles = new ArrayList<String>();
    static String outputFormat = "TURTLE";


    /**
     * Constructure sets common configuration file and output directory.
     * Need new instance of class for different configuration files.
     *
     * @param configFile
     */
    public generateTriplesForPaper(String configFile, String outputDirectory, String defaultLocalURIPrefix) {
        this.configFile = configFile;
        this.outputDirectory = outputDirectory;
        if (defaultLocalURIPrefix != null)
            this.defaultLocalURIPrefix = defaultLocalURIPrefix;
        outputFiles = new ArrayList<String>();

    }


    public static void main(String[] args) throws Exception {
        // ******************
        // CLI Interface
        // ******************
        // Some classes to help us

        CommandLineParser clp = new GnuParser();
        HelpFormatter helpf = new HelpFormatter();
        CommandLine cl;

        String configFile = null;
        String inputFile = null;
        String outputDirectory = null;
        String defaultPrefix = null;
        Boolean overwriteOutputFile = true;
        ArrayList<String> outputFormats = new ArrayList<String>();
        outputFormats.add("N3");
        outputFormats.add("N-TRIPLE");
        outputFormats.add("RDF/XML");
        outputFormats.add("TURTLE");

        // Define our commandline options
        Options options = new Options();
        options.addOption("h", "help", false, "print this help and exit");

        options.addOption("c", "config", true, "Configuration file (mandatory)");
        options.addOption("i", "input", true, "input data file (mandatory)");
        options.addOption("p", "prefix", true, "default prefix (default value = " + defaultLocalURIPrefix + ")");
        options.addOption("o", "output", true, "output directory (mandatory)");
        options.addOption("F", "format",true, "output format: N3, N-TRIPLE, TURTLE, RDF/XML --TURTLE is default.");

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
        HelpFormatter formatter = new HelpFormatter();

        // generate help file and then exitZZ
        if (cl.hasOption("h")) {
            formatter.printHelp( "java -jar ppo-fims-triples.jar", options );
            return;
        }
        // configuration file
        if (cl.hasOption("c")) {
            configFile = cl.getOptionValue("c");
        } else {
            FimsPrinter.out.println("Error: must specify config. file");
            formatter.printHelp("java -jar ppo-fims-triples.jar", options);
            return;
        }
         // output Format
        if (cl.hasOption("F")) {
            outputFormat = cl.getOptionValue("F");
        }
        if (!outputFormats.contains(outputFormat)) {
            FimsPrinter.out.println("Error: invalid output Format");
            formatter.printHelp("java -jar ppo-fims-triples.jar", options);
            return;
        }

        // input file (comma separated or spreadsheet input data)
        if (cl.hasOption("i")) {
            inputFile = cl.getOptionValue("i");
        } else {
            FimsPrinter.out.println("Error: must specify input file");
            formatter.printHelp( "java -jar ppo-fims-triples.jar", options );
            return;
        }
        // output directory
        if (cl.hasOption("o")) {
            outputDirectory = cl.getOptionValue("o");
        } else {
            FimsPrinter.out.println("Error: must specify output directory");
            formatter.printHelp( "java -jar ppo-fims-triples.jar", options );
            return;
        }
        // prefix
        if (cl.hasOption("p")) {
            defaultLocalURIPrefix = cl.getOptionValue("p");
        }

        generateTriplesForPaper pep = new generateTriplesForPaper(configFile, outputDirectory, defaultLocalURIPrefix);
        try {
            outputFiles.add(pep.triplify(inputFile, overwriteOutputFile));
        } catch (Exception e) {
            e.printStackTrace();
        }

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
    private String triplify(String inputFile, boolean overwriteOutputFile) throws Exception {
        File inputFileFile = new File(inputFile);
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
        String sheetname = "Samples";
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
            isValid = validation.run(tdr, "test", "output", mapping, fimsMetadata, sheetname);

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
            Triplifier t = new Triplifier(
                    filename,
                    outputDirectory,
                    processController,
                    overwriteOutputFile,
                    defaultLocalURIPrefix,
                    outputFormat);
            t.run(validation.getSqliteFile(), Lists.newArrayList(fimsMetadata.get(0).fieldNames()));

            return "Processing " + inputFile + " ...\n" + t.getTripleOutputFile();

        } else {
            return "Processing " + inputFile + " ...\n" + processController.printMessages();
        }

    }
}
