<?php

# haystack project
# google search results scraper
# author david@haystackproject.com
# http://www.haystackproject.com

$term = $_GET['term'];
$gSearchUrl = "http://www.google.com/search?q=" . $term;

$content = file_get_contents($gSearchUrl);

echo $content;

?>