<?php

	if (isset($_POST['data'])) {
		export($_POST['data']);
	}

	function export($drawId) {

		// this file directory
		$dir = getcwd();
		// location of exe
		$application = './wkhtmltox/bin/wkhtmltopdf';
		// html file / input
		$htmlInput = $dir.'\entry_'.$drawId.'.html';
		// output name / file
		$pdfOutput = 'export_'.$drawId.'.pdf';

		shell_exec($application.' -l '.$htmlInput.' '.$pdfOutput);

		echo $pdfOutput;

	}

?>