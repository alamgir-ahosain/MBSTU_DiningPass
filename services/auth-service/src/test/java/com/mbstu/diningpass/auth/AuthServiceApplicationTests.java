package com.mbstu.diningpass.auth;

import com.mbstu.diningpass.auth.config.TestFirebaseConfig;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestFirebaseConfig.class)
class AuthServiceApplicationTests {

	@Test
	void contextLoads() {
	}

}
