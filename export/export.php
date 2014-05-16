<?php
	/**
	 *	This file's purpose is to transform a specific HTML file to PDF.
	 *	Using "wkhtmltopdf": http://wkhtmltopdf.org/
	**/
	
	if (isset($_POST['data'])) {
		export($_POST['data']);
	}

	function export($drawId) {

		// This file directory
		$dir = getcwd();
		
		// Application directory/location.
		// OBS! Needs to be changed based on installation.
		// Windows 
		$application = 'wkhtmltopdf\bin\wkhtmltopdf.exe';

		// Linux
		//$application = './wkhtmltox/bin/wkhtmltopdf';

		// Html file / input
		$htmlInput = $dir.'\entry_'.$drawId.'.html';
		// output name / file
		$pdfOutput = 'export_'.$drawId.'.pdf';

		// Command to be executed
		// OBS! Needs to be changed based on installation.
		// Windows
		$command = ($application.' -l '.$htmlInput.' '.$pdfOutput);
		
		// Linux
		//$command = $application.' '.$htmlInput.' '.$pdfOutput;

		// Execute command.
		shell_exec($command);

		echo $pdfOutput;

	}

?>