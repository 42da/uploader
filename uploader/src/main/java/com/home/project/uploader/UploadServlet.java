package com.home.project.uploader;

import java.io.*;
import java.nio.charset.Charset;

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
		String saveDirectory = "C:\\uploader\\upload_path\\";
		String tempDirectory = "C:\\uploader\\temp\\";
//		String saveDirectory = "D:\\upload_path\\";
//		String tempDirectory = "D:\\temp\\";
		String path = "";
		
		int maxSize = 1024 * 1024 * 1000;
		String encoding = "UTF-8";

//		MultipartRequest multi = new MultipartRequest(request, tempDirectory, maxSize, encoding, new DefaultFileRenamePolicy());
		MultipartRequest multi = new MultipartRequest(request, tempDirectory, maxSize, encoding);

		Enumeration files = multi.getFileNames();
		String item = (String) files.nextElement();
		String blob = multi.getFilesystemName(item);		// chunk file
		
		long start = Long.parseLong(multi.getParameter("start"));
		String ext = multi.getParameter("extension");
		boolean divUpload = Boolean.parseBoolean(multi.getParameter("divUpload"));
		String ofileName = multi.getParameter("originalName");
		String guid = multi.getParameter("guid");
		boolean first = Boolean.parseBoolean(multi.getParameter("first"));
		boolean last = Boolean.parseBoolean(multi.getParameter("last"));
		int fullSize = Integer.parseInt(multi.getParameter("fullSize"));
//		String name = multi.getParameter("name");
		
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
			FileInputStream tmp_path = new FileInputStream(tempDirectory + guid + ".txt");
			int ch = 0;
			while((ch = tmp_path.read()) != -1) path += ch;		// path setting
			
			tmp_path.close();
		}
		
		// write

		RandomAccessFile main_file = null;
		FileOutputStream fos = null;
		BufferedOutputStream bos = null;
		FileInputStream chunk_file = null;
		BufferedInputStream bis = null;
		
		try {
			File file = new File(path);
			main_file = new RandomAccessFile(file, "rw");
			System.out.println(main_file.getFilePointer());
			main_file.seek(start);
			System.out.println(main_file.getFilePointer());
			fos = new FileOutputStream(main_file.getFD());
			bos = new BufferedOutputStream(fos);
			
			chunk_file = new FileInputStream(tempDirectory + blob);
			bis = new BufferedInputStream(chunk_file);
			
			int data = 0;
			int bufferLength = 8 * 1024;
			byte[] buf = new byte[bufferLength];		// 1024 or 8 * 1024
			
//			while((data = chunk_file.read()) != -1) {		// .read() 하는 순간 다음 byte 읽음
//				main_file.write(chunk_file.read());			// data를 써야 하는데 다음 byte가 써짐.
//				
//				main_file.write(data);
//			}
			while ((data = chunk_file.read(buf)) != -1) {
				main_file.write(buf, 0, data);
//				bos.write(buf, 0, data);
			}
		} catch(Exception ex) {
			System.out.println(ex.toString());
		} finally {
			bis.close();
			chunk_file.close();
			
			bos.close();
			fos.close();
			main_file.close();
		}
		
		// last chunk?
		if (divUpload && last) {
			
			File tmp_path = new File(tempDirectory + guid + ".txt");
			File tmp_file = new File(tempDirectory + blob);
			tmp_path.delete();
			tmp_file.delete();
			
			response.setContentType("text/plain");
			response.setCharacterEncoding("utf8");
			PrintWriter out = response.getWriter();
			out.println(path);
		} else if (!divUpload) {
			File tmp_path = new File(tempDirectory + guid + ".txt");
			File tmp_file = new File(tempDirectory + ofileName);
			tmp_path.delete();
			tmp_file.delete();
			
			response.setContentType("text/plain");
			response.setCharacterEncoding("utf8");
			PrintWriter out = response.getWriter();
			out.println(path);
		}
	    
//		doGet(request, response);
	}
}
		