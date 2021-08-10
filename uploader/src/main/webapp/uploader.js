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
	function upload() {
		var xhr = new XMLHttpRequest();
		xhr.open('POST', '/uploader/UploadServlet');
		if (start > end) return;
		xhr.onreadystatechange = function () {
			if (xhr.status === 200) { // In local files, status is 0 upon success in Mozilla Firefox
//				if () last index
				upload()
			}
		}
		
	}
	var fileList = [];
	var formData = new FormData();
	var chunkSize = 10 * 10 * 2;
	var start = 0;
	var end = chunkSize;
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
								if (file[index]['size'] < chunkSize) {
									fileList.push(
										{
											obj: file[index],
											fileIndex: index,
											name: file[index]['name'].substring(0, file[index]['name'].lastIndexOf('.')),
											extension: '.' + file[index]['name'].split('.').pop(),
											size: file[index]['size'],
											divUpload: false,
											path: ''
										}
									);
								} else {
									console.log(file[index].slice(start, chunkSize)['size'], 'file slice');
									fileList.push(
										
										{
											obj: file[index].slice(start, chunkSize),
											fileIndex: index,
											name: file[index]['name'].substring(0, file[index]['name'].lastIndexOf('.')),
											extension: '.' + file[index]['name'].split('.').pop(),
											size: file[index]['size'],
											chunksize: file[index].slice(start, chunkSize)['size'],
											divUpload: true,
											lastModified: file[index]['lastModified'],
											GUID: guid(),
											path: '',
											first: true,
											last: false
										}
									);
								}
								
								formData.append('file' + index, fileList[index]['obj']);
								formData.append('fileInfo' + index, JSON.stringify(fileList[index]));
								
								var li = document.createElement("li");
								var ul = document.createElement("ul");
								
								var inputChkLi = document.createElement("li");
								inputChkLi.className = "input_chk";
								
								var inputChk = document.createElement("input");
								inputChk.id = "chk_file_" + index;
								inputChk.type = "checkbox";
								inputChk.listvalue = String(index);
								
								inputChkLi.appendChild(inputChk);
								
								var fname = document.createElement("li");
								fname.className = "fname";
								
								var fnameSp = document.createElement("span");
								fnameSp.title = file[index]['name'];
								fnameSp.innerText = file[index]['name'];
								fnameSp.style.textAlign = "left";
								
								fname.appendChild(fnameSp);
								
								var fsize = document.createElement("li");
								fsize.className = "fsize";
								
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
							
							list.style.height = String(file.length * 21) + "px";
							console.log(file);
							console.log(input.value);
							console.log(fileList);
							
						});
						break;
					case "submit":
						
						var xhr = new XMLHttpRequest();
						
						xhr.addEventListener("load", function () {
							var loaded_list = document.createElement("ul");
							var loaded_file = document.createElement("li");
							loaded_file.innerText = this.responseText + " 업로드 완료";
							loaded_list.appendChild(loaded_file);
							loaded_list.style.width = "768px";
							loaded_list.style.textAlign = "right";
							for (var j = 0; j < fileList.length; j++) {
								fileList[j]['path'] = this.responseText;
							}
							console.log("file loaded");
							
							console.log(this.status);
							
							document.body.appendChild(loaded_list);
							
							
						});
						
						xhr.open('POST', '/uploader/UploadServlet');
						xhr.setRequestHeader("header", "request header");
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