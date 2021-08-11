package com.home.project.uploader;

import java.io.*;

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
		System.out.println("\npost");
		request.setCharacterEncoding("utf-8");
		String saveDirectory = "D:\\upload_path\\";
		String path = "";
		String tempDirectory = "D:\\temp\\";
		
		int maxSize = 1024 * 1024 * 5;
		String encoding = "UTF-8";

//		MultipartRequest multi = new MultipartRequest(request, tempDirectory, maxSize, encoding, new DefaultFileRenamePolicy());
		MultipartRequest multi = new MultipartRequest(request, tempDirectory, maxSize, encoding);

//		Enumeration files = multi.getFileNames();
//		String item = (String) files.nextElement();
////		String ofileName = multi.getOriginalFileName(item);
//		String blob = multi.getFilesystemName(item);
		
		int start = Integer.parseInt(multi.getParameter("start"));
		boolean divUpload = Boolean.parseBoolean(multi.getParameter("divUpload"));
		String ofileName = multi.getParameter("originalName");
		String guid = multi.getParameter("guid");
		boolean first = Boolean.parseBoolean(multi.getParameter("first"));
		boolean last = Boolean.parseBoolean(multi.getParameter("last"));
		int fullSize = Integer.parseInt(multi.getParameter("fullSize"));
		String name = multi.getParameter("name");
		
		System.out.println(start);
		System.out.println(divUpload);
		System.out.println(ofileName);
		System.out.println(guid);
		System.out.println(first);
		System.out.println(last);
		System.out.println(fullSize);
		System.out.println(name);
//		int size = ((Long) jsonObj.get("size")).intValue();
//		String guid = (String) jsonObj.get("GUID");
//		boolean divUpload = (Boolean) jsonObj.get("divUpload"); 
		
//		System.out.print("fileInfo : ");
//		System.out.println(fileInfo);
		
		/* json parsing try 밖에서 쓰는 방법*/
//		JSONObject jsonObj = null;
		
//		try {
//			JSONParser parser = new JSONParser();
//			Object obj = parser.parse(fileInfo);
//			jsonObj = (JSONObject) obj;	
//		} catch(Exception e) {
//			
//		}
		/*------------------------------*/
//		boolean first = (Boolean) jsonObj.get("first");
//		boolean last = (Boolean) jsonObj.get("last");
//		String ofileName = (String) jsonObj.get("originalName");
//		String name = (String) jsonObj.get("name");
//		int size = ((Long) jsonObj.get("size")).intValue();
//		String guid = (String) jsonObj.get("GUID");
//		boolean divUpload = (Boolean) jsonObj.get("divUpload"); 
		
		if (first) {
			System.out.println("first");	
			
			RandomAccessFile main_file = new RandomAccessFile(saveDirectory + ofileName, "rw");
			main_file.setLength(fullSize);
			main_file.close();
			
			File file = new File(tempDirectory + guid + ".txt");
			FileOutputStream tmp_path = new FileOutputStream(file);
			tmp_path.write(saveDirectory.getBytes());
			tmp_path.close();

			path = saveDirectory;

		} else {
			FileInputStream tmp_path = new FileInputStream(tempDirectory + guid + ".txt");
			int i = 0;
			while((i = tmp_path.read()) != -1) {
				path = Integer.toString(i);
			}
			tmp_path.close();
		}
		System.out.println("first complete");
		// write
		RandomAccessFile main_file = new RandomAccessFile(path + ofileName, "rw");
		main_file.seek(start);
		
		FileInputStream chunk_file = new FileInputStream(tempDirectory + name);			// where is blob file
		int data = 0;
		while((data = chunk_file.read()) != -1) {
			main_file.write(data);
		}
		main_file.close();
		chunk_file.close();
		
		System.out.println("write complete");
		// last chunk?
		if (divUpload && last) {
			File tmp_path = new File(tempDirectory + guid + ".txt");
			tmp_path.delete();
			response.setContentType("text/plain");
			response.setCharacterEncoding("utf8");
			PrintWriter out = response.getWriter();
			out.println(path);
		} else if (!divUpload) {
			File tmp_path = new File(tempDirectory + guid + ".txt");
			tmp_path.delete();
			response.setContentType("text/plain");
			response.setCharacterEncoding("utf8");
			PrintWriter out = response.getWriter();
			out.println(path);
		}
		
		
//		boolean divUpload = "1".equals(jsonObj.get("divUpload")); // jsonObj.get(divUpload): string, jsonObj.get(first): boolean => ??
		
//		Enumeration files = multi.getFileNames();
//		String item = (String) files.nextElement();
//		String ofileName = multi.getOriginalFileName(item);


//			if (!divUpload) {
//				
//				String fileName = multi.getFilesystemName(item);
//				
//				FileInputStream temp_file = new FileInputStream(tempDirectory + ofileName);
//				FileOutputStream main_file = new FileOutputStream(saveDirectory + ofileName);
//				int i = 0;
//				while((i = temp_file.read()) != -1) {
//					main_file.write(i);
//				}
//				temp_file.close();
//				main_file.close();
//				response.setContentType("text/plain");
//				response.setCharacterEncoding("utf8");
//				PrintWriter out = response.getWriter();
//				out.println(saveDirectory);
//				System.out.println("!divupload");
//				
//			} else {
//				boolean first = "1".equals(jsonObj.get("first"));
//				boolean last = "1".equals(jsonObj.get("last"));
//				if (first) {
//					int size = ((Long) jsonObj.get("size")).intValue();
//					String guid = (String) jsonObj.get("GUID");
//					
//					RandomAccessFile guid_file = new RandomAccessFile(tempDirectory + guid + ".txt", "rw");
//					guid_file.writeChars(guid);
//					
//					String blob = multi.getFilesystemName(item);
//					FileInputStream chunk_file = new FileInputStream(tempDirectory + blob);
//					
//					RandomAccessFile main_file = new RandomAccessFile(saveDirectory + ofileName, "rw");
//					main_file.setLength(size);
//					
//					guid_file.close();
//					chunk_file.close();
//					main_file.close();
//					
//					response.setContentType("text/plain");
//					response.setCharacterEncoding("utf8");
//					PrintWriter out = response.getWriter();
//					out.println("uploading");
					
//				} else if (last) {
//					
//				} else {
//					
//				}
//				
//			}
		
		
//		try {
//			JSONParser parser = new JSONParser();
//			Object obj = parser.parse(fileInfo);
//			JSONObject jsonObj = (JSONObject) obj;
//			
//			String guid = (String) jsonObj.get("GUID");
//			System.out.println(guid);
//			int size = ((Long) jsonObj.get("size")).intValue();	// simple json => long으로 리턴
//			System.out.println(size);
//			String fileName = (String) jsonObj.get("name");
//			String extension = (String) jsonObj.get("extension");
//			Enumeration files = multi.getFileNames();
//			String item = (String) files.nextElement();
//			String ofileName = multi.getOriginalFileName(item);
//			String blob = multi.getFilesystemName(item);
//			System.out.println(fileName);
//			System.out.println(extension);
//			System.out.println(tempDirectory + fileName + extension);
//			
//			FileInputStream chunk_file = new FileInputStream(tempDirectory + blob);
//
//			RandomAccessFile main_file = new RandomAccessFile(saveDirectory + fileName + extension, "rw");
//			
//			main_file.setLength(size);
//			
//			int i = 0;
//			while((i = chunk_file.read()) != -1) {
//				main_file.write(i);
//			}
//			chunk_file.close();
//			main_file.close();
//		} catch (Exception e) {
//			System.out.println("fail");
//		}
		
		
//		byte[] byteArray = FileUtils.readFileToByteArray(new File(tempDirectory + fileName));
//		FileUtils.writeByteArrayToFile(new File(saveDirectory + fileName), byteArray, true); // fileUtil 이어 쓰기 (마지막 true)
//		while (files.hasMoreElements()) {
//			String item = (String) files.nextElement();
//			String ofileName = multi.getOriginalFileName(item);
//			String fileName = multi.getFilesystemName(item);
			
//			System.out.println(item);
//			System.out.println(ofileName);
//			System.out.println(fileName);
			
			// file 쓰기
			
//			byte[] byteArray = FileUtils.readFileToByteArray(new File(tempDirectory + fileName));
//			FileUtils.writeByteArrayToFile(new File(saveDirectory + fileName), byteArray, true); // fileUtil 이어 쓰기 (마지막 true)
//		}
//		response.setContentType("text/plain");
//		response.setCharacterEncoding("utf8");
//		PrintWriter out = response.getWriter();
//		out.println(saveDirectory);
		

	    
//		doGet(request, response);
	}

}
