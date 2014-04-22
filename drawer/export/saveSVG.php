<?php

if (isset($_POST['svg'])) {
	saveSVG($_POST['svg'], $_POST['mats']);
}


function saveSVG($svg, $matTable) {
	// get root directory (assuming this file is located in root).
	$dir = getcwd();

	/**
	 *	 calculate id of this drawing/svg
	 *
	**/
	// scandir
	$rootFiles = scandir($dir);

	// count entries
	$count = 0;
	foreach ($rootFiles as $rootFile) {
		//ignore entries with these names.
		if ($rootFile == '.' || $rootFile == '..') {
			continue;
		}

		$split = explode('_', $rootFile);

		if (count($split) < 2) {
			continue;
		}
		// Count entries.
		if ($split[0] == 'entry' || $split[0] == 'export') {
			$count++;

			$fileDir = $dir.'/'.$rootFile;
			// delete entries if older than 2 minutes
			$diff = (time() - filemtime($fileDir));
			if ($diff > 600) {
				unlink($fileDir);
			}

		}


	}
	$entryId = (str_replace('.', '', microtime(true)).$count);

	echo $entryId;

	$head = '<head>
				<meta charset="UTF-8">
			</head>';

	$css = '<style>

				#imagecontainer {
					width: 100%;
					text-align: center;
				}

				#image {
					display: inline-block;
				}

				#matTable {
					width: 100%;
				}

				table {
					border-collapse: collapse;
				}

				table, tr, td, th {
					border: 1px solid black;
				}

				#footer {
					width: 100%;
					height: 8%;
					position: absolute;
					bottom: 0;
					text-align: center;
				}

				#companylogo {
					float: left;
					width: 50%;
				}

				#logo {
					padding-top: 4%;
					display: inline-block;
				}

				#companyinfo {
					float: left;
					width: 50%;
				}

				#info {
					display: inline-block;
					text-align: left;
				}

			</style>';

	// Image of the calculated schema.
	$image = '<div id="imagecontainer"><div id="image">'.$svg.'</div></div>';
	
	// Table containing information on products used. 
	$text = '<br><br><br>'.$matTable;

	// Footnote
	$foot = '<div id="footer">
				<div id="companylogo">
					<img id="logo" src="tflogo.png">
				</div>
				<div id="companyinfo">
					<p id="info">
					Østre Totenv. 24, 2816 Gjøvik <br>
					Telefon: 61 18 77 77 - Telefax: 61 48 77 70 <br>
					post@thermo-floor.no - www.thermo-floor.no <br>
					</p>
				</div>
			</div>';

	file_put_contents($dir.'\entry_'.$entryId.'.html', $head.$css.$image.$text.$foot);		

}

?>