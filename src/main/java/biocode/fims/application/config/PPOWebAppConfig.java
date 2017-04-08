package biocode.fims.application.config;

import org.springframework.context.annotation.*;

/**
 * configuration class for ppo-fims webapp
 */
@Configuration
@Import({PPOAppConfig.class, FimsWebAppConfig.class})
public class PPOWebAppConfig {
}
