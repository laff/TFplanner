<?php

	if (isset($_POST['data'])) {
		export($_POST['data']);
	}

	function export($drawId) {

		// Location of the application.
		// OBS! This variable is not dynamic and must be set to meet the installation.
		$application = './wkhtmltox/bin/wkhtmltopdf';
		// html file / input
		$htmlInput = 'entry_'.$drawId.'.html';
		// output name / file
		$pdfOutput = 'export_'.$drawId.'.pdf';

		$command = './wkhtmltox/bin/wkhtmltopdf test.html test.pdf 2>&1';

		$cmd = $application.' '.$htmlInput.' '.$pdfOutput;

		$out = shell_exec($command);//$command);

		//echo $pdfOutput;

		var_dump($out);
	}

?>