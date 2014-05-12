<?php

	if (isset($_POST['data'])) {
		export($_POST['data']);
	}

	function export($drawId) {

		// this file directory
		$dir = getcwd();
		// location of exe
		$application = 'wkhtmltopdf\bin\wkhtmltopdf.exe';
		// html file / input
		$htmlInput = $dir.'\entry_'.$drawId.'.html';
		// output name / file
		$pdfOutput = 'export_'.$drawId.'.pdf';

		// Windows
		$command = ($application.' -l '.$htmlInput.' '.$pdfOutput);
		
		// Linux
		//$command = './wkhtmltox/bin/wkhtmltopdf '.$htmlInput.' '.$pdfOutput;

		// Execute command.
		shell_exec($command);

		echo $pdfOutput;

	}

?>