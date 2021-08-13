(function() {
	//	function fileAdd() {
	//		document.getElementById("file_add").click();
	//	}

	function guid() {
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000)
				.toString(16)
				.substring(1);
		}
		return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
			s4() + '-' + s4() + s4() + s4();
	}
	function upload(start, end, chunkSize, divUpload, originalName, guid, first, last, fileIndex, fullSize, name, curWindow) {
		var formData = new FormData();	// formData 초기화(IE에서는 FormData.set, FormData.delete 호환 안됨.)
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

		xhr.onreadystatechange = function() {
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
						fileIndex, fileList[fileIndex]['size'], fileList[fileIndex]['name'], curWindow);
				}
			}
		}
		xhr.upload.onprogress = function(e) {
			if (e.lengthComputable) {
				if (divUpload) var ratio = Math.round((end / fullSize) * 100);		// e.loaded vs end
				else var ratio = 100;

				var progress = curWindow.document.getElementById("progress_bar" + fileIndex);
				progress.style.width = ratio + '%';
				progress.innerHTML = ratio + '% complete';
				progress.style.float = "left";

				if (ratio >= 100 && fileIndex + 1 == fileList.length) curWindow.close();	// 전역 배열의 마지막

			}
		}
		xhr.send(formData);
	}

	function popup(popWindow, fileList) {
		for (var idx = 0; idx < fileList.length; idx++) {
			var wrapper = popWindow.document.createElement("div");

			var fileName = popWindow.document.createElement("p");
			fileName.innerText = fileList[idx]['originalName'];
			fileName.style.marginTop = "40px";

			var bar_container = popWindow.document.createElement("div");
			bar_container.id = "progress_bar_container" + idx;
			bar_container.style.height = "20px";
			bar_container.style.border = "1px solid #9a9a9a";

			var bar = popWindow.document.createElement("div");
			bar.id = "progress_bar" + idx;
			bar.style.width = "0%";
			bar.style.height = "100%";
			bar.style.backgroundColor = "#e2e2e2";

			bar_container.appendChild(bar);

			wrapper.appendChild(fileName);
			wrapper.appendChild(bar_container);
			popWindow.document.body.appendChild(wrapper);
		}
	}
	function onlyOne(checkbox) {			// only one checkbox available
		var checkboxes = document.querySelectorAll("input_chk");
		checkboxes.forEach(chkbox, function () {
			if (chkbox !== checkbox) chkbox.checked = false;
		});
	}
	var fileList = [];
	var chunkSize = 1024 * 1024 * 5;	// 1024 * 1024 * 5 하면 차이남
	var start = 0;
	var end = chunkSize;
	if (window.NodeList && !NodeList.prototype.forEach) {
		NodeList.prototype.forEach = Array.prototype.forEach;
	}
	var options = 'top=10, left=10, width=600, height=600, status=no, menubar=no, toolbar=no, resizable=no';
	window.onload = function() {
		var btns = document.querySelectorAll("button");
		var list = document.getElementById("file_list");

		btns.forEach(function(btn) {
			btn.addEventListener("click", function() {
				switch (btn.id) {
					case "add":

						var input = document.getElementById("file_add");

						input.onchange = function() {

							var files = input.files;

							var ol = document.getElementById("file_list");
							var listLen = fileList.length;
							for (var index = 0; index < files.length; index++) {		// MDN input.addEventListner("change") 참고해야함
								var sameFile = false;
								for (var j = 0; j < listLen; j++) {		// 새로 추가할 파일이 이미 전역 배열에 있을 경우 추가 안함.

									if (files[index]['name'] == fileList[j]['originalName']) {
										sameFile = true;
										break;
									}
								}
								if (!sameFile) {
									fileList.push(
										{
											obj: files[index],
											fileIndex: index,
											size: files[index]['size'],
											originalName: files[index]['name'],
											name: files[index]['name'].substring(0, files[index]['name'].lastIndexOf('.')),
											extension: '.' + files[index]['name'].split('.').pop(),
											chunksize: files[index].slice(start, chunkSize)['size'],
											divUpload: files[index]['size'] > chunkSize ? true : false,
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
									fnameSp.title = files[index]['name'];
									fnameSp.innerText = files[index]['name'];
									fnameSp.style.textAlign = "left";

									fname.appendChild(fnameSp);

									var fsize = document.createElement("li");
									fsize.className = "fsize";

									var fsizeSp = document.createElement("span");
									fsizeSp.title = String(files[index]['size']) + " bytes";
									fsizeSp.innerText = files[index]['size'] + " bytes";
									fsizeSp.style.textAlign = "right";

									fsize.appendChild(fsizeSp);

									ul.appendChild(inputChkLi);
									ul.appendChild(fname);
									ul.appendChild(fsize);
									li.appendChild(ul);
									ol.appendChild(li);
								}
							}

							list.style.height = String(files.length * 21) + "px";
							
							// checkbox (use for delete)
							var chks = document.querySelectorAll("ul");
							var chksLen = chks.length;
							chks.forEach(function(chk) {
								console.log(chks);
								chk.addEventListener("click", function() {
									switch (chk.id) {
										case "fname0":
											chk.parentNode.firstChild.firstChild.checked = true;
											break;
										case "fname1":
											chk.parentNode.firstChild.firstChild.checked = true;
											break;
									}


								});
							});
						}
						input.click();	// click 호출을 change 이벤트 이후에 적용(이전에 하면 IE에서 동작x)
						break;
					case "submit":
						var progressPop = window.open("./progress.html", "_blank", options);
						if ((navigator.appName == 'Netscape' && navigator.userAgent.toLowerCase().indexOf('trident') != -1) || (navigator.userAgent.toLowerCase().indexOf("msie") != -1)) {  // ie -> winPop.onload = new function()
							progressPop.onload = new function() {
								popup(progressPop, fileList);
								upload(start, end, chunkSize, fileList[0]['divUpload'], fileList[0]['originalName'], fileList[0]['GUID'],
									fileList[0]['first'], fileList[0]['last'], 0, fileList[0]['size'], fileList[0]['name'], progressPop);
							}
						} else {
							progressPop.onload = function() {
								popup(progressPop, fileList);
								upload(start, end, chunkSize, fileList[0]['divUpload'], fileList[0]['originalName'], fileList[0]['GUID'],
									fileList[0]['first'], fileList[0]['last'], 0, fileList[0]['size'], fileList[0]['name'], progressPop);
							}
						}
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