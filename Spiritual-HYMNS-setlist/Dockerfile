# --- Stage 1: Build ---
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copy pom.xml and source code
COPY pom.xml .
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# --- Stage 2: Production Run ---
FROM tomcat:10.1-jdk17-temurin
WORKDIR /usr/local/tomcat

# Remove default Tomcat applications
RUN rm -rf webapps/*

# Copy the generated WAR file from the build stage as ROOT.war
# Using wildcard to handle version changes automatically
COPY --from=build /app/target/worship-song-library-*.war webapps/ROOT.war

# Expose the default Tomcat port
EXPOSE 8080

# Run Tomcat
CMD ["catalina.sh", "run"]
