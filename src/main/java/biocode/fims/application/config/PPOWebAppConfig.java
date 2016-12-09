package biocode.fims.application.config;

import biocode.fims.fileManagers.AuxilaryFileManager;
import biocode.fims.rest.services.rest.Validate;
import biocode.fims.service.OAuthProviderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.*;

import java.util.ArrayList;
import java.util.List;

/**
 * configuration class for ppo-fims webapp
 */
@Configuration
@Import({PPOAppConfig.class, FimsWebAppConfig.class})
public class PPOWebAppConfig {

    @Autowired
    private PPOAppConfig PPOAppConfig;
    @Autowired
    private OAuthProviderService providerService;

    @Bean
    @Scope("prototype")
    public List<AuxilaryFileManager> fileManagers() {
        return new ArrayList<>();
    }

    @Bean
    @Scope("prototype")
    public Validate validate() throws Exception {
        return new Validate(PPOAppConfig.fimsAppConfig.expeditionService, PPOAppConfig.FimsMetadataFileManager(),
               fileManagers(), providerService, PPOAppConfig.fimsAppConfig.settingsManager);
    }
}
