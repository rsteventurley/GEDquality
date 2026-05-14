# GEDquality

A web-based GEDCOM file integrity checker for German Ortsfamilienbücher (OFB). GEDquality validates the internal consistency of genealogical data, checking dates, names, family relationships, and data integrity. Supports multiple concurrent users.

## Requirements

- **Node.js** 18 or higher (developed and tested on Node.js 22)
- **npm** 9 or higher

## Installation

```bash
git clone https://github.com/rsteventurley/GEDquality.git
cd GEDquality
npm install
```

## Running the Application

### Local development

```bash
npm start
```

The server starts on port 3001. Open `http://localhost:3001` in your browser.

Auto-restart on file changes (uses nodemon):

```bash
npm run dev
```

### Custom port

```bash
PORT=8080 npm start
```

### Production deployment

The application is a standard Express.js server. Any Node.js process manager works.

**Using PM2:**

```bash
npm install -g pm2
pm2 start GEDquality.js --name gedquality
pm2 save          # persist across reboots
pm2 startup       # generate startup script for your OS
```

**Using systemd** (Linux):

Create `/etc/systemd/system/gedquality.service`:

```ini
[Unit]
Description=GEDquality GEDCOM Integrity Checker
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/GEDquality
ExecStart=/usr/bin/node GEDquality.js
Restart=on-failure
Environment=PORT=3001
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Then enable and start:

```bash
sudo systemctl enable gedquality
sudo systemctl start gedquality
```

**Reverse proxy (nginx):**

Put nginx in front to handle TLS and serve on port 80/443:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT`   | `3001`  | Port the HTTP server listens on |

## Using the Application

1. **Upload a GEDCOM file** — click "Choose GEDCOM File" and select a `.ged` file (max 10 MB)
2. **Check integrity** — click "Check Integrity" to analyse the file
3. **Review results** — the report groups warnings and errors by category with remediation guidance
4. **Save results** — optionally save the report as a `.txt` file

Uploaded files are stored temporarily and automatically deleted after processing. Abandoned uploads are cleaned up within 15 minutes.

## Features

### Family Structure Validation
- Every person is linked to at least one family (as parent or child)
- Family relationships and memberships are consistent
- Orphaned individuals are flagged

### Date Validation
- GEDCOM date format correctness
- Birth before death
- Children born after parents' marriage
- Children born before mother's death
- Lifespans under 120 years
- Mother under 50 at child's birth

### Name Validation
- Unusual given names for German-speaking regions
- Comprehensive database of names from Germany, Austria, Switzerland, Hungary, Belgium, Denmark, Luxembourg, Netherlands, East Frisia, Poland, and Czech Republic
- Gender consistency with given names

### Data Integrity
- All members of each family belong to the same OFB entry
- Each person has proper source references with entry labels
- Surname consistency within families
- Children's surnames consistent with father and siblings

## Security

- **Rate limiting**: upload and check endpoints limited to 20 requests per 15 minutes per IP
- **Security headers**: `helmet` sets `X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`, and related headers
- **File type enforcement**: only `.ged` files accepted for upload
- **File size limit**: 10 MB maximum upload size
- **Per-user isolation**: each upload is tracked by a UUID token; concurrent users cannot affect each other's sessions

## Testing

```bash
npm test
```

16 tests covering GEDCOM reader methods, server structure, and upload tracking invariants.

## Architecture

- **`GEDquality.js`** — Express.js server: file upload, integrity check endpoints, TTL-based temp file cleanup
- **`GEDCOM/GedReader.js`** — GEDCOM file parser
- **`GEDCOM/GedModel.js`** — GEDCOM data model
- **`utils/GedcomIntegrityChecker.js`** — validation engine
- **`utils/names/GivenNames.js`** — given name database and gender validation
- **`DataModel/`** — date, event, person, family, and entry data models
- **`public/gedquality-app.js`** — client-side UI logic
- **`views/index.html`** — single-page application shell

## Given Names Database

Adapted from Jörg MICHAEL's `nam_dict.txt`. Includes:

- 2,785 German names
- 1,766 Austrian names
- 2,556 Swiss names
- Names from Hungary, Belgium, Denmark, Luxembourg, Netherlands, East Frisia, Poland, and Czech Republic

Gender codes: `M` male, `F` female, `?` unisex, `1M`/`1F` first-part-of-compound, `?M`/`?F` predominantly male/female.

## Changelog

### Version 1.2.0 (2026-05-14)

- Multi-user support: per-upload UUID token replaces global singleton; concurrent users are fully isolated
- Fixed file input not resetting after check (same file could not be re-uploaded without refreshing)
- Security hardening: added `helmet` (security headers), `express-rate-limit`, multer file type enforcement, removed internal error details from API responses
- Deleted unreferenced dead client JS and CSS files
- Updated dependencies (mocha 11.7.5, express 4.22.2)

### Version 1.1.0 (2025-02-23)

- Fixed given name property bug in name validation
- Improved getPageFromSource regex for entry label extraction
- Updated dependencies for security and stability
- Enhanced error handling and user feedback

### Version 1.0.0 (2025-01-29)

- Initial release of GEDquality
- Converted from LLMquality (XML comparison tool)
- Comprehensive GEDCOM integrity checking
- German given names validation
- Family relationship validation
- Date consistency checking
- Web-based interface

## Author

Steve Turley — rsturley@churchofjesuschrist.org

## License

MIT
