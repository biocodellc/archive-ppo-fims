package biocode.fims.rest;

import org.glassfish.jersey.media.multipart.MultiPartFeature;

/**
 * * Jersey Application for PPO REST Services
 */
public class PPOApplication extends FimsApplication {

    public PPOApplication() {
        super();
        packages("biocode.fims.rest.services.rest");
        register(MultiPartFeature.class);
        register(GZIPWriterInterceptor.class);
    }
}
