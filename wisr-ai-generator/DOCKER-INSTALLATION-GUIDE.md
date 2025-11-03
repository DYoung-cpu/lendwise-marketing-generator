# Docker Desktop Installation Guide
## For Windows with WSL2

**Your System**: Windows with WSL2 (Ubuntu)
**Time Required**: 10-15 minutes
**Restart Required**: Yes (after installation)

---

## Step-by-Step Installation

### Step 1: Download Docker Desktop

**Direct Download Link**: https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe

Or visit: https://www.docker.com/products/docker-desktop/ and click "Download for Windows"

**File Size**: ~500 MB
**Download Time**: 2-5 minutes (depending on internet speed)

---

### Step 2: Run the Installer

1. **Locate the downloaded file**:
   - Usually in: `C:\Users\dyoun\Downloads\Docker Desktop Installer.exe`

2. **Double-click the installer**
   - Windows may ask: "Do you want to allow this app to make changes?" → Click **Yes**

3. **Configuration screen**:
   - ✅ **CHECK**: "Use WSL 2 instead of Hyper-V" (should be checked by default)
   - ✅ **CHECK**: "Add shortcut to desktop" (optional, but convenient)
   - Click **OK**

4. **Wait for installation**:
   - Progress bar will show: "Unpacking files..."
   - Takes 3-5 minutes
   - Do NOT close the window

5. **Installation complete**:
   - You'll see: "Installation succeeded"
   - Click **Close and restart**

---

### Step 3: Restart Your Computer

**IMPORTANT**: You MUST restart for Docker to work properly.

1. Save all your work
2. Restart Windows
3. Wait for computer to fully restart

---

### Step 4: Start Docker Desktop

After restart:

1. **Docker Desktop should auto-start**
   - You'll see a whale icon in your system tray (bottom-right of screen)
   - If not, search for "Docker Desktop" in Start menu and open it

2. **Accept the agreement**:
   - First launch will show Docker Subscription Service Agreement
   - Check "I accept the terms"
   - Click **Accept**

3. **Wait for Docker to start**:
   - You'll see: "Docker Desktop is starting..."
   - **First start takes 1-2 minutes**
   - When ready, you'll see: "Docker Desktop is running"

---

### Step 5: Enable WSL2 Integration

**CRITICAL STEP** - This allows Docker to work in your Ubuntu WSL2 environment.

1. **Open Docker Desktop Settings**:
   - Click the whale icon in system tray
   - Click the gear icon ⚙️ (Settings)

2. **Navigate to Resources → WSL Integration**:
   - Left sidebar: Click **Resources**
   - Then click: **WSL Integration**

3. **Enable Ubuntu**:
   - Toggle ON: "Enable integration with my default WSL distro"
   - Under "Enable integration with additional distros":
     - Find **Ubuntu** in the list
     - Toggle it **ON** (blue)
   - Click **Apply & Restart**

4. **Wait for Docker to restart**:
   - Takes 30-60 seconds
   - You'll see: "Docker Desktop is restarting..."
   - Wait for: "Docker Desktop is running"

---

### Step 6: Verify Installation in WSL2

Open your WSL2 Ubuntu terminal and run these commands:

```bash
# Check Docker version
docker --version

# Expected output:
# Docker version 24.0.7, build afdd53b
# (version number may be different, that's OK)
```

```bash
# Check Docker daemon is running
docker ps

# Expected output:
# CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
# (Empty list is normal - no containers running yet)
```

If both commands work without errors, **Docker is installed correctly!** ✅

---

## Troubleshooting

### Problem: "docker: command not found"

**Solution**:
1. Make sure Docker Desktop is running (check system tray for whale icon)
2. Re-check WSL Integration settings (Step 5)
3. Close and reopen your WSL2 terminal
4. If still not working, restart WSL2:
   ```bash
   # In PowerShell (Windows)
   wsl --shutdown
   # Then reopen Ubuntu
   ```

---

### Problem: "Cannot connect to Docker daemon"

**Solution**:
1. Check if Docker Desktop is running (whale icon in system tray)
2. If not, start Docker Desktop from Start menu
3. Wait 1-2 minutes for it to fully start
4. Try `docker ps` again

---

### Problem: Docker Desktop won't start

**Solution**:
1. Check Windows version: Must be Windows 10 version 2004+ or Windows 11
   - Press `Windows + R`
   - Type: `winver`
   - Click OK
   - Check version number

2. Make sure WSL2 is installed:
   ```powershell
   # In PowerShell (as Administrator)
   wsl --list --verbose
   ```
   - Should show Ubuntu with VERSION 2

3. If WSL2 not installed or VERSION is 1:
   ```powershell
   # In PowerShell (as Administrator)
   wsl --set-version Ubuntu 2
   ```

---

### Problem: "WSL 2 installation is incomplete"

**Solution**:
1. Download and install WSL2 kernel update:
   - https://aka.ms/wsl2kernel
   - Run the installer
   - Restart computer

---

## After Installation - Next Steps

Once Docker is verified working:

### 1. Run Setup Script

```bash
cd "/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator"
./setup-docker-neo4j.sh
```

**What this does**:
- Pulls Neo4j Docker image (~500 MB, 2-3 minutes)
- Creates `neo4j-claude-memory` container
- Starts Neo4j with password: claudecode123
- Opens Neo4j Browser at: http://localhost:7474

---

### 2. Verify Setup

```bash
./verify-setup.sh
```

**Expected output**:
```
=== Docker & Neo4j ===
✅ Docker installed: Docker version 24.x.x
✅ Docker daemon is running
✅ Neo4j container is running
✅ Neo4j Browser accessible (http://localhost:7474)
```

---

### 3. Start All Services

```bash
./startup.sh
```

**Services started**:
- ✅ Neo4j database (ports 7474, 7687)
- ✅ Marketing interface (port 8080)
- ✅ Quality backend (port 3001)

---

### 4. Access Neo4j Browser

Open browser: http://localhost:7474

**Login**:
- Username: `neo4j`
- Password: `claudecode123`

**First time setup**:
1. Enter credentials above
2. Click **Connect**
3. You'll see Neo4j Browser interface
4. Empty graph is normal (no data yet)

---

## Quick Reference

### Common Docker Commands

```bash
# Check Docker version
docker --version

# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Start Neo4j container
docker start neo4j-claude-memory

# Stop Neo4j container
docker stop neo4j-claude-memory

# View Neo4j logs
docker logs neo4j-claude-memory

# Check Docker Desktop status
docker info
```

---

### Docker Desktop Management

**Start Docker Desktop**:
- Search "Docker Desktop" in Start menu → Open

**Stop Docker Desktop**:
- Right-click whale icon in system tray → Quit Docker Desktop

**Restart Docker Desktop**:
- Right-click whale icon → Restart

**Update Docker Desktop**:
- Click whale icon → Check for updates
- Download and install if available

---

## System Resources

Docker Desktop uses system resources:

**Default Settings**:
- Memory: 2 GB RAM
- CPUs: 2 cores
- Disk: 20 GB (grows as needed)

**To Adjust** (if needed):
1. Docker Desktop → Settings → Resources
2. Adjust sliders for Memory/CPUs/Disk
3. Click Apply & Restart

**Recommended for WISR**:
- Memory: 4 GB (if you have 16+ GB RAM)
- CPUs: 2-4 cores
- Disk: Default is fine

---

## Complete Installation Checklist

- [ ] Downloaded Docker Desktop installer
- [ ] Ran installer with WSL2 option checked
- [ ] Restarted computer
- [ ] Started Docker Desktop
- [ ] Accepted service agreement
- [ ] Enabled WSL Integration for Ubuntu
- [ ] Applied & restarted Docker
- [ ] Verified: `docker --version` works in WSL2
- [ ] Verified: `docker ps` works in WSL2
- [ ] Ran: `./setup-docker-neo4j.sh`
- [ ] Verified: `./verify-setup.sh` passes all checks
- [ ] Started services: `./startup.sh`
- [ ] Accessed Neo4j Browser: http://localhost:7474

---

## Support Links

**Docker Desktop Documentation**:
- https://docs.docker.com/desktop/install/windows-install/

**Docker Desktop WSL2 Backend**:
- https://docs.docker.com/desktop/wsl/

**WSL2 Setup**:
- https://docs.microsoft.com/en-us/windows/wsl/install

**Docker Community**:
- https://forums.docker.com/

---

## Estimated Time Breakdown

| Step | Time | Notes |
|------|------|-------|
| Download Docker Desktop | 2-5 min | Depends on internet speed |
| Install Docker Desktop | 3-5 min | Automated |
| Restart computer | 2-3 min | Required |
| First Docker startup | 1-2 min | One-time setup |
| Configure WSL Integration | 1-2 min | Manual settings |
| Verify installation | 1 min | Run test commands |
| **TOTAL** | **10-18 min** | **Excluding download time** |

---

## After Docker is Running

You're ready to complete the WISR AI Generator setup!

**Next commands**:
```bash
cd "/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator"

# Install Neo4j
./setup-docker-neo4j.sh

# Verify everything
./verify-setup.sh

# Start all services
./startup.sh

# Then restart Claude Code to load orchestrator!
```

---

**Docker installation is straightforward. Follow these steps and you'll be ready in 15 minutes!**

*Guide created: 2025-10-29*
*For Windows 10/11 with WSL2 (Ubuntu)*
