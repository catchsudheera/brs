package com.brs.backend.Configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;
import java.io.File;
import java.io.IOException;
import java.net.InetAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;

/**
 * This is ugly but the configtree thing did not work
 *   config:
 *     import: "optional:configtree:/run/secrets/"
 */

@Configuration
public class JdbcPropertyConfiguration {

    @Value("${DB_PASSWORD_FILE}")
    private String password_file_path;

    @Bean
    public DataSource dataSource() throws IOException {
        String password = Files.readString(new File(password_file_path).toPath(), StandardCharsets.UTF_8).strip();
        System.out.println(password);
        DataSourceBuilder<?> dataSourceBuilder = DataSourceBuilder.create();
        dataSourceBuilder.url("jdbc:mysql://mysql:3306/brs");
        dataSourceBuilder.username("brs_user");
        dataSourceBuilder.password(password);
        return dataSourceBuilder.build();
    }
}
