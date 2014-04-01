<?php

	if (isset($_POST['data'])) {
		export($_POST['data']);
	}

	function export($drawId) {

		// location of exe
		$application = 'wkhtmltopdf\bin\wkhtmltopdf.exe';
		// html file / input
		$htmlInput = 'http://drawers/drawer/export/entry_'.$drawId.'.html';
		// output name / file
		$pdfOutput = 'export_'.$drawId.'.pdf';

		exec($application.' -l '.$htmlInput.' '.$pdfOutput);

		echo $pdfOutput;

	}

?>