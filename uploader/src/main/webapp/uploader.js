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
	function upload(start, end, chunkSize, divUpload, originalName, guid, first, last, fileIndex, fullSize, name) {
		
		var xhr = new XMLHttpRequest();

		xhr.open('POST', '/uploader/UploadServlet');
		if (divUpload) formData.append('file', fileList[fileIndex]['obj'].slice(start, end));
		else formData.append('file', fileList[fileIndex]['obj']);
		
		formData.append('start', start);
		formData.append('divUpload', divUpload);
		formData.append('originalName', originalName);
		formData.append('guid', guid);
		formData.append('first', first);
		formData.append('last', last);
		formData.append('fullSize', fullSize);
		formData.append('name', name);
		
		xhr.upload.onprogress = function(e) {
			if (e.lengthComputable) {
				if (divUpload) {
					var ratio = Math.round((end / fullSize) * 100) + '%';
					console.log(ratio);
				}
			}
		}
		xhr.onreadystatechange = function () {
			if (xhr.readyState === xhr.DONE) {
				if (xhr.status === 0 || (xhr.status >= 200 && xhr.status < 400)) { // In local files, status is 0 upon success in Mozilla Firefox
					
					if (!divUpload || last) {
						
						var loaded_list = document.createElement("ul");
						loaded_list.className = "completed_list";
						var loaded_file = document.createElement("li");
						loaded_file.className = "completed_file";
						loaded_file.style.marginTop = "20px";
						loaded_file.innerText = fileList[fileIndex]['originalName'] + " 업로드 완료";
						loaded_list.appendChild(loaded_file);
						loaded_list.style.width = "768px";
						loaded_list.style.textAlign = "right";

						document.body.querySelector(".upload_gray").appendChild(loaded_list);
						fileList[fileIndex]['path'] = xhr.responseText + fileList[fileIndex]['originalName'];

						if (++fileIndex == fileList.length) return;
						else {
							start = 0;
							end = chunkSize;
							last = false;
						}

					} else {
						
						start = end;
						end = start + chunkSize;
						fileList[fileIndex]['first'] = false;
						if (end >= fullSize) {
							end = fullSize;
							fileList[fileIndex]['last'] = true;
						}

					}
					upload(start, end, chunkSize, fileList[fileIndex]['divUpload'], fileList[fileIndex]['originalName'],
									fileList[fileIndex]['GUID'], fileList[fileIndex]['first'], fileList[fileIndex]['last'], 
									fileIndex, fullSize, fileList[fileIndex]['name']);
				}
			}
			
		}
		xhr.send(formData);
	}
	var fileList = [];
	var formData = new FormData();
	var chunkSize = 1024 * 1024 * 5;	// 1024 * 1024 * 5 하면 차이남
	var start = 0;
	var end = chunkSize;
	 if (window.NodeList && !NodeList.prototype.forEach) {
		 NodeList.prototype.forEach = Array.prototype.forEach;
	 }
	window.onload = function() {
		var btns = document.querySelectorAll("button");
		var list = document.getElementById("file_list");

		btns.forEach(function(btn) {
			btn.addEventListener("click", function() {
				switch (btn.id) {
					case "add":

//						fileAdd();
						var input = document.getElementById("file_add");
						
						
						input.addEventListener("change", function() {
							
							var file = input.files;
//							fileList.push(
//								{
//									//obj: file[index]['size'] > chunkSize ? file[index].slice(start, chunkSize) : file[index],
//									obj: file[index],
//									fileIndex: index,
//									size: file[index]['size'],
//									originalName: file[index]['name'],
//									name: file[index]['name'].substring(0, file[index]['name'].lastIndexOf('.')),
//									extension: '.' + file[index]['name'].split('.').pop(),
//									chunksize: file[index].slice(start, chunkSize)['size'],
//									divUpload: file[index]['size'] > chunkSize ? true : false,
//									lastModified: file[index]['lastModified'],
//									GUID: guid(),
//									path: '',
//									first: true,
//									last: false
//								}
//							);
							var ol = document.getElementById("file_list");
							console.log(file, "file!!!!");
//							debugger;
							for (var index = 0; index < file.length; index++) {		// MDN input.addEventListner("change") 참고해야함 
								fileList.push(
										{
//											obj: file[index]['size'] > chunkSize ? file[index].slice(start, chunkSize) : file[index],
											obj: file[index],
											fileIndex: index,
											size: file[index]['size'],
											originalName: file[index]['name'],
											name: file[index]['name'].substring(0, file[index]['name'].lastIndexOf('.')),
											extension: '.' + file[index]['name'].split('.').pop(),
											chunksize: file[index].slice(start, chunkSize)['size'],
											divUpload: file[index]['size'] > chunkSize ? true : false,
											lastModified: file[index]['lastModified'],
											GUID: guid(),
											path: '',
											first: true,
											last: false
										}
									);
								
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
								fsizeSp.title = String(file[index]['size']) + " bytes";
								fsizeSp.innerText = file[index]['size'] + " bytes";
								fsizeSp.style.textAlign = "right";
								
								fsize.appendChild(fsizeSp);
								
								ul.appendChild(inputChkLi);
								ul.appendChild(fname);
								ul.appendChild(fsize);
								li.appendChild(ul);
								ol.appendChild(li);
								
							}
							
							list.style.height = String(file.length * 21) + "px";
							
							
						});
						input.click();	// click 호출을 change 이벤트 이후에 적용(이전에 하면 IE에서 동작x)
						break;
					case "submit":
						upload(start, end, chunkSize, fileList[0]['divUpload'], fileList[0]['originalName'], fileList[0]['GUID'],
										fileList[0]['first'], fileList[0]['last'], 0, fileList[0]['size'], fileList[0]['name']);
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