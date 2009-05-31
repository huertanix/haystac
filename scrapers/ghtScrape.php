<?php

# haystack project
# google hot trends scraper
# author david@haystackproject.com
# http://www.haystackproject.com

$trendDate = $_GET['date'];
$ghtUrl = "http://www.google.com/trends/hottrends?date=" . $trendDate;

$content = file_get_contents($ghtUrl);

echo $content;

?>