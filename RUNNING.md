# 🎵 Worship Song Library - Getting Started

## Current Status ✅

- **Java 17**: Configured and working
- **Build**: Successful (WAR ready at `target/worship-song-library-1.0-SNAPSHOT.war`)
- **Tests**: All passing
- **Ready for**: Deployment and testing

---

## Quick Start: Run the Application

### Step 1: Build the Project (2 min)

Using the convenient script:
```powershell
cd D:\worship-song-library
.\run.ps1 -Action build
```

Or using Maven directly:
```powershell
C:\Users\Lenovo\.maven\maven-3.9.14\bin\mvn.cmd clean package -DskipTests
```

### Step 2: Setup Tomcat (5 min)

1. **Download Tomcat 10**: https://tomcat.apache.org/download-10.cgi
   - Choose **apache-tomcat-10.1.28-windows-x64.zip**

2. **Extract** to `C:\apache-tomcat-10.1.28`

3. **Copy WAR file**:
   ```powershell
   Copy-Item "D:\worship-song-library\target\worship-song-library-1.0-SNAPSHOT.war" `
     -Destination "C:\apache-tomcat-10.1.28\webapps\worship.war"
   ```

### Step 3: Start Server (1 min)

**Windows Command Prompt** (or PowerShell as Administrator):
```batch
C:\apache-tomcat-10.1.28\bin\catalina.bat run
```

Wait for message: `Server startup in X ms`

### Step 4: Access Application

Open your browser to: **http://localhost:8080/worship**

---

## Key URLs

| Page | URL |
|------|-----|
| Home | http://localhost:8080/worship |
| Login | http://localhost:8080/worship/jsp/login.jsp |
| Search | http://localhost:8080/worship/jsp/search.jsp |

---

## Troubleshooting

**Port 8080 already in use?**
```powershell
netstat -ano | findstr :8080
# Kill the process, or change port in catalina.properties
```

**Project not found?**
- Ensure WAR file is renamed exactly: `worship.war` (not with version number)
- Restart Tomcat
- Check `C:\apache-tomcat-10.1.28\logs\catalina.out`

**Build fails?**
```powershell
.\run.ps1 -Action build
```

---

## Before Java 25 Upgrade

✅ Verify this works on Java 17 first:
1. Run tests: `.\run.ps1 -Action test`
2. Search functionality works correctly (via [SEARCH_TEST_CASES.md](SEARCH_TEST_CASES.md))
3. No unexpected errors in Tomcat logs
4. All search validation complete

Once Phase 1 (System Stabilization) is complete, then proceed with Java 25 upgrade.

---

## Commands Reference

```powershell
# Build and package
.\run.ps1 -Action build

# Run tests only
.\run.ps1 -Action test

# Compile only (no packaging)
.\run.ps1 -Action compile

# Show help
.\run.ps1 -Action help
```

---

## Environment Info

- **Project**: Worship Song Library v1.0-SNAPSHOT
- **Current Java**: 17 LTS
- **Build Tool**: Maven 3.9.14
- **Packaging**: WAR (Web Archive)
- **Servlet Container**: Apache Tomcat 10.1

---

**Next**: Deploy to Tomcat and test the search functionality! 🚀
