
    var hD='0123456789ABCDEF';
    function dec2hex(d) {
        var h = hD.substr(d&15,1);
        while (d>15) {
            d>>=4;
            h=hD.substr(d&15,1)+h;
        }
        return h;
    }

	var uint8View;

    function Convert() {
			var hexText = "";
			var separator1 = "", separator2 = "";
			var newline = true;

			separator1 = "0x";
			  separator2 = ", "
			for (i=0; i<uint8View.length; i++) {
			  var charVal = uint8View[i];
			  hexText = hexText + separator1 + (charVal<16?"0":"") + dec2hex(charVal);
			  if (i < uint8View.length - 1) {
			    hexText += separator2;
			  }
				if (newline) {
					if ((i%16) == 15) {
						hexText += "\n";
					}
				}
			}

			console.log(hexText);
		ThunkableWebviewerExtension.postMessage(hexText);
    }

    function copyOutputToClipboard() {
        var target = document.frmConvert.ed_output;
        // https://stackoverflow.com/questions/51158061/copy-data-to-clipboard-without-selecting-any-text
        // - restoring original selection doesn't seem to work
        var origSelectionStart, origSelectionEnd;
        origSelectionStart = target.selectionStart;
        origSelectionEnd = target.selectionEnd;
        // select the content
        var currentFocus = document.activeElement;
        target.focus();
        target.setSelectionRange(0, target.value.length);
        var succeed;
        try {
            succeed = document.execCommand("copy");
        } catch(e) {
            succeed = false;
        }
        // restore original focus
        if (currentFocus && typeof currentFocus.focus === "function") {
            currentFocus.focus();
        }
        // restore prior selection
        target.setSelectionRange(origSelectionStart, origSelectionEnd);
    }

    function readFileAsArray(file) {
        var reader = new FileReader();
        reader.onload = function(){
          //var text = reader.result;
		  var arr = reader.result;
		  uint8View = new Uint8Array(arr);
		console.log(uint8View);
          Convert();
        };
        reader.readAsArrayBuffer(file);
    }

    var openFile = function(event) {
        var input = event.target;
        readFileAsArray(input.files[0]);
    };

    function drop_handler(ev) {
        ev.preventDefault();
        // If dropped items aren't files, reject them
        var dt = ev.dataTransfer;
        if (dt.items) {
            // Use DataTransferItemList interface to access the file(s)
            for (var i = 0; i < dt.items.length; i++) {
                if (dt.items[i].kind == "file") {
                    var f = dt.items[i].getAsFile();
                    readFileAsArray(f);
                    break;
                }
            }
        } else {
            // Use DataTransfer interface to access the file(s)
            for (var i = 0; i < dt.files.length; i++) {
                readFileAsArray(dt.files[i]);
                break;
            }
        }
    }

    function dragover_handler(ev) {
        // Prevent default select and drag behavior
        ev.preventDefault();
    }

    function dragend_handler(ev) {
        // Remove all of the drag data
        var dt = ev.dataTransfer;
        if (dt.items) {
            // Use DataTransferItemList interface to remove the drag data
            for (var i = 0; i < dt.items.length; i++) {
                dt.items.remove(i);
            }
        } else {
            // Use DataTransfer interface to remove the drag data
            ev.dataTransfer.clearData();
        }
    }






var ThunkableWebviewerExtension = (function () {
  const postMessageToWebview = (message) => {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(message);
    } else {
      window.parent.postMessage(message, '*');
    }
  };

  const getReceiveMessageCallback = (fxn, hasReturnValue) => (event) => {
    if (typeof fxn === 'function') {
      if (event.data) {
        let dataObject;
        try {
          dataObject = JSON.parse(event.data);
        } catch (e) {
          // message is not valid json
        }
        if (dataObject && dataObject.type === 'ThunkablePostMessage' && hasReturnValue) {
          fxn(dataObject.message, (returnValue) => {
            const returnMessageObject = { type: 'ThunkablePostMessageReturnValue', uuid: dataObject.uuid, returnValue };
            postMessageToWebview(JSON.stringify(returnMessageObject));
          });
        } else if (!hasReturnValue && (!dataObject || dataObject.type !== 'ThunkablePostMessage')) {
          fxn(event.data);
        }
      }
    }
  };

  return {
    postMessage: postMessageToWebview,
    receiveMessage: function(fxn) {
      const callbackFunction = getReceiveMessageCallback(fxn, false);
      document.addEventListener('message', callbackFunction, false);
      window.addEventListener('message', callbackFunction, false);
    },
    receiveMessageWithReturnValue: function(fxn) {
      const callbackFunction = getReceiveMessageCallback(fxn, true);
      document.addEventListener('message', callbackFunction, false);
      window.addEventListener('message', callbackFunction, false);
    },
  };
})();

function dummy(){

}
