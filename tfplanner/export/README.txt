For installing on LINUX:

1. Untar 'wkhtmltox-linux-amd64_0.12.0-03c001d.tar.xz'.
2. Ensure that location of wkhtmltopdf is '/wkhtmltox/bin/wkhtmltopdf' within 'export' folder.
3. Ensure that $application variable within /export/export.php is same as folder above (point 2).
4. Ensure that $command varaible within /export/export.php is the marked "Linux". 
5. Give export.php and saveHTML.php permissions for executing commands, including shell_exec.