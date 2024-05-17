COMBO_PAGE=http://www.txlotteryx.com/Lotto/intelligent-combos.htm
HTTP_ROOT=/var/www/html/
NUMBER_FILE=icombo-plus-numbers
QR_FILE1=lotto1.png
QR_FILE2=lotto2.png
QR_PREFIX='LOT21:WLD1JCMNS'
HTML_FILE=index.html

lynx -dump -nolist $COMBO_PAGE |grep "\-[[:digit:]]\+$" > $NUMBER_FILE
NUMBER_FILE_CONTENTS=`cat $NUMBER_FILE`

NUMBER_STRING=`awk '{ print $2 }' $NUMBER_FILE | sed 's/-//g' | tr -d '\n'`
NUMBERS1=`echo $NUMBER_STRING | awk '{print substr( $0, 1, 60 )}'`
NUMBERS2=`echo $NUMBER_STRING | awk '{print substr( $0, 61 )}'`

QR_STRING1=$QR_PREFIX$NUMBERS1
QR_STRING2=$QR_PREFIX$NUMBERS2

qrencode -o $HTTP_ROOT$QR_FILE1 $QR_STRING1
qrencode -o $HTTP_ROOT$QR_FILE2 $QR_STRING2

MOD_DATE=`date -r $HTTP_ROOT$QR_FILE1 "+%Y-%m-%d_%H:%M:%S"`

echo "<html>
<body>
	<img src=\"$QR_FILE1?$MOD_DATE\">
	<br /><br />
	<pre>
$MOD_DATE
- - - - - - - - - - - - - -
$QR_STRING1
- - - - - - - - - - - - - -
$NUMBER_FILE_CONTENTS
- - - - - - - - - - - - - -
	</pre>
	<br /><br />
	<img src=\"$QR_FILE2?$MOD_DATE\">
	<br /><br />
        <pre>
- - - - - - - - - - - - - -
$QR_STRING2
	</pre>
</body>
</html>" > $HTTP_ROOT$HTML_FILE