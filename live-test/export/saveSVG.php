<?php

if (isset($_POST['svg'])) {
	saveSVG($_POST['svg'], $_POST['mats'], $_POST['note']);
}


function saveSVG($svg, $matTable, $note) {
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

	$bodystart = '<body';

	$head = '<head>
				<meta charset="UTF-8">
			</head>';

$css = '<style>

				body {
					font-family: Verdana;
				}

				#background {
					width: 100%;
					height: 80%;
					top: 10%;
					position: fixed;
					z-index: -2; 
					background-image: url("vannmerke.png");
					background-repeat: repeat-y;
					background-size: 100%;
					-khtml-opacity:.50; 
					-moz-opacity:.50; 
					-ms-filter:"alpha(opacity=50)";
					filter:alpha(opacity=50);
					filter: progid:DXImageTransform.Microsoft.Alpha(opacity=0.5);
					opacity:.50; 
				}

				#header {
					width: 100%;
					height: 10%;
					top: 0;
					text-align: center;
				}

				#headleft {
					float: left;
					width: 50%;
					height: 10%;
					top: 0;
					text-align: center;
				}

				#headlogo {
					display: inline-block;
					width: 70%;
				}

				#headright {
					left: 71%;
					z-index: -1;
					position: absolute;
				}

				#headdots {
					float: right;
					width: 100%;
				}

				#imagecontainer {
					width: 100%;
					max-height: 80%;
					text-align: center;
				}

				#image {
					margin-top: 5%;
					display: inline-block;
				}

				#matTable {
					width: 100%;
					text-align: left;
				}

				table {
					border-collapse: collapse;
				}

				table, tr, td, th {
					border: 2px solid black;
				}

				.amount {
					text-align: center;
				}

				#note {
					width: 100%;
					text-align: left;
				}

				#footer {
					width: 100%;
					height: 10%;
					position: absolute;
					bottom: 0;
					text-align: center;
				}

				#footright {
					float: right;
					width: 50%;
				}

				#footinfo {
					display: inline-block;
					text-align: left;
					line-height: 130%;
				}

				.bold {
					font-weight: bold;
				}

			</style>';

	$background = '<div id="background"></div>';

	$header = '<div id="headleft">
					<img id="headlogo" src="varmesystemer_logo.jpg">
				</div>

				<div id="headright">
					<img id="headdots" src="dots.png">
				</div>';

	

	// Image of the calculated schema.
	$image = '<div id="imagecontainer"><div id="image">'.$svg.'</div></div>';
	
	// Table containing information on products used. 
	$table = '<br><br><br>'.$matTable;

	// Additional note regarding this product.
	$AdditionalNote = '<p id="note" class="bold">'.$note.'</p>';

	// Footnote
	$foot = '<div id="footer">
				<div id="footright">
					<p id="footinfo">
						<span class="bold"> Thermo-Floor AS </span> <br>
						Østre Totenvei 24, 2816 Gjøvik <br>
						Telefon: 61 18 77 77 <br>
						post@thermo-floor.no - <span class="bold">www.thermo-floor.no</span> </p>
					</div>
				</div>
			</div>';

	$bodyend = '</body>';

	// gives the javascript Post a string containing the id on success.
	echo $entryId;

	file_put_contents($dir.'\entry_'.$entryId.'.html', $bodystart.$head.$css.$background.$header.$image.$table.$AdditionalNote.$foot.$bodyend);		

}

?>