(function() {
	function fileAdd() {
		document.getElementById("file_add").click();
	}

	function guid() {
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000)
				.toString(16)
				.substring(1);
		}
		return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
			s4() + '-' + s4() + s4() + s4();
	}

	var fileList = [];
	var formData = new FormData();
	window.onload = function() {
		var btns = document.querySelectorAll("button");
		var list = document.getElementById("file_list");

		btns.forEach(function(btn) {
			btn.addEventListener("click", function() {
				switch (btn.id) {
					case "add":
						console.log("add");
						fileAdd();
						var input = document.getElementById("file_add");
						console.log(input);
						
						input.addEventListener("change", function() {
							
							var file = input.files;
							var ol = document.getElementById("file_list");
							for (var index = 0; index < file.length; index++) {
								fileList.push(
									{
										obj: file[index],
										name: file[index]['name'].split('.')[0],
										size: file[index]['size'],
										lastModified: file[index]['lastModified'],
										GUID: guid(),
										extension: file[index]['name'].split('.')[1],
										path: ''
									}
								);
								formData.append('file', file[index]);
								formData.append('fileInfo', JSON.stringify(fileList[index]));
								
								var li = document.createElement("li");
								var ul = document.createElement("ul");
								
								var inputChkLi = document.createElement("li");
								inputChkLi.class = "input_chk";
								
								var inputChk = document.createElement("input");
								inputChk.id = "chk_file_" + index;
								inputChk.type = "checkbox";
								inputChk.listvalue = String(index);
								
								inputChkLi.appendChild(inputChk);
								
								var fname = document.createElement("li");
								fname.class = "fname";
								
								var fnameSp = document.createElement("span");
								fnameSp.title = file[index]['name'];
								fnameSp.innerText = file[index]['name'];
								fnameSp.style.textAlign = "left";
								
								fname.appendChild(fnameSp);
								
								var fsize = document.createElement("li");
								fsize.class = "fsize";
								
								var fsizeSp = document.createElement("span");
								fsizeSp.title = `${file[index]['size']} bytes`;
								fsizeSp.innerText = file[index]['size'] + " bytes";
								fsizeSp.style.textAlign = "right";
								
								fsize.appendChild(fsizeSp);
								
								ul.appendChild(inputChkLi);
								ul.appendChild(fname);
								ul.appendChild(fsize);
								li.appendChild(ul);
								ol.appendChild(li);
								//debugger;
							}
							//formData.enctype = 'multipart/form-data';
							list.style.height = String(file.length * 21) + "px";
							console.log(file);
							console.log(input.value);
							console.log(fileList);
							
						});
						break;
					case "submit":
						var xhr = new XMLHttpRequest();
						xhr.open('POST', '/uploader/UploadServlet');
						//xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
						xhr.send(formData);
						break;
					case "delete":
						break;
					case "deleteAll":
						break;

				}
			});
		});
	}
})();