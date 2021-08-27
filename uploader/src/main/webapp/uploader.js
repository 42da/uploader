(function() {
	var fileList = [];

//	var chunkSize = 10;	

	var chunkSize = 1024 * 1024 * 5;	// 1024 * 1024 * 5 하면 차이남 -> formdata의 다른 item(key, value)도 포함되어있기 때문

	var start = 0;
	var end = chunkSize;
	var cancel = false;
	var stop_info = {};
	var options = 'top=10, left=10, width=600, height=600, status=no, menubar=no, toolbar=no, resizable=no, scrollbars=1';
	
	if (window.NodeList && !NodeList.prototype.forEach) {
		NodeList.prototype.forEach = Array.prototype.forEach;
	}
	
	function upload(start, end, chunkSize, extension, divUpload, originalName, guid, first, last, fileIndex, fullSize, curWindow, complete) {
		var curFile = fileList[fileIndex];

		if (complete) {		// 이미 완료한 업로드
			if (++fileIndex == fileList.length) {
				alert("이미 완료된 업로드 입니다.");
				return;
			}
			curFile = fileList[fileIndex];
			upload(start, end, chunkSize, curFile['extension'], curFile['divUpload'], curFile['originalName'],
						curFile['GUID'], curFile['first'], curFile['last'],
						fileIndex, curFile['size'], curWindow, curFile['complete']);
			return;
		}
		
		var cancel_btn = curWindow.document.getElementById("cancel");
		
		cancel_btn.onclick = function() {
			cancel = true;
		}
		if (cancel) {
			stop_info['GUID'] = guid;
			stop_info['path'] = curFile['path'];
			stop_info['fileIndex'] = fileIndex;
			stop_info['start'] = start;
			
			curWindow.close();
			return;
		}

		var formData = new FormData();	// formData 초기화(IE에서는 FormData.set, FormData.delete 호환 안됨.)
		var xhr = new XMLHttpRequest();

		xhr.open('POST', '/uploader/UploadServlet');
		if (divUpload) formData.append('file', curFile['obj'].slice(start, end), guid);
		else formData.append('file', curFile['obj'], guid);
		
		formData.append('start', start);
		formData.append('extension', extension);
		formData.append('divUpload', divUpload);
		formData.append('originalName', originalName);
		formData.append('GUID', guid);
		formData.append('first', first);
		formData.append('last', last);
		formData.append('fullSize', fullSize);
		formData.append('mode', 'upload');
		
		xhr.onreadystatechange = function() {
			if (xhr.readyState === xhr.DONE) {
				if (xhr.status === 0 || (xhr.status >= 200 && xhr.status < 400)) { // In local files, status is 0 upon success in Mozilla Firefox
					if (!curFile['path']) curFile['path'] = xhr.responseText;
					
					if (!divUpload || last) {
						upDownComplete(curFile['originalName'], "upload");
						curFile['complete'] = true;
						
						stop_info = {};				// upload 완료시 취소 정보 초기화
						if (++fileIndex == fileList.length) return;
						else {
							curFile = fileList[fileIndex];
							start = 0;
							end = chunkSize;
						}

					} else {
						start = end;
						end = start + chunkSize;
						curFile['first'] = false;
						if (end >= fullSize) {
							end = fullSize;
							curFile['last'] = true;
						}
					}

					upload(start, end, chunkSize, curFile['extension'], curFile['divUpload'], curFile['originalName'],
						curFile['GUID'], curFile['first'], curFile['last'],
						fileIndex, curFile['size'], curWindow, curFile['complete']);
				}
			}
		}
		xhr.upload.onprogress = function() {

			if (divUpload) var ratio = roundToOne((end / fullSize) * 100);		// e.loaded vs end => e.loaded: formdata의 다른 item 까지 계산하므로 안됨.
			else var ratio = 100;

//			var comp_cnt = 0;
//			for (var c = 0; c < fileList.length; c++) {
//				if (fileList[c]['complete']) comp_cnt++;
//				else break;
//			}
			
			var total = curWindow.document.getElementById("progress_bar_all");
			
			var total_ratio = ratio == 100 ? roundToOne(((fileIndex + 1) / fileList.length) * 100) : roundToOne((fileIndex + (ratio/100)) / fileList.length * 100);
//			var total_ratio = ratio == 100 ? roundToOne(((fileIndex + 1) / fileList.length) * 100) : roundToOne((fileIndex - comp_cnt + (ratio / 100)) / (fileList.length - comp_cnt) * 100);
			total.style.width = total_ratio + '%';
			total.innerHTML = total_ratio + '% complete';

			var progress = curWindow.document.getElementById("progress_bar" + fileIndex);
			progress.style.width = ratio + '%';
			progress.innerHTML = ratio + '% complete';

			if (ratio == 100 && fileIndex + 1 == fileList.length) {
				curWindow.close();	// 마지막 파일 업로드 후 팝업창 닫기
			}
			
		}
		xhr.send(formData);
	}
	function checkAll() {
		var chks = document.querySelectorAll(".input_chk");
		var checked = this.checked;
		chks.forEach(function(chk) {
			chk.firstChild.checked = checked;
		});
	}
	function createFileList(filename, filesize, idx) {
		var li = document.createElement("li");
		li.className = "file";

		var ul = document.createElement("ul");

		var inputChkLi = document.createElement("li");
		inputChkLi.className = "input_chk";

		var inputChk = document.createElement("input");
		inputChk.id = "chk_file_" + idx;
		inputChk.type = "checkbox";
		inputChk.listvalue = String(idx);

		inputChkLi.appendChild(inputChk);

		var fname = document.createElement("li");
		fname.className = "fname";

		var fnameSp = document.createElement("span");
		fnameSp.title = filename;
		fnameSp.innerText = filename;
		fnameSp.style.textAlign = "left";

		fname.appendChild(fnameSp);

		var fsize = document.createElement("li");
		fsize.className = "fsize";

		var fsizeSp = document.createElement("span");
		fsizeSp.title = String(filesize) + " bytes";
		fsizeSp.innerText = String(filesize) + " bytes";
		fsizeSp.style.textAlign = "right";

		fsize.appendChild(fsizeSp);

		ul.appendChild(inputChkLi);
		ul.appendChild(fname);
		ul.appendChild(fsize);
		li.appendChild(ul);
		return li;
		
	}
	function addFile(event) {
		if (event.type == "drop") {
			event.preventDefault();
			var files = event.dataTransfer.files;
		} else var files = this.files;

		var ol = document.getElementById("file_list_up");
		ol.style.height = String(files.length * 21) + "px";
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
						extension: '.' + files[index]['name'].split('.').pop(),
						chunksize: files[index].slice(start, chunkSize)['size'],
						divUpload: files[index]['size'] > chunkSize ? true : false,
						GUID: guid(),
						path: '',
						first: true,
						last: false,
						complete: false
					}
				);
				ol.appendChild(createFileList(files[index]['name'], files[index]['size'], index));
			}
		}
	}
	function deleteFile(upDown, all) {
		var mode = upDown ? "up" : "down";
		var allChk = true;		// 전체선택 상태
		var chk_all = document.getElementById("check_all");
		var chks = document.querySelectorAll(".input_chk");
		var file_list = document.getElementById("file_list_" + mode);
		if (!all) {
			for (var k = 0; k < chks.length; k++) {
				if (!chks[k].firstChild.checked) {
					allChk = false;
					break;
				}
			}
		}
		if (allChk || all) {
			var delAll_conf = confirm("전체 항목을 제거하시겠습니까?");
			if (delAll_conf) {
				while (file_list.firstChild) {
					file_list.removeChild(file_list.firstChild);
				}
				fileList.splice(0);
			} else {
				for (var l = 0; l < chks.length; l++) {
					chks[l].firstChild.checked = true;
				}
			}
		} else {
			var del_conf = confirm("선택한 항목을 제거하시겠습니까?");
			if (del_conf) {
				for (var k = chks.length - 1; k >= 0; k--) {
					if (chks[k].firstChild.checked == true) {
						file_list.removeChild(chks[k].parentNode.parentNode);
						fileList.splice(k, 1);
					}
				}
			}
		}
		chk_all.checked = false;
	}
	function popup(popWindow) {
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
		}
		createBar("_all", "전체 진행률");
		
		for (var idx = 0; idx < fileList.length; idx++) {
			if (fileList[idx]['complete']) continue;
			createBar(idx, fileList[idx]['originalName']);
		}
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
	function roundToOne(num) {		// 반올림
		return +(Math.round(num + "e+1") + "e-1");
	}
	function fileExist() {
		if (fileList.length == 0) return false;
		else return true;
	}
	function upDownComplete(fileName, mode) {
		var loaded_list = document.createElement("ul");
		loaded_list.className = "completed_list";

		var loaded_file = document.createElement("li");
		loaded_file.className = "completed_file";
		loaded_file.style.marginTop = "20px";
		
		if (mode == "download") loaded_file.innerHTML = fileName + " 다운로드 완료";
		else loaded_file.innerText = fileName + " 업로드 완료";
		loaded_list.appendChild(loaded_file);
		loaded_list.style.width = "768px";
		loaded_list.style.textAlign = "right";

		document.body.querySelector("." + mode + "_gray").appendChild(loaded_list);
	}
	function resumeUpload() {
		var resume = false;
		var curFile = fileList[stop_info['fileIndex']];
		for (var i = 0; fileList.length; i++) {
			if (stop_info['path'] == fileList[i]['path']) {
				resume = confirm("이어올리기? (취소 시 처음부터)");
				break;
			}
		}
		if (resume) {		// 이어서 받을 경우 재시작 포인트만 설정
			start = stop_info['start'];
			end = start + chunkSize >= curFile['size'] ? curFile['size'] : start + chunkSize;
			curFile['GUID'] = stop_info['GUID'];
			curFile['path'] = stop_info['path'];
		} else {			// 다시 올릴 경우 guid 재생성 및 first, last 설정 변경
			start = 0;
			end = start + chunkSize;
			curFile['GUID'] = guid();
			curFile['path'] = '';
			curFile['first'] = true;
			curFile['last'] = false;
		}

		cancel = false;
	}
	
	function download(curWindow, fileIndex) {
		var submitBtn = document.getElementById('download_form');
		submitBtn.submit();
		
		var req = setInterval(function() {
			var formData = new FormData();
			var xhr = new XMLHttpRequest();

			formData.append('mode', 'progress');
			formData.append('fullSize', fileList[fileIndex]['size']);
			formData.append('GUID', fileList[fileIndex]['GUID']);

			xhr.open('POST', '/uploader/UploadServlet');
			xhr.onload = function() {

				var curProgress = Number(xhr.responseText);
				if (xhr.responseText != -1) {		// 시점차이때문에 응답꼬일시 처리 필요

					var total = curWindow.document.getElementById("progress_bar_all");
					var ratio = roundToOne(curProgress / fileList[fileIndex]['size'] * 100);
					var total_ratio = ratio;

					total.style.width = total_ratio + '%';
					total.innerHTML = total_ratio + '% complete';

					var progress = curWindow.document.getElementById("progress_bar" + fileIndex);
					progress.style.width = ratio + '%';
					progress.innerHTML = ratio + '% complete';
				}

				if (curProgress == fileList[fileIndex]['size']) {		
					clearInterval(req);
					curWindow.close();	// 마지막 파일 업로드 후 팝업창 닫기
					upDownComplete(fileList[fileIndex]['originalName'], "download");
				}
			}
			xhr.send(formData);
		}, 10);
	}
	function addInputToForm(form, name, value, idx) {			// 여러개 파일 다운로드 시 input name 속성에 index 부여
		var input = document.createElement("input");
		if (typeof idx == "number") input.name = name + idx;
		else input.name = name;
		input.defaultValue = value;
		
		input.style.display = "none";
		form.appendChild(input);
	}
	window.onload = function() {
//		var downFile = "tmp.txt";	// 25
//		var downFile = "The import cannot be resolved issue 21.08.08.txt";	 // 334
//		var downFile = "개발명세서_정기평_21.08.02.docx";   // 26988
//		var downFile = "개발명세서_정기평_21.08.12.docx";   // 154500
//		var downFile = "KakaoTalk_20210805_152531256_01.jpg";	// 6739129
		var downFile = "dummyfile.txt";	// 20000000
//		var downFile = "dummy200M.txt";		// 200000000
		
		var mode_btn = document.querySelector(".mode");
		var mode_upload = document.querySelector(".upload_gray");
		var mode_download = document.querySelector(".download_gray");
		var clk = true;
		
		mode_btn.addEventListener('click', function() {
			clk = clk ? false : true;
			if (clk) {
				mode_btn.innerHTML = "upload";
				mode_download.style.display = "none";
				mode_upload.style.display = "";
			} else {	// 버튼 계속 클릭할 경우 다운로드 리스트 계속 늘어남
				
				var downForm = document.createElement("form");
				downForm.id = "download_form";
				downForm.method = "post";
				downForm.action = "UploadServlet";
				downForm.target = "downloadframe";
				downForm.enctype = "multipart/form-data";

				var iframe = document.createElement("iframe");
				iframe.name = "downloadframe";
				iframe.style.display = "none";

				mode_btn.innerHTML = "download";
				mode_upload.style.display = "none";
				mode_download.style.display = "";
				fileList.push(
					{
						size: 20000000,
						originalName: downFile,
						path: "D:\\download_temp\\" + downFile,
						GUID: guid()
					}
				);
				
				var ol = document.getElementById("file_list_down");
				if (fileList.length == 1) {
					ol.style.height = String(fileList.length * 21) + "px";
					
					addInputToForm(downForm, "path", fileList[0]['path'], 0);
					addInputToForm(downForm, "originalName", fileList[0]['originalName'], 0);
					addInputToForm(downForm, "GUID", fileList[0]['GUID']);
					addInputToForm(downForm, "fullSize", fileList[0]['size'], 0);
					addInputToForm(downForm, "mode", "download");
					ol.appendChild(createFileList(fileList[0]['originalName'], fileList[0]['size'], 0));

					ol.parentNode.appendChild(downForm);
					ol.parentNode.appendChild(iframe);
					
				} else fileList.pop();
				
			}
		});
		
		// 전체 파일 체크 or 해제
		var chk_all = document.getElementById("check_all");
		chk_all.addEventListener("click", checkAll);

		// file drag & drop
		var dragZone = document.querySelector(".uploadbox");		
		dragZone.ondrop = addFile;
		dragZone.ondragover = function(e) {
			e.preventDefault();
		}
		
		var btns = document.querySelectorAll("button");
		btns.forEach(function(btn) {
			btn.addEventListener("click", function() {
				switch (btn.id) {
					case "add":
						var input = document.getElementById("file_add");
						
						input.click();	// click 호출을 change 이벤트 이후에 적용(이전에 하면 IE에서 동작x, 첫 파일추가 때 동작x => why?)
						input.onchange = addFile;
						break;
						
					case "submit":
						if (!fileExist()) {
							alert("no file");
							return;
						}
						
						if (cancel) {
							resumeUpload();
						}
						var progressPop = window.open("./progress.html", "_blank", options);
						var start_file = fileList[0];
						if ((navigator.appName == 'Netscape' &&
							navigator.userAgent.toLowerCase().indexOf('trident') != -1) ||
							(navigator.userAgent.toLowerCase().indexOf("msie") != -1)) {  // ie -> winPop.onload = new function()
							progressPop.onload = new function() {
								popup(progressPop);
								upload(start, end, chunkSize, start_file['extension'], start_file['divUpload'], start_file['originalName'], start_file['GUID'],
									start_file['first'], start_file['last'], 0, start_file['size'], progressPop, start_file['complete']);
							}
						} else {
							progressPop.onload = function() {
								popup(progressPop);
								upload(start, end, chunkSize, start_file['extension'], start_file['divUpload'], start_file['originalName'], start_file['GUID'],
									start_file['first'], start_file['last'], 0, start_file['size'], progressPop, start_file['complete']);
							}
						}
						break;
					case "delete":
						if (!fileExist()) {
							alert("no file");
							return;
						}
						deleteFile(clk);
						break;
						
					case "deleteAll":
						if (!fileExist()) {
							alert("no file");
							return;
						}					
						deleteFile(clk, true);
						break;
					case "download":
						var progressPop = window.open("./progress.html", "_blank", options);
						
						if ((navigator.appName == 'Netscape' &&
							navigator.userAgent.toLowerCase().indexOf('trident') != -1) ||
							(navigator.userAgent.toLowerCase().indexOf("msie") != -1)) {  // ie -> winPop.onload = new function()
							
							progressPop.onload = new function() {
								popup(progressPop);
								download(progressPop, 0);
							}
						} else {
							progressPop.onload = function() {
								popup(progressPop);
								download(progressPop, 0);
							}
						}
						break;		
				}
			});
		});	
	}
}());