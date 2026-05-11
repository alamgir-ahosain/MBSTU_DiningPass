package com.mbstu.diningpass.meal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class MealServiceApplication {

	public static void main(String[] args) {

		SpringApplication.run(MealServiceApplication.class, args);
	}

}
