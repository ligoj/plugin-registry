package org.ligoj.app.plugin.registry;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import jakarta.transaction.Transactional;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.ligoj.app.AbstractAppTest;
import org.ligoj.app.model.Node;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.annotation.Rollback;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

/**
 * Test class of {@link RegistryResource}
 */
@ExtendWith(SpringExtension.class)
@ContextConfiguration(locations = "classpath:/META-INF/spring/application-context-test.xml")
@Rollback
@Transactional
class RegistryResourceTest extends AbstractAppTest {

	@Autowired
	private RegistryResource resource;

	@BeforeEach
	void prepareData() throws IOException {
		persistEntities("csv", new Class<?>[] { Node.class }, StandardCharsets.UTF_8);
	}

	@Test
	void getKey() {
		// Coverage only
		Assertions.assertEquals("service:registry", resource.getKey());
	}
}
