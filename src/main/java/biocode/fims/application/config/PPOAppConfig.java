package biocode.fims.application.config;

import biocode.fims.elasticSearch.ESFimsMetadataPersistenceManager;
import biocode.fims.fileManagers.fimsMetadata.FimsMetadataPersistenceManager;
import biocode.fims.fileManagers.fimsMetadata.FimsMetadataFileManager;
import biocode.fims.fuseki.fileManagers.fimsMetadata.FusekiFimsMetadataPersistenceManager;
import biocode.fims.service.ProjectService;
import org.elasticsearch.client.Client;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.*;

/**
 * Configuration class for PPO-Fims applications. Including cli and webapps
 */
@Configuration
@Import({FimsAppConfig.class, ElasticSearchAppConfig.class})
// declaring this here allows us to override any properties that are also included in biocode-fims.props
@PropertySource(value = "classpath:biocode-fims.props", ignoreResourceNotFound = true)
@PropertySource("classpath:ppo-fims.props")
public class PPOAppConfig {
    @Autowired
    FimsAppConfig fimsAppConfig;
    @Autowired
    MessageSource messageSource;
    @Autowired
    Client esClient;

    @Bean
    @Scope("prototype")
    public FimsMetadataFileManager FimsMetadataFileManager() {
        FimsMetadataPersistenceManager persistenceManager = new ESFimsMetadataPersistenceManager(
                esClient,
                fimsAppConfig.fimsProperties());
        return new FimsMetadataFileManager(persistenceManager, fimsAppConfig.fimsProperties(),
                fimsAppConfig.expeditionService, fimsAppConfig.bcidService, messageSource);
    }

}
