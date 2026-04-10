# ---- Stage 1: Build with Maven ----
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
# Download dependencies first (cached layer)
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests -B

# ---- Stage 2: Run with lightweight JRE ----
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Render assigns a PORT environment variable
ENV PORT=8080
EXPOSE ${PORT}

# Start the Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar", "--server.port=${PORT}"]
