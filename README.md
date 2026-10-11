# MediFlow Clinic - Clinical OPD & Hospital Management System

MediFlow Clinic is an EHR (Electronic Health Record) and clinical operating platform built with React, TypeScript, Vite, and Electron, designed to operate seamlessly both as a high-performance web application and as a native Windows desktop application.

---

## Windows Desktop Application

MediFlow Clinic runs as both a high-performance web application and a native Windows desktop application with full hardware printer access, persistent offline clinical storage, and native window behavior.

### Development

Run the standard React + TypeScript web application in development mode:

```bash
npm run dev
```

### Electron Development

Start the local Vite dev server and launch the desktop Electron application connected to it:

```bash
npm run electron:dev
```

### Windows Build

Compile the production React bundle and package the Windows desktop application:

```bash
npm run electron:build
```

To generate the unpacked Windows executable directory without installer packaging:

```bash
npm run electron:build:dir
```

### Output

The generated Windows build artifacts are placed in the `release/` directory:

- **NSIS Installer:** `release/MediFlow Clinic Setup 1.0.0.exe` (Interactive installer with start menu, desktop shortcut, uninstaller, and custom install path selection)
- **Portable Executable:** `release/MediFlow Clinic Portable 1.0.0.exe` (Standalone portable single-executable)
- **Unpacked Application:** `release/win-unpacked/MediFlow Clinic.exe` (Unpacked binary folder ready for direct execution or portable distribution)

---

## Windows Application Updates

MediFlow Clinic features a production-ready automatic update system powered by **GitHub Actions**, **Electron Builder**, **GitHub Releases**, and **electron-updater**.

### Architecture Overview

```
Developer pushes tag (v1.0.1)
           ↓
    GitHub Actions
           ↓
Builds React & Windows NSIS Installer
           ↓
Publishes GitHub Release (Installer + latest.yml)
           ↓
Installed MediFlow Clinic on Windows checks for updates
           ↓
User sees non-intrusive Update Modal
           ↓
User clicks "Download Update" (runs in background)
           ↓
User clicks "Restart & Update"
           ↓
New version installed safely (All clinic data & LocalStorage preserved!)
```

---

### Commands

#### 1. Web Development
Runs the standard web application on local port 3000:
```bash
npm run dev
```

#### 2. React Production Build
Compiles the optimized React Vite bundle:
```bash
npm run build
```

#### 3. Electron Desktop Development
Starts the Vite dev server and opens the native Electron desktop client:
```bash
npm run electron:dev
```

#### 4. Build Windows Installer Locally
Generates the NSIS installer (`release/MediFlow Clinic Setup <version>.exe`):
```bash
npm run electron:build
```

---

### How to Release a New Version

To publish an automatic update to all installed MediFlow Clinic desktop clients:

#### Step 1: Update the Version in `package.json`
Increment the version number according to semantic versioning (e.g., from `1.0.0` to `1.0.1`):
```json
{
  "name": "mediflow-clinic",
  "version": "1.0.1"
}
```

#### Step 2: Commit Your Changes
```bash
git add .
git commit -m "Release version 1.0.1 - Clinical enhancements and bug fixes"
```

#### Step 3: Push Code to GitHub
```bash
git push origin main
```

#### Step 4: Create a Version Git Tag
Create an annotated tag matching the version with a `v` prefix:
```bash
git tag v1.0.1
```

#### Step 5: Push the Tag to GitHub
```bash
git push origin v1.0.1
```

#### Step 6: Automated GitHub Actions Build & Release
- Pushing the `v1.0.1` tag automatically triggers the `.github/workflows/build-windows.yml` workflow on a `windows-latest` runner.
- The workflow installs dependencies, runs `npm run lint`, builds the web bundle with `npm run build`, and invokes `electron-builder --win --publish always`.
- Electron Builder automatically creates a new GitHub Release for `v1.0.1` and attaches:
  - `MediFlow Clinic Setup 1.0.1.exe`
  - `MediFlow Clinic Setup 1.0.1.exe.blockmap`
  - `latest.yml` (containing sha512 checksums and version metadata)

#### Step 7: Automatic Detection by Installed Clients
- When users run their installed MediFlow Clinic application (or click **Check Updates** in the title bar), `electron-updater` compares their installed version against the GitHub Release metadata.
- If a newer version is found, an in-app **MediFlow Clinic Update Manager** modal appears:
  - Users can review the version and release notes.
  - Clicking **Download Update** downloads the update in the background while users continue clinic operations.
  - Clicking **Restart & Update** safely applies the new version.
  - All local patient records, consultations, prescriptions, and settings stored in LocalStorage are preserved.

---

### GitHub Repository Configuration

1. In your GitHub repository settings, go to **Settings > Actions > General > Workflow permissions**.
2. Select **Read and write permissions** so the default `GITHUB_TOKEN` can create releases and upload installer artifacts.
3. If your GitHub repository owner or name differs from `parasuraman/mediflow-clinic`, update the `publish` block in `electron-builder.json5` and the `repository` field in `package.json` accordingly:
   ```json5
   "publish": [
     {
       "provider": "github",
       "owner": "YOUR_GITHUB_USERNAME",
       "repo": "YOUR_REPO_NAME"
     }
   ]
   ```
