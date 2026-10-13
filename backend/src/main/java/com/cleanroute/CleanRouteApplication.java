package com.cleanroute;

import com.cleanroute.service.AuthService;
import com.cleanroute.service.SeedService;
import com.cleanroute.service.StoreService;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;

@SpringBootApplication
public class CleanRouteApplication {
    public static void main(String[] args) {
        ApplicationContext ctx = SpringApplication.run(CleanRouteApplication.class, args);
        StoreService store = ctx.getBean(StoreService.class);
        SeedService seed = ctx.getBean(SeedService.class);
        AuthService auth = ctx.getBean(AuthService.class);
        store.initialize();
        seed.seed(store, auth);
        System.out.println("CleanRoute backend successfully started!");
    }
}
