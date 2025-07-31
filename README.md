options

```bash
node index.js
```
```txt
Options:
  -d, --dir          Directory to scan (relative to this script)
                                                             [string] [required]
  -f, --filesPrefix  Prefix to match files or "*" for all    [string] [required]
```

example

```bash
node index.js --dir "../myproj" --filesPrefix=app/Jobs
```
```txt
app/Jobs/ImageProcessor.php: 1 classes
app/Jobs/ImageResize.php: 1 classes
app/Jobs/Middleware/BackgroundJobLimiter.php: 1 classes
app/Jobs/SendImagesInEmail.php: 1 classes
app/Jobs/WordProcessor.php: 1 classes
✅ Report saved to: report-2025-07-31-19-11-33.txt
```
