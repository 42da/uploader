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
		if (divUpload) fileList[fileIndex] = fileList[fileIndex]['obj'].slice(start, end);
		console.log(first, fileList[fileIndex]);
		formData.set('file', fileList[fileIndex]['obj']);
		formData.set('start', start);
		formData.set('divUpload', divUpload);
		formData.set('originalName', originalName);
		formData.set('guid', guid);
		formData.set('first', first);
		formData.set('last', last);
		formData.set('fullSize', fullSize);
		formData.set('name', name)
//		if (first) {
//			formData.set('first', first);
////			formData.set('fileInfo', JSON.stringify(fileList[fileIndex]));
////			xhr.setRequestHeader("first", true);
//		} else if (!first && last){
//			formData.set('last', last);
////			xhr.setRequestHeader("first", false);
//		}
		
		xhr.onreadystatechange = function () {
			if (xhr.readyState === xhr.DONE) {
				if (xhr.status === 0 || (xhr.status >= 200 && xhr.status < 400)) { // In local files, status is 0 upon success in Mozilla Firefox
//					formData.delete('file');
//					formData.delete('fileInfo');
//					first = false;
					if (!divUpload || last) {
						var loaded_list = document.createElement("ul");
						loaded_list.className = "completed_list";
						var loaded_file = document.createElement("li");
						loaded_file.className = "completed_file";
						loaded_file.innerText = fileList[fileIndex]['originalName'] + " 업로드 완료";
						loaded_list.appendChild(loaded_file);
						loaded_list.style.width = "768px";
						loaded_list.style.textAlign = "right";
						document.body.appendChild(loaded_list);
						
						console.log(start, end, chunkSize, divUpload, first, last, fileIndex, fullSize);
						console.log(fileList);
						console.log(xhr.responseText);

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
						first = false;
						if (end >= fullSize) {
							end = fullSize;
							last = true;
						}
					}
					upload(start, end, chunkSize, fileList[fileIndex]['divUpload'], fileList[fileIndex]['first'], fileList[fileIndex]['last'], fileIndex, fullSize, fileList[fileIndex]['name']);
				}
			}
			
		}
		xhr.send(formData);
	}
	var fileList = [];
	var formData = new FormData();
	var chunkSize = 1024 * 1024 * 5;
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
							console.log(file);
							var ol = document.getElementById("file_list");
							for (var index = 0; index < file.length; index++) {
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
								fsizeSp.title = `${file[index]['size']} bytes`;
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
							console.log(file);
							console.log(input.value);
							console.log(fileList);
							
						});
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