Drawers
=======
This is a private folder where developing and testing will occurate.


### Startup!
* Install sublime.
* Install wamp.
* Enable apache rewrite module.
* Edit `C:\wamp\bin\apache\apache2.2.22\conf\extra\httpd-vhosts.conf`, adding a new virtual host.
`<VirtualHost *:80>
	ServerAdmin webmaster@drawers
	DocumentRoot "C:\Users\John\Documents\GitHub\drawers"
	ServerName drawers
	ServerAlias drawers
	<Directory "C:\Users\John\Documents\GitHub\drawers">
		Options Indexes FollowSymLinks MultiViews
		AllowOverride All
		Order allow,deny
		allow from all       
	</Directory>
	ErrorLog "drawers.log"
	CustomLog "drawers" common
</VirtualHost>`
* Edit `C:\Windows\System32\drivers\etc\hosts.file`, adding a new hostname.
* Restart wamp.


### Folder structure!
* `Experiments`: Experiments we encounter / use / try.
* `Working parts`: Functionality we are going to use / implement.
* `Drawer`: This is the drawing part of the program.
* `Calculator`: This is the calculating part of the program.