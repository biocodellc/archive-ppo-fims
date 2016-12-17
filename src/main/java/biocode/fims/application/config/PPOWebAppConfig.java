package biocode.fims.application.config;

import biocode.fims.fileManagers.AuxilaryFileManager;
import org.springframework.context.annotation.*;

import java.util.ArrayList;
import java.util.List;

/**
 * configuration class for ppo-fims webapp
 */
@Configuration
@Import({PPOAppConfig.class, FimsWebAppConfig.class})
public class PPOWebAppConfig {

    @Bean
    @Scope("prototype")
    public List<AuxilaryFileManager> fileManagers() {
        return new ArrayList<>();
    }
}
