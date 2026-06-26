package org.ligoj.app.plugin.registry;

import org.ligoj.app.resource.plugin.AbstractServicePlugin;
import org.springframework.stereotype.Component;

/**
 * The artifact registry service. Parent of the registry tool plug-ins
 * (Harbor, Nexus, …).
 */
@Component
public class RegistryResource extends AbstractServicePlugin {

	/**
	 * Plug-in URL.
	 */
	public static final String SERVICE_URL = BASE_URL + "/registry";

	/**
	 * Plug-in key.
	 */
	public static final String SERVICE_KEY = SERVICE_URL.replace('/', ':').substring(1);

	@Override
	public String getKey() {
		return SERVICE_KEY;
	}

}
