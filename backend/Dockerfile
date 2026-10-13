# Multi-stage Dockerfile for CleanRoute Spring Boot Backend
# Builds with Maven, runs with lightweight OpenJDK JRE

FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B || true
COPY src ./src
COPY data ./data
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
# Copy the built jar
COPY --from=builder /app/target/*.jar app.jar
# Copy data directory (CSV files)
COPY --from=builder /app/data ./data

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
