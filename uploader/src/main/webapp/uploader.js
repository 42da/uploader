(function() {
	function guid() {
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000)
				.toString(16)
				.substring(1);
		}
		return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
			s4() + '-' + s4() + s4() + s4();
	}
	function roundToOne(num) {		// 반올림
		return +(Math.round(num + "e+1") + "e-1");
	}
	function upload(start, end, chunkSize, extension, divUpload, originalName, guid, first, last, fileIndex, fullSize, name, curWindow, complete) {
		if (complete) {		// 이미 완료한 업로드
			fileIndex++;
			upload(start, end, chunkSize, fileList[fileIndex]['extension'], fileList[fileIndex]['divUpload'], fileList[fileIndex]['originalName'],
						fileList[fileIndex]['GUID'], fileList[fileIndex]['first'], fileList[fileIndex]['last'],
						fileIndex, fileList[fileIndex]['size'], fileList[fileIndex]['name'], curWindow, fileList[fileIndex]['complete']);
			return;
		}
		var cancel_btn = curWindow.document.getElementById("cancel");
		cancel_btn.onclick = function() {
			cancel = true;
		}
		if (cancel) {
			stop_info['GUID'] = guid;
			stop_info['path'] = fileList[fileIndex]['path'];
			stop_info['fileIndex'] = fileIndex;
			stop_info['start'] = start;
			
			curWindow.close();
			return;
		}

		var formData = new FormData();	// formData 초기화(IE에서는 FormData.set, FormData.delete 호환 안됨.)
		var xhr = new XMLHttpRequest();

		xhr.open('POST', '/uploader/UploadServlet');
		if (divUpload) formData.append('file', fileList[fileIndex]['obj'].slice(start, end));
		else formData.append('file', fileList[fileIndex]['obj']);
		
		formData.append('start', start);
		formData.append('end', end);
		formData.append('extension', extension);
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
						fileList[fileIndex]['complete'] = true;
						if (++fileIndex == fileList.length) return;
						else {
							start = 0;
							end = chunkSize;
							fileList[fileIndex]['last'] = false;
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
					upload(start, end, chunkSize, fileList[fileIndex]['extension'], fileList[fileIndex]['divUpload'], fileList[fileIndex]['originalName'],
						fileList[fileIndex]['GUID'], fileList[fileIndex]['first'], fileList[fileIndex]['last'],
						fileIndex, fileList[fileIndex]['size'], fileList[fileIndex]['name'], curWindow, fileList[fileIndex]['complete']);
				}
			}
		}
		xhr.upload.onprogress = function(e) {
			if (e.lengthComputable) {

				if (divUpload) var ratio = roundToOne((end / fullSize) * 100);		// e.loaded vs end => e.loaded: formdata의 다른 item 까지 계산하므로 안됨.

				else var ratio = 100;
				
				var total = curWindow.document.getElementById("progress_bar_all");
				var total_ratio = ratio == 100 ? roundToOne(((fileIndex + 1) / fileList.length) * 100) : roundToOne((fileIndex + (ratio/100)) / fileList.length * 100);
				total.style.width = total_ratio + '%';
				total.innerHTML = total_ratio + '% complete';
				
				var progress = curWindow.document.getElementById("progress_bar" + fileIndex);
				progress.style.width = ratio + '%';
				progress.innerHTML = ratio + '% complete';

				if (ratio == 100 && fileIndex + 1 == fileList.length) curWindow.close();	// 마지막 파일 업로드 후 팝업창 닫기

			}
		}
		
		xhr.send(formData);
	}
	
	function popup(popWindow, fileList) {
		var createBar = function(num, innerhtml) {
			var wrapper = popWindow.document.createElement("div");
			wrapper.id = "wrapper_progress" + num;
			wrapper.style.marginTop = "40px";

			var title = popWindow.document.createElement("p");
			title.innerHTML = innerhtml;

			var bar_container = popWindow.document.createElement("div");
			bar_container.id = "progress_bar_container" + num;
			bar_container.style.height = "20px";
			bar_container.style.border = "1px solid #9a9a9a";

			var bar = popWindow.document.createElement("div");
			bar.id = "progress_bar" + num;
			bar.style.width = "0%";
			bar.style.height = "100%";
			bar.style.backgroundColor = "#e2e2e2";

			bar_container.appendChild(bar);
			wrapper.appendChild(title);
			wrapper.appendChild(bar_container);
			popWindow.document.body.appendChild(wrapper);
//			if (num == "_all") {
//				wrapper.style.position = "fixed";
//				wrapper.style.width = "100%";
//				wrapper.style.backgroundColor = "#ffffff";
//				wrapper.style.marginTop = "0";
//			}
		}
		createBar("_all", "전체 진행률");
		
		for (var idx = 0; idx < fileList.length; idx++) {
			if (fileList[idx]['complete']) continue;
			createBar(idx, fileList[idx]['originalName']);
		}
	}
	function onlyOne(checkbox) {			// only one checkbox available
		var checkboxes = document.querySelectorAll("input_chk");
		checkboxes.forEach(chkbox, function() {
			if (chkbox !== checkbox) chkbox.checked = false;
		});
	}
	var fileList = [];

	var chunkSize = 10;	

//	var chunkSize = 102 * 102 * 5;	// 1024 * 1024 * 5 하면 차이남 -> formdata의 다른 item(key, value)도 포함되어있기 때문

	var start = 0;
	var end = chunkSize;
	var cancel = false;
	var stop_info = {};
	if (window.NodeList && !NodeList.prototype.forEach) {
		NodeList.prototype.forEach = Array.prototype.forEach;
	}
	var options = 'top=10, left=10, width=600, height=600, status=no, menubar=no, toolbar=no, resizable=no';
	window.onload = function() {
		var chk_all = document.getElementById("check_all");
		chk_all.addEventListener("click", function () {
			var chks = document.querySelectorAll(".input_chk");
			for (var a = 0; a < chks.length; a++) {
				chks[a].firstChild.checked = true;
			}
		});
		
		var btns = document.querySelectorAll("button");
		
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
											lastModified: files[index]['lastModified'],
											divUpload: files[index]['size'] > chunkSize ? true : false,
											GUID: guid(),
											path: '',
											first: true,
											last: false,
											complete: false
										}
									);
									var li = document.createElement("li");
									li.className = "file";
									
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

							ol.style.height = String(files.length * 21) + "px";
							
							// checkbox (use for delete)
//							var chks = document.querySelectorAll("ul");
//							var chksLen = chks.length;
//							chks.forEach(function(chk) {
//
//								chk.addEventListener("click", function() {
//									switch (chk.id) {
//										case "fname0":
//											chk.parentNode.firstChild.firstChild.checked = true;
//											break;
//										case "fname1":
//											chk.parentNode.firstChild.firstChild.checked = true;
//											break;
//									}
//
//
//								});
//							});

						}
						input.click();	// click 호출을 change 이벤트 이후에 적용(이전에 하면 IE에서 동작x => why?)
						break;
					case "submit":
						if (cancel) {
							var resume = confirm("이어올리기? (취소 시 처음부터)");
							if (resume) {
								
								start = stop_info['start'];
								end = start + chunkSize >= fileList[stop_info['fileIndex']]['size'] ? fileList[stop_info['fileIndex']]['size'] : start + chunkSize;
								console.log(start, end); 
							} else {
								cancel = false;
							}
						}
						var progressPop = window.open("./progress.html", "_blank", options);						
						
						if ((navigator.appName == 'Netscape' &&
							navigator.userAgent.toLowerCase().indexOf('trident') != -1) ||
							(navigator.userAgent.toLowerCase().indexOf("msie") != -1)) {  // ie -> winPop.onload = new function()
							progressPop.onload = new function() {
								popup(progressPop, fileList);
								upload(start, end, chunkSize, fileList[0]['extension'], fileList[0]['divUpload'], fileList[0]['originalName'], fileList[0]['GUID'],
									fileList[0]['first'], fileList[0]['last'], 0, fileList[0]['size'], fileList[0]['name'], progressPop, fileList[0]['complete']);
							}
						} else {
							progressPop.onload = function() {
								popup(progressPop, fileList);
								upload(start, end, chunkSize, fileList[0]['extension'], fileList[0]['divUpload'], fileList[0]['originalName'], fileList[0]['GUID'],
									fileList[0]['first'], fileList[0]['last'], 0, fileList[0]['size'], fileList[0]['name'], progressPop, fileList[0]['complete']);
							}
						}
						break;
					case "delete":
						var chks = document.querySelectorAll(".input_chk");
						var file_list = document.getElementById("file_list");
						
						for (var k = chks.length - 1; k >= 0; k--) {
							if (chks[k].firstChild.checked == true) {
								file_list.removeChild(chks[k].parentNode.parentNode);
								fileList.splice(k, 1);
							}
						}
						break;
					case "deleteAll":
						var del_conf = confirm("전체 항목을 제거하시겠습니까?");
						var chks = document.querySelectorAll(".input_chk");
						var file_list = document.getElementById("file_list");
						
						if (del_conf) {
							
							while (file_list.firstChild) {
								file_list.removeChild(file_list.firstChild);
								
							}
							fileList.splice(0);
						} else {
							for (var l = 0; l < chks.length; l++) {
								chks[l].firstChild.checked = true;
							}
						}
						break;

				}
			});
		});
	}
})();