package com.home.project.uploader;

import java.io.*;
import java.net.URLConnection;
import java.nio.charset.Charset;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.ServletInputStream;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.util.*;
import java.awt.print.PrinterAbortException;

import com.oreilly.servlet.multipart.DefaultFileRenamePolicy;
import com.oreilly.servlet.MultipartRequest;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;

import org.apache.commons.io.FileUtils;
import org.apache.commons.fileupload.MultipartStream;
/*
 * Servlet implementation class UploadServlet
 */
@WebServlet("/UploadServlet")
public class UploadServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public UploadServlet() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		response.getWriter().append("Served at: ").append(request.getContextPath());
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub

		request.setCharacterEncoding("utf-8");
//		String saveDirectory = "C:\\uploader\\upload_path\\";
//		String tempDirectory = "C:\\uploader\\temp\\";
		String saveDirectory = "D:\\upload_path\\";
		String tempDirectory = "D:\\temp\\";
		String downDirectory = "D:\\download_temp\\";
		String path = "";
		
		int maxSize = 1024 * 1024 * 1024;
		String encoding = "UTF-8";
		int data = 0;
		int bufferLength = 8 * 1024;
		byte[] buf = new byte[bufferLength];		// 1024 or 8 * 1024
//		MultipartRequest multi = new MultipartRequest(request, tempDirectory, maxSize, encoding, new DefaultFileRenamePolicy());
		MultipartRequest multi = new MultipartRequest(request, tempDirectory, maxSize, encoding);

//		Enumeration files = multi.getFileNames();
//		String item = (String) files.nextElement();
//		String blob = multi.getFilesystemName(item);		// chunk file
		
		String mode = multi.getParameter("mode");
		String guid = multi.getParameter("GUID");
		
		if (mode.equals("download")) {

			path = multi.getParameter("path0");
			String ofileName = multi.getParameter("originalName0");
			ofileName = new String(ofileName.getBytes("UTF-8"), "ISO-8859-1");		// 크롬 한글 깨짐 (브라우저마다 해결 방식 다름)
			
//			String mimetype = URLConnection.guessContentTypeFromName(path);

//			response.setContentType(mimetype);
			response.setContentType("application/octet-stream; charset=UTF-8");
			response.setHeader("Content-Disposition", "attachment; filename=" + ofileName);
			response.setHeader("Content-Transfer-Encoding", "binary");
//			response.setHeader("Content-Length", "25");
			
			File pfile = null;
			FileOutputStream fos = null;
			File file = null;
			FileInputStream fis = null;
			BufferedInputStream bis = null;
			BufferedOutputStream bos = null;
//			ServletOutputStream sos = null;
			try {
				
				
				file = new File(path);
				fis = new FileInputStream(file);
				bis = new BufferedInputStream(fis);
				
//				sos = response.getOutputStream();
				bos = new BufferedOutputStream(response.getOutputStream());
				int cur = 0;
				int writeData = 0;
				while ((writeData = fis.read(buf)) != -1) {
//					System.out.println(data);
					cur += writeData;
					bos.write(buf, 0, writeData);
					pfile = new File(downDirectory + guid +".txt");
					fos = new FileOutputStream(pfile);
					fos.write(Integer.toString(cur).getBytes());
					fos.close();
				}
				
			} catch(Exception ex) {
				ex.toString();
			} finally {
				
				bis.close();
				fis.close();
				bos.close();
				
			}
			
		} else if (mode.equals("progress")) {
			File file = null;
			FileReader fr = null;
			BufferedReader br = null;
//			FileInputStream fis = null;
			response.setContentType("text/plain");
			response.setCharacterEncoding("utf8");
			PrintWriter out = response.getWriter();
			try {
				file = new File(downDirectory + guid + ".txt");
				fr = new FileReader(file);
				br = new BufferedReader(fr);
//				fis = new FileInputStream(file);
				String readData = "";
				String cur = "";
				
				while ((readData = br.readLine()) != null) cur = readData;
			
				System.out.println(cur);
				out.println(cur);
				br.close();
				fr.close();
//				fis.close();
				
			} catch(Exception ex) {
				out.println("0");
				ex.toString();
			} finally {
				
				
			}
//			response.setContentType("text/plain");
//			response.setCharacterEncoding("utf8");
//			PrintWriter out = response.getWriter();
//			out.println("do something about progress");
//			System.out.println("do something about progress");
		} else {
			long start = Long.parseLong(multi.getParameter("start"));
//			long end = Long.parseLong(multi.getParameter("end"));
			String ext = multi.getParameter("extension");
			boolean divUpload = Boolean.parseBoolean(multi.getParameter("divUpload"));
//			String ofileName = multi.getParameter("originalName");
//			String guid = multi.getParameter("guid");
			boolean first = Boolean.parseBoolean(multi.getParameter("first"));
			boolean last = Boolean.parseBoolean(multi.getParameter("last"));
			long fullSize = Long.parseLong(multi.getParameter("fullSize"));
//			String guidOld = multi.getParameter("guidOld");

			if (first) {
				RandomAccessFile main_file = null;
				FileOutputStream tmp_path = null;
				path = saveDirectory + guid + ext;

				try {
					main_file = new RandomAccessFile(path, "rw");
					main_file.setLength(fullSize);
					
					File file = new File(tempDirectory + guid + ".txt");
					tmp_path = new FileOutputStream(file);
					tmp_path.write(path.getBytes());
				} catch(Exception ex) {
					
				} finally {
					main_file.close();
					tmp_path.close();
				}		

			} else {
				FileInputStream tmp_path = null;
				try {
					File file = new File(tempDirectory + guid + ".txt");
					tmp_path = new FileInputStream(file);
					int ch = 0;
					while((ch = tmp_path.read()) != -1) path += (char)ch;		// path setting -> 형 변환 후 main_file.write() 안되던 오류 없어짐.
				} catch(Exception ex) {
					
				} finally {
					tmp_path.close();
				}

			}
			
//			if (guidOld.length() != 0 && first) {		// 취소 후 다시 업로드 할 때 기존 파일 삭제
//				String pathOld = "";
//				FileInputStream old_path = null;
//				File file = null;
//				File old_blob = null;
//				File old_file = null;
//				
//				try {
//					file = new File(tempDirectory + guidOld + ".txt");
//					old_path = new FileInputStream(file);
//					int ch = 0;
//					while((ch = old_path.read()) != -1) pathOld += (char)ch;		// old path setting
//					
//					old_blob = new File(tempDirectory + guidOld);
//					old_file = new File(pathOld);
	//
//				} catch (Exception ex) {
	//
//				} finally {
//					old_file.delete();
//					old_blob.delete();
//					old_path.close();
//					file.delete();
//				}
//			}
			
			// write
			File file = null;
			RandomAccessFile main_file = null;
			FileInputStream chunk_file = null;
			
			try {
				file = new File(path);
				main_file = new RandomAccessFile(file, "rw");

				main_file.seek(start);
				
				if (divUpload) chunk_file = new FileInputStream(tempDirectory + guid);
				else chunk_file = new FileInputStream(tempDirectory + guid);
				
				
			
				while ((data = chunk_file.read(buf)) != -1) {

					main_file.write(buf, 0, data);
					
				}
				
			} catch(Exception ex) {
				
				System.out.println(ex.toString());
			} finally {
				chunk_file.close();
				main_file.close();
			}
			
			// not divupload or last chunk 
			
			File tmp_path = null;
			File tmp_file = null;

			if (!divUpload || last) {
				try {
					tmp_path = new File(tempDirectory + guid + ".txt");
					tmp_file = new File(tempDirectory + guid);
				} catch(Exception ex) {
					
				} finally {
					tmp_path.delete();
					tmp_file.delete();
				}
			}
			if (first) {
				
				response.setContentType("text/plain");
				response.setCharacterEncoding("utf8");
				PrintWriter out = response.getWriter();
				out.println(path);
			}
			
		}
		

//		doGet(request, response);
	}
}
		