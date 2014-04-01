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

		// Count entries.
		if (explode('_', $rootFile)[0] == 'entry') {
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

	$css = '<style>
				#matTable {
					width: 100%;
				}

				table {
					border-collapse: collapse;
				}

				table, tr, td {
					border: 1px solid black;
				}

			</style>';

	// adding image from svg string 
	$image = $svg;
	// adding text 
	$text = '<br>'.$matTable;

	file_put_contents($dir.'\entry_'.$entryId.'.html', $css.$image.$text);		

}

?>